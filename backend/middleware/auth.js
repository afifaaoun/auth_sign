const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assurez-vous que le chemin est correct

exports.authenticate = async (req, res, next) => {
  console.log('Middleware d\'authentification appelé');

  // Récupérer le token à partir des cookies et des en-têtes
  const token = req.headers['authorization']?.split(' ')[1] || req.cookies?.authToken; 
  console.log('Token utilisé pour l\'authentification:', token);

  if (!token) {
    console.log('Aucun token trouvé, autorisation refusée');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token décodé:', decoded);

    // Rechercher l'utilisateur dans la base de données
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('Utilisateur non trouvé avec l\'ID:', decoded.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Attacher l'objet utilisateur à la requête
    req.user = user; 
    console.log('Utilisateur authentifié:', req.user);
    next(); // Continuer vers le middleware suivant ou le gestionnaire de route
  } catch (error) {
    console.error('Erreur de vérification du token:', error.message);
    const statusCode = error instanceof jwt.TokenExpiredError ? 401 : 500;
    const errorMessage = error instanceof jwt.JsonWebTokenError ? 'Invalid token' : 'Server error';
    
    return res.status(statusCode).json({ message: errorMessage });
  }
};
