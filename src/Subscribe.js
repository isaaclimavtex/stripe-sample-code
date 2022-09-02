import React, { useState } from 'react';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import {
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { Navigate, useLocation } from 'react-router-dom';

const PaymentForm = () => {
    const [messages, _setMessages] = useState('');

    // helper for displaying status messages.
    const setMessage = (message) => {
        _setMessages(`${messages}\n\n${message}`);
    }

    const stripe = useStripe();
    const elements = useElements();

    if (!stripe || !elements) {
        // Stripe.js has not loaded yet. Make sure to disable
        // form submission until Stripe.js has loaded.
        return '';
    }

    // When the subscribe-form is submitted we do a few things:
    //
    //   1. Tokenize the payment method
    //   2. Create the subscription
    //   3. Handle any next actions like 3D Secure that are required for SCA.
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Use card Element to tokenize payment details
        let { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${process.env.REACT_APP_MAIN_URL}/account`
            },
        });

        if(error) {
            // show error and collect new card details.
            setMessage(error.message);
            return;
        }
    }

    return (
        <form className="flex flex-col pt-3 md:pt-8" onSubmit={handleSubmit}>
            <div className="flex flex-col pt-4 mb-12">
                <PaymentElement className="flex-1 appearance-none border border-gray-300 
                w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base 
                focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" />
            </div>
            <button className="w-full px-4 py-2 
                text-base font-semibold text-center text-white transition 
                duration-200 ease-in bg-black shadow-md hover:text-black hover:bg-white 
                focus:outline-none focus:ring-2">
                    Subscribe
            </button>

            <div className="pt-12 pb-12 text-center">
                <p>{messages}</p>
            </div>
        </form>
    )
}

const Subscribe = ( location ) => {
    // Get the lookup key for the price from the previous page Navigate.
    const {state} = useLocation();
    const [clientSecret] = useState(state.clientSecret);
    const [subscriptionId] = useState(state.subscriptionId);
    const [paymentIntent, setPaymentIntent] = useState();

    // Initialize an instance of stripe.
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
    const options = {
        clientSecret,
    };

    return (
        <>
        {clientSecret && (<Elements stripe={stripePromise} options={options}>
            <div className="flex flex-wrap w-full">
                <div className="w-1/2 shadow-2xl bg-blend-darken">
                    <img className="hidden object-cover w-full h-screen md:block" src="/macbook.jpg"/>
                </div>
                <div className="flex flex-col w-full md:w-1/2">
                    <div className="flex justify-center pt-12 md:justify-start md:pl-12 md:-mb-24">
                        <a href="#" className="p-4 text-xl font-bold text-white bg-black">
                            Start learning.
                        </a>
                    </div>
                    <div className="flex flex-col justify-center px-8 pt-8 my-auto md:justify-start md:pt-0 md:px-24 lg:px-32">
                        <p className="text-3xl text-center">Subscribe</p>

                        <PaymentForm />
                        <div className="bg-green-200 border-green-600 text-green-600 border-l-4 p-4" role="alert">
                            <p className="font-bold mb-2">
                                Try test cards!
                            </p>
                            <p className="mb-1">Try the successful test card: <span>4242424242424242</span>.</p>
                            <p className="mb-1">
                                Use any <i>future</i> expiry date, CVC,5 digit postal code
                            </p>
                            <p className="mb-1">Try the test card that requires SCA: <span>4000002500003155</span>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Elements>)}
    </>
    )
}

export default Subscribe;