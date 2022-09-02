import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import './App.css';

const Cancel = () => {
    const [cancelled, setCancelled] = useState(false);
    const location = useLocation();

    const handleClick = async (e) => {
        e.preventDefault();

        await fetch('/cancel-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subscriptionId: location.state.subscription
            }),
        })

        setCancelled(true);
    };

    if(cancelled) {
        return <Navigate to='/account' />
    }

    return (
        <div>
            <h1>Cancel</h1>
            <button onClick={handleClick}>Cancel</button>
        </div>
    )
}

export default Cancel;
