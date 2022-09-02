import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Prices = () => {
    const [prices, setPrices] = useState([]);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        const fetchPrices = async () => {
            const {prices} = await fetch('/config').then(r => r.json());
            setPrices(prices);
        };
        fetchPrices();
    }, [])

    const createSubscription = async (priceId) => {
        try {
            const {msg, subscriptionId, clientSecret} = await fetch('/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId
                }),
            }).then(r => r.json());
            setMsg(msg);
            setSubscriptionData({ subscriptionId, clientSecret });
        } catch(err) {
            console.log(err);
        }
    }

    if(msg) {
        alert(msg);
        return (<Navigate to='/account' />)
    } else if(subscriptionData) {
        return <Navigate to='/subscribe'
            state={subscriptionData} />
    }

    return (
        <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
                <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Select a plan</h2>
                <p className="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">
                    Choose wisely, learn strongly.
                </p>
            </div>
            <div className="price-list flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                {prices.map((price) => {
                    return (
                    <div 
                        className="shadow-lg rounded-2xl w-64 bg-white dark:bg-gray-800 p-4" 
                        key={price.id}
                    >
                        <p 
                            className="text-gray-800 dark:text-gray-50 text-xl font-medium mb-4"
                        >{price.product.name}</p>

                        <p className="text-gray-900 dark:text-white text-3xl font-bold">
                            ${price.unit_amount / 100}
                            <span className="text-gray-300 text-sm">
                                / month
                            </span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-100  text-xs mt-4">
                            For your own learning pace, unlock basic features of the best courses.
                        </p>

                        {/* AQUI COMEÇAM AS FEATURES DA SUBSCRIPTION */}
                        <ul className="text-sm text-gray-600 dark:text-gray-100 w-full mt-6 mb-6">
                            <li className="mb-3 flex items-center ">
                                <svg className="h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" width="6" height="6" stroke="currentColor" fill="#10b981" viewBox="0 0 1792 1792">
                                    <path d="M1412 734q0-28-18-46l-91-90q-19-19-45-19t-45 19l-408 407-226-226q-19-19-45-19t-45 19l-91 90q-18 18-18 46 0 27 18 45l362 362q19 19 45 19 27 0 46-19l543-543q18-18 18-45zm252 162q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z">
                                    </path>
                                </svg>
                                All basic classes
                            </li>
                            <li className="mb-3 flex items-center ">
                                <svg className="h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" width="6" height="6" stroke="currentColor" fill="#10b981" viewBox="0 0 1792 1792">
                                    <path d="M1412 734q0-28-18-46l-91-90q-19-19-45-19t-45 19l-408 407-226-226q-19-19-45-19t-45 19l-91 90q-18 18-18 46 0 27 18 45l362 362q19 19 45 19 27 0 46-19l543-543q18-18 18-45zm252 162q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z">
                                    </path>
                                </svg>
                                Comment and interact with people
                            </li>
                            <li className="mb-3 flex items-center ">
                                <svg className="h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" width="6" height="6" stroke="currentColor" fill="#10b981" viewBox="0 0 1792 1792">
                                    <path d="M1412 734q0-28-18-46l-91-90q-19-19-45-19t-45 19l-408 407-226-226q-19-19-45-19t-45 19l-91 90q-18 18-18 46 0 27 18 45l362 362q19 19 45 19 27 0 46-19l543-543q18-18 18-45zm252 162q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z">
                                    </path>
                                </svg>
                                See your learning progress
                            </li>
                            <li className="mb-3 flex items-center opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" className="h-6 w-6 mr-2" fill="red" viewBox="0 0 1792 1792">
                                    <path d="M1277 1122q0-26-19-45l-181-181 181-181q19-19 19-45 0-27-19-46l-90-90q-19-19-46-19-26 0-45 19l-181 181-181-181q-19-19-45-19-27 0-46 19l-90 90q-19 19-19 46 0 26 19 45l181 181-181 181q-19 19-19 45 0 27 19 46l90 90q19 19 46 19 26 0 45-19l181-181 181 181q19 19 45 19 27 0 46-19l90-90q19-19 19-46zm387-226q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z">
                                    </path>
                                </svg>
                                Save videos and playlists
                            </li>
                            <li className="mb-3 flex items-center opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" className="h-6 w-6 mr-2" fill="red" viewBox="0 0 1792 1792">
                                    <path d="M1277 1122q0-26-19-45l-181-181 181-181q19-19 19-45 0-27-19-46l-90-90q-19-19-46-19-26 0-45 19l-181 181-181-181q-19-19-45-19-27 0-46 19l-90 90q-19 19-19 46 0 26 19 45l181 181-181 181q-19 19-19 45 0 27 19 46l90 90q19 19 46 19 26 0 45-19l181-181 181 181q19 19 45 19 27 0 46-19l90-90q19-19 19-46zm387-226q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z">
                                    </path>
                                </svg>
                                Contact professors directly
                            </li>
                        </ul>

                        <button 
                            className="py-2 px-4 
                            bg-indigo-600 hover:bg-indigo-700 
                            focus:ring-indigo-500 focus:ring-offset-indigo-200 
                            text-white w-full transition ease-in duration-200 text-center 
                            text-base font-semibold shadow-md focus:outline-none focus:ring-2 
                            focus:ring-offset-2 rounded-lg"
                            onClick={() => createSubscription(price.id)}>
                        Select
                        </button>
                    </div>
                    )
                })}
            </div>
        </div>
    );
}

export default Prices;