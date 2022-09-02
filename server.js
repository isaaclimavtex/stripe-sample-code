const express = require('express');
const app = express();
const { resolve } = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const users = require('./Users.js');
// Replace if using a different env file or config
require('dotenv').config({ path: './.env' });

// Check the dotenv file
if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.STRIPE_PUBLISHABLE_KEY ||
    !process.env.STATIC_DIR
) {
    console.log(
        'The .env file is not configured. Follow the instructions in the readme to configure the .env file. https://github.com/stripe-samples/subscription-use-cases'
    );
    console.log('');
    process.env.STRIPE_SECRET_KEY
        ? ''
        : console.log('Add STRIPE_SECRET_KEY to your .env file.');

    process.env.STRIPE_PUBLISHABLE_KEY
        ? ''
        : console.log('Add STRIPE_PUBLISHABLE_KEY to your .env file.');

    process.env.STATIC_DIR
        ? ''
        : console.log(
            'Add STATIC_DIR to your .env file. Check .env.example in the root folder for an example'
        );

    process.exit();
}

// Importing the stripe object
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
    appInfo: { // For sample support and debugging, not required for production:
        name: "stripe-samples/subscription-use-cases/fixed-price",
        version: "0.0.1",
        url: "https://github.com/stripe-samples/subscription-use-cases/fixed-price"
    }
});

// Use static to serve static assets.
app.use(express.static(process.env.STATIC_DIR));

// Use cookies to simulate logged in user.
app.use(cookieParser());

// Use JSON parser for parsing payloads as JSON on all non-webhook routes.
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

app.get('/', (req, res) => {
    const path = resolve(process.env.STATIC_DIR + '/register.html');
    res.sendFile(path);
});

// Return prices and products
app.get('/config', async (req, res) => {
    const prices = await stripe.prices.list({
        lookup_keys: ['basic_plan'],
        expand: ['data.product']
    });

    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        prices: prices.data,
    });
});

// Create customer and linking with the user using cookies
app.post('/create-customer', async (req, res) => {
    // Create a new customer object
    const customer = await stripe.customers.create({
        email: req.body.email,
    });

    // Save the customer.id in your database alongside your user.
    // We're simulating authentication with a cookie.
    res.cookie('customer', customer.id, { maxAge: 900000, httpOnly: true });
    users.addUser({name: req.body.email, customer_id: customer.id});

    res.send({ customer: customer });
});

// Create the subscription
app.post('/create-subscription', async (req, res) => {
    // Simulate authenticated user. In practice this will be the
    // Stripe Customer ID related to the authenticated user.
    const customerId = req.cookies['customer'];
    const user = users.getUser(customerId);

    // Create the subscription
    const priceId = req.body.priceId;

    try {
        if(user.subscription_status !== 'active') {
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{
                    price: priceId,
                }],
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'],
            });
            users.updateUser(customerId, 'subscription_id', subscription.id);
            users.updateUser(customerId, 'subscription_status', subscription.status);
            users.updateUser(customerId, 'price_id', priceId);

            res.send({
                subscriptionId: subscription.id,
                clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            });
        } else {
            res.send({msg: 'User already has subscription!'});
        }
    } catch (error) {
        return res.status(400).send({ error: { message: error.message } });
    }
});

// Return the invoice after the creation of subscription
app.get('/invoice-preview', async (req, res) => {
    const customerId = req.cookies['customer'];
    const priceId = process.env[req.query.newPriceLookupKey.toUpperCase()];

    const subscription = await stripe.subscriptions.retrieve(
        req.query.subscriptionId
    );

    const invoice = await stripe.invoices.retrieveUpcoming({
        customer: customerId,
        subscription: req.query.subscriptionId,
        subscription_items: [ {
            id: subscription.items.data[0].id,
            price: priceId,
        }],
    });

    res.send({ invoice });
});

// Delete the subscription given the subscription id
app.post('/cancel-subscription', async (req, res) => {
    // Cancel the subscription
    try {
        const deletedSubscription = await stripe.subscriptions.del(
            req.body.subscriptionId
        );

        res.send({ subscription: deletedSubscription });
    } catch (error) {
        console.log(error.message);
        return res.status(400).send({ error: { message: error.message } });
    }
});

app.post('/update-subscription', async (req, res) => {
    try {
        const subscription = await stripe.subscriptions.retrieve(
            req.body.subscriptionId
        );
        const updatedSubscription = await stripe.subscriptions.update(
            req.body.subscriptionId, {
                items: [{
                    id: subscription.items.data[0].id,
                    price: process.env[req.body.newPriceLookupKey.toUpperCase()],
                }],
            }
        );

        res.send({ subscription: updatedSubscription });
    } catch (error) {
        return res.status(400).send({ error: { message: error.message } });
    }
});

// Get the subscriptions list given a customer_id
app.get('/subscriptions', async (req, res) => {
    // Simulate authenticated user. In practice this will be the
    // Stripe Customer ID related to the authenticated user.
    const customerId = req.cookies['customer'];

    const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        expand: ['data.default_payment_method'],
    });

    res.json({subscriptions});
});


