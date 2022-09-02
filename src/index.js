import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

fetch('/config')
    .then((response) => response.json())
    .then((data) => {

        ReactDOM.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>,
            document.getElementById('root')
        );
    })
    .catch((error) => {
        console.error('Error:', error);
    });
