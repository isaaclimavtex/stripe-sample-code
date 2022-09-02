# A simple payment flow using Stripe

POC for a payment page using Stripe and Elements.

## Running the sample

1. Build the application

~~~
npm install
~~~

2. Set the environment variables

```
# Stripe keys (are found in Stripe dashboard)
STRIPE_PUBLISHABLE_KEY=pk_test_5...
STRIPE_SECRET_KEY=sk_test_51L...
STRIPE_WEBHOOK_SECRET=whsec_6d40...

# Stripe key for React front end
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51L...

# Environment variables
STATIC_DIR=../../client/vanillajs

REACT_APP_MAIN_URL=http://localhost:3000
```

3. Run the application

~~~
npm start
~~~

4. Go to [http://localhost:3000/](http://localhost:3000/)
