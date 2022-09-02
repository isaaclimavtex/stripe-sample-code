import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Account from './Account';
import Cancel from './Cancel';
import Prices from './Prices';
import Register from './Register';
import Subscribe from './Subscribe';

function App(props) {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<Register />}/>
                <Route path="/prices" element={<Prices />} />
                <Route path="/subscribe" element={<Subscribe /> } />
                <Route path="/account" element={<Account />} />
                <Route path="/cancel" element={<Cancel />} />
            </Routes>
        </Router>
    );
}

export default App;
