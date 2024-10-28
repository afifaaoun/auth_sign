// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../Public/Upload');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it doesn't exist
}

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Specify the upload directory
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + '-' + file.originalname.replace(/[^a-z0-9.]/gi, '_'); // Sanitize filename
    cb(null, filename); // Use a unique filename
  },
});

// Initialize multer
const upload = multer({ storage: storage });

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);
// Get user profile route
router.get('/profile', authenticate, getProfile); // Ajoute authenticate ici
// Logout route
router.post('/logout', authenticate, logout); // Ajoute authenticate ici

// Route for uploading profile photo
router.put('/upload-photo', authenticate, upload.single('profilePhoto'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // Find the user by ID
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // Return 404 if user not found
    }

    // Check if a file was uploaded
    if (req.file) {
      // Update user's profile photo with the new relative path
      user.profilePhoto = `Public/Upload/${req.file.filename}`; // Save as a relative path
    } else {
      // Set a default photo path if no file is uploaded
      user.profilePhoto = 'Public/Profile-auth/photo.png'; // Path to the default photo
    }

    await user.save(); // Save the user document

    // Format the URL correctly for the profile photo
    const formattedPhotoUrl = `http://localhost:5008/${user.profilePhoto.replace(/\\/g, '/')}`;

    res.status(200).json({
      message: 'Photo uploaded successfully',
      profilePhoto: formattedPhotoUrl, // Send formatted path in response
    });
  } catch (error) {
    console.error('Error uploading photo:', error); // Log the error for debugging
    res.status(500).json({ message: 'Failed to upload photo', error: error.message }); // Return 500 if something goes wrong
  }
});



// Update user profile route
router.put('/profile', authenticate, updateProfile); // Ajoute authenticate ici

// Change password route
router.put('/change-password', authenticate, changePassword); // Ajoute authenticate ici

// Forgot password route
router.post('/forgot-password', forgotPassword);

// Reset password route
router.post('/reset-password', resetPassword);

// Verify email route
router.post('/verify-email', verifyEmail);

module.exports = router;
