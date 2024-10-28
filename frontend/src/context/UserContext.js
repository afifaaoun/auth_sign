import React, { createContext, useContext, useState } from 'react';

// Créer le contexte
const UserContext = createContext();

// Créer un fournisseur de contexte
export const UserProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null); // État pour stocker les informations de l'utilisateur

    const login = (userData) => {
        setUser(userData); // Met à jour les informations de l'utilisateur
        setIsAuthenticated(true); // Définit l'état d'authentification sur vrai
    };

    const logout = () => {
        setUser(null); // Efface l'utilisateur
        setIsAuthenticated(false); // Met à jour l'état d'authentification
        document.cookie = 'authToken=; Max-Age=0; path=/'; // Supprime le token
        console.log("Déconnexion réussie, token supprimé");
    };

    return (
        <UserContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

// Hook pour utiliser le contexte
export const useUser = () => {
    return useContext(UserContext);
};
