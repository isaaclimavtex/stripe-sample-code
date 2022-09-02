import React, { useState } from 'react';
import './App.css';
import { Navigate } from 'react-router-dom';

const Register = (props) => {
    const [email, setEmail] = useState('jenny.rosen@example.com');
    const [customer, setCustomer] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const {customer} = await fetch('/create-customer', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
            }),
        }).then(r => r.json());

        setCustomer(customer);
    };

    if(customer) {
        return <Navigate to={{pathname: '/prices'}} />
    }

    return (
        <main className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <img className="mx-auto h-12 w-auto" src="https://picsum.photos/280/320?random=4" alt="picsum generated" width="140" height="160" />
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Online Ecommerce Classes</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Learn Ecommerce through a lot of classes. Cancel anytime.
                </p>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <label className="">
                    Email
                        <input
                            className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            type="text"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </label>

                    <button className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" type="submit">
                        Register
                    </button>
                </form>
            </div>
        </main>
    );
}

export default Register;