// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { UserProvider } from './context/UserContext'; // Import your context provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <UserProvider> {/* Wrap App with UserProvider */}
            <App />
        </UserProvider>
    </BrowserRouter>
);
