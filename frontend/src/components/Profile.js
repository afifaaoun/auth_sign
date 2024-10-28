import React, { useEffect, useState } from 'react';
import api from '../context/Api';
import { useUser } from '../context/UserContext';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true); // Pour gérer l'état de chargement
    const [error, setError] = useState(null); // Pour gérer les erreurs
    const { isAuthenticated } = useUser();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true); // Début du chargement
                const response = await api.get('/user/profile', {
                  withCredentials: true // Cela permet d'envoyer les cookies avec la requête
              });
                setUserData(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération du profil:", error);
                setError("Erreur lors de la récupération des données du profil."); // Mettre à jour l'état d'erreur
            } finally {
                setLoading(false); // Fin du chargement
            }
        };

        if (isAuthenticated) {
            fetchUserProfile();
        } else {
            setUserData(null); // Réinitialiser les données si non authentifié
        }
    }, [isAuthenticated]);

    if (loading) return <div>Chargement...</div>; // Afficher un message de chargement

    if (error) return <div>{error}</div>; // Afficher l'erreur si elle existe

    if (!userData) return <div>Aucune donnée utilisateur disponible.</div>; // Message si pas de données

    return (
        <div>
            <h1>Profil de {userData.name}</h1>
            <p>Email: {userData.email}</p>
            <p>Nom: {userData.name}</p>
            {/* Ajoute d'autres informations ici */}
        </div>
    );
};

export default Profile;
