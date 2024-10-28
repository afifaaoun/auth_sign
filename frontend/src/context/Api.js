import axios from 'axios';
import Cookies from 'js-cookie';

// Créer une instance d'Axios
const api = axios.create({
    baseURL: 'http://localhost:5008/api', // Ton URL de base
    withCredentials: true // Ajouter withCredentials pour permettre l'envoi des cookies
});

// Intercepter les requêtes pour inclure le cookie
api.interceptors.request.use((config) => {
    const token = Cookies.get('authToken'); // Assure-toi que le cookie est accessible
    console.log("Token après connexion:", token); 
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`; // Ajoute le token aux en-têtes de la requête
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Intercepter les réponses pour gérer les erreurs globalement
api.interceptors.response.use((response) => {
    console.log("Réponse réussie:", response); // Affiche la réponse réussie
    return response;
}, (error) => {
    console.error("Erreur dans la réponse:", error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 401) {
        alert("Session expirée, veuillez vous reconnecter."); // Notification pour l'utilisateur
        window.location.href = '/signin'; // Redirige vers la page de connexion
    }
    return Promise.reject(error);
});

export default api;

