const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes'); // Ensure the path is correct
const path = require('path');
const cookieParser = require('cookie-parser'); // Import du middleware

// Load environment variables
dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true, // Allows cookies to be sent
  allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes autorisées};
}
app.use(cors(corsOptions));
// Utilisation de cookie-parser pour analyser les cookies dans chaque requête
app.use(cookieParser());
app.use(express.json()); // To parse JSON bodies

// Serve static files from the 'Public' directory
app.use('/public', express.static(path.join(__dirname, 'Public')));

// Define routes
app.use('/api/user', userRoutes); // User-related routes

const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
