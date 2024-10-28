import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const PrivateRoute = ({ component: Component }) => {
    const { isAuthenticated } = useUser();

    return isAuthenticated ? <Component /> : <Navigate to="/signin" />;
};

export default PrivateRoute;
