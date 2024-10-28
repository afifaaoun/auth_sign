import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home'; 
import Navbar from './components/navbar';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import PrivateRoute from './context/PrivateRoute'; // Ensure PrivateRoute is correctly implemented

const App = () => {
  return (
    <>
    <Navbar />
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
            path="/dashboard"
            element={<PrivateRoute component={Dashboard} />}
        />
        <Route
            path="/profile"
            element={<PrivateRoute component={Profile} />}
        />
    </Routes>
</>
  );
};

export default App;