
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar = () => {
    const { isAuthenticated, logout } = useUser();

    const handleLogout = () => {
        logout();
        window.location.href = '/signin';
    };

    return (
        <nav>
            <Link to="/">Home</Link>
            {!isAuthenticated && (
                <>
                    <Link to="/signin">Sign In</Link>
                    <Link to="/signup">Sign Up</Link>
                </>
            )}
            {isAuthenticated && (
                <>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/profile">Profile</Link>
                    <button onClick={handleLogout}>Logout</button>
                </>
            )}
        </nav>
    );
};

export default Navbar;
