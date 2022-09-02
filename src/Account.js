import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const AccountSubscription = ({subscription, user, cancelledRecurring, setCancelledRecurring}) => {

    const cancelRecurring = async (subscription_id) => {
        try {
            const {subscription} = await fetch('/cancel-recurring', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription_id
                }),
            }).then(r => r.json());
            if(subscription.cancel_at_period_end) {
                setCancelledRecurring(true);
            }
        } catch(err) {
            alert(err);
        }
    }
    const reactivateRecurring = async (subscription_id) => {
        try {
            const {subscription} = await fetch('/reactivate-recurring', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription_id
                }),
            }).then(r => r.json());
            if(!subscription.cancel_at_period_end) {
                setCancelledRecurring(false);
            }
        } catch(err) {
            alert(err);
        }
    }

    function RecurringButton(){
        return (
            <>
            {(!cancelledRecurring) ?
                <button className="ml-4" style={{color: 'red'}} onClick={() => cancelRecurring(subscription.id)}>Cancel recurring billing</button>
            :   <button className="ml-4" style={{color: 'green'}} onClick={() => reactivateRecurring(subscription.id)}>Reactivate recurring billing</button>
            }
            </>
        )
    }

    return (
        <li className="flex flex-row mb-2">
            <div className="shadow border select-none cursor-pointer bg-white dark:bg-gray-800 rounded-md flex flex-1 items-center p-4">
                <div className="flex-1 pl-1 md:mr-16">
                    <div className="font-medium dark:text-white">
                        <a href={`https://dashboard.stripe.com/test/subscriptions/${subscription.id}`}>
                            {subscription.id}
                        </a>
                    </div>
                    <div className="text-gray-600 dark:text-gray-200 text-sm">
                        Status: {subscription.status}
                    </div>
                    <div className="text-gray-600 dark:text-gray-200 text-sm">
                        Card last4: {subscription.default_payment_method?.card?.last4}
                    </div>
                </div>
                <div className="text-gray-600 dark:text-gray-200 text-xs">
                    Current period end: {(new Date(subscription.current_period_end * 1000).toString())}
                </div>
                {subscription.status === 'active' &&
                    <>
                    <Link className="ml-4" style={{color: 'red'}} to='/cancel' state={{subscription: subscription.id}}>Cancel</Link> 
                    <RecurringButton />
                    </>
                }
                {/* <Link to={{pathname: '/change-plan', state: {subscription: subscription.id }}}>Change plan</Link><br /> */}
                
            </div>
        </li>
    )
}

const Account = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [user, setUser] = useState({});
    const [cancelledRecurring, setCancelledRecurring] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const {subscriptions} = await fetch('/subscriptions').then(r => r.json());
            const user = await fetch('/user').then(r => r.json());

            setUser(user);
            setCancelledRecurring(!user.recurring);
            setSubscriptions(subscriptions.data);
        }
        fetchData();
    }, []);

    if (!subscriptions) {
        return '';
    }

    return (
        <div className="container flex flex-col mx-auto w-full items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-4 py-5 sm:px-6 border-b w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Account of {user.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-200">
                    Details and informations about subscriptions of the user.
                </p>
            </div>
            <div className="flex items-center">
                <form action="/prices">
                    <button type="submit" className="w-full border-l border-t border-b text-base font-medium rounded-l-md text-black bg-white hover:bg-gray-100 px-4 py-2">
                        Add a subscription
                    </button>
                </form>
                <form action="../">
                    <button type="button" className="w-full border text-base font-medium text-black bg-white hover:bg-gray-100 px-4 py-2">
                        Restart demo
                    </button>
                </form>
            </div>

            <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-5 mt-8">
                Subscriptions
            </h2>

            <ul className="flex flex-col divide divide-y mb-8" id="subscriptions">
                {subscriptions.map(s => {
                    return <AccountSubscription
                                user={user} 
                                setCancelledRecurring={setCancelledRecurring} 
                                cancelledRecurring={cancelledRecurring} 
                                key={s.id} 
                                subscription={s} 
                            />
                })}
            </ul>
        </div>
    );
}

export default Account;