app.post('/cancel-recurring', async (req, res) => {
    // Simulate authenticated user. In practice this will be the
    // Stripe Customer ID related to the authenticated user.
    const subscription_id = req.body.subscription_id;
    try {
        const subscription = await stripe.subscriptions.update(subscription_id, {cancel_at_period_end: true});
        res.json({subscription})
    } catch(err) {
        return res.status(400).send({ error: { message: error.message } });
    }
});

app.post('/reactivate-recurring', async (req, res) => {
    // Simulate authenticated user. In practice this will be the
    // Stripe Customer ID related to the authenticated user.
    const subscription_id = req.body.subscription_id;

    try {
        let subscription = await stripe.subscriptions.retrieve(subscription_id);
        const price_id = users.getUserProperty(subscription.customer, 'price_id');
        subscription = await stripe.subscriptions.update(subscription_id, {
            cancel_at_period_end: false,
            proration_behavior: 'create_prorations',
            items: [{
                id: subscription.items.data[0].id,
                price: price_id,
            }]
        });
        res.json({subscription})
    } catch(err) {
        return res.status(400).send({ error: { message: error.message } });
    }
});

app.get('/user', (req, res) => {
    const customerId = req.cookies['customer'];
    res.json(users.getUser(customerId))
});


app.post('/webhook',
    bodyParser.raw({ type: 'application/json' }),
    async (req, res) => {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                req.header('Stripe-Signature'),
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(err);
            console.log(`⚠️  Webhook signature verification failed.`);
            console.log(
                `⚠️  Check the env file and enter the correct webhook secret.`
            );
            return res.sendStatus(400);
        }

        // Extract the object from the event.
        const dataObject = event.data.object;

        // Handle the event
        // Review important events for Billing webhooks
        // https://stripe.com/docs/billing/webhooks
        // Remove comment to see the various objects sent for this sample
        switch (event.type) {
            case 'invoice.payment_succeeded':
                if(dataObject['billing_reason'] == 'subscription_create') {
                    // The subscription automatically activates after successful payment
                    // Set the payment method used to pay the first invoice
                    // as the default payment method for that subscription
                    const subscription_id = dataObject['subscription']
                    const payment_intent_id = dataObject['payment_intent']

                    // Retrieve the payment intent used to pay the subscription
                    const payment_intent = await stripe.paymentIntents.retrieve(payment_intent_id);

                    try {
                        const subscription = await stripe.subscriptions.update(
                        subscription_id,
                        {
                            default_payment_method: payment_intent.payment_method,
                        },
                        );

                        console.log("Default payment method set for subscription:" + payment_intent.payment_method);
                    } catch (err) {
                        console.log(err);
                        console.log(`⚠️  Falied to update the default payment method for subscription: ${subscription_id}`);
                    }
                };

                break;
            case 'invoice.payment_failed':
                // If the payment fails or the customer does not have a valid payment method,
                //  an invoice.payment_failed event is sent, the subscription becomes past_due.
                // Use this webhook to notify your user that their payment has
                // failed and to retrieve new card details.
                break;
            case 'invoice.finalized':
                // If you want to manually send out invoices to your customers
                // or store them locally to reference to avoid hitting Stripe rate limits.
                break;
            case 'customer.subscription.created':
                res.cookie('subs_status', dataObject.status, { maxAge: 900000, httpOnly: true });
                users.updateUser(dataObject.customer,'subscription_status',dataObject.status);
                users.updateUser(dataObject.customer,'recurring',!dataObject.cancel_at_period_end);
                users.updateUser(dataObject.customer,'price_id',dataObject.items.data[0].price.id);
                console.log(dataObject);
                break;
            case 'customer.subscription.updated':
                res.cookie('subs_status', dataObject.status, { maxAge: 900000, httpOnly: true });
                users.updateUser(dataObject.customer,'subscription_status',dataObject.status);
                users.updateUser(dataObject.customer,'recurring',!dataObject.cancel_at_period_end);
                users.updateUser(dataObject.customer,'price_id',dataObject.items.data[0].price.id);
                break;
            case 'customer.subscription.deleted':
                if (event.request != null) {
                // handle a subscription cancelled by your request
                // from above.
                } else {
                // handle subscription cancelled automatically based
                // upon your subscription settings.
                }
                users.updateUser(dataObject.customer,'subscription_status',dataObject.status);
                users.updateUser(dataObject.customer,'recurring',false);
                res.cookie('subs_status', dataObject.status, { maxAge: 900000, httpOnly: true });
                break;
            case 'customer.subscription.trial_will_end':
                // Send notification to your user that the trial will end
                break;
            default:
            // Unexpected event type
        }
        res.sendStatus(200);
    }
);

app.listen(4242, () => console.log(`Node server listening on port http://localhost:${4242}!`));