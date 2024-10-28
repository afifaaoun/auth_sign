import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import Cookies from 'js-cookie'; // Importation de js-cookie
import api from '../context/Api'; // Importation de ton instance Axios
import { useNavigate } from 'react-router-dom'; // Import du hook useNavigate

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialiser useNavigate
    const { login } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/user/login', { email, password });
            if (response.status === 200) {
                // Stocker le token dans les cookies, expire dans 1 heure
                Cookies.set('authToken', response.data.token, { expires: 1 / 24, sameSite: 'none', secure: false }); // secure: false pour le développement local
                console.log('authToken set:', response.data.token);
                
                login(); // Met à jour l'état d'authentification dans le UserContext
                navigate('/dashboard'); // Redirige vers le dashboard après connexion réussie
            }
        } catch (err) {
            setError('Erreur lors de la connexion. Veuillez vérifier vos identifiants.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Email" 
                    required 
                />
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Mot de passe" 
                    required 
                />
                <button type="submit">Login</button>
            </form>
            {error && <p>{error}</p>} {/* Affiche l'erreur si elle existe */}
        </div>
    );
};

export default SignIn;
