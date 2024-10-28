// backend/controllers/userController.js
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Upload profile picture
exports.uploadProfilePicture = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send(err);
    }

    const userId = req.user.id; // Get the user ID from the request
    const filePath = req.file.path; // Get the uploaded file path

    try {
      await User.findByIdAndUpdate(userId, { profilePicture: filePath }); // Update user profile picture
      res.status(200).json({ message: 'Profile picture updated successfully', filePath });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// Register new user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken, // Save the verification token
      isVerified: false,
    });
    
    await newUser.save();
    console.log('New user created:', newUser); // Log the new user

    // Send verification email here with the verification token
    const verificationUrl = `http://localhost:3000/verify-email/${verificationToken}`;
    console.log('Verification URL:', verificationUrl);

    await transporter.sendMail({
      to: email,
      subject: 'Email Verification',
      text: `Click the link to verify your email: ${verificationUrl}`,
    });

    res.status(201).json({ message: 'User created. Please verify your email.' });

  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Function to verify email
exports.verifyEmail = async (req, res) => {
  const { token } = req.body; // Get the token from the request body

  try {
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).json({ message: 'User not found or invalid token' });
    }
    
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the verification token
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
    
  } catch (error) {
    console.error('Error in email verification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Tentative de connexion:', req.body)
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Authentification réussie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

res.cookie('authToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Assurez-vous que cela est vrai en production
  maxAge: 3600000,
  sameSite: 'None', // Utiliser 'None' pour les cookies cross-site
});


    // Renvoie une réponse avec un message de succès et les données de l'utilisateur
    return res.status(200).json({
      message: 'Login successful',        
      token,
      user: {
        id: user._id,
        email: user.email,
        // Ajoutez d'autres informations nécessaires si besoin
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Logout user

exports.logout = (req, res) => {
  res.clearCookie('authToken'); // Supprimer le cookie
  res.status(200).json({ message: 'Logged out successfully' });
};


// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // Vérifier si req.user est défini
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Trouver l'utilisateur en excluant le mot de passe
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // URL de la photo de profil
    let profilePhoto;
    if (user.profilePhoto) {
      // Remplace les antislashs par des slashs et formate le chemin pour l'accès HTTP
      profilePhoto = `http://localhost:5008/${user.profilePhoto.replace(/\\/g, '/')}`;
    } else {
      // Photo par défaut si aucune photo n'est fournie
      profilePhoto = `http://localhost:5008/Public/Profile-auth/photo.png`;
    }

    // Envoyer les informations du profil au frontend
    res.status(200).json({
      name: user.name,
      email: user.email,
      profilePhoto, // Utilise l'URL construite de la photo
    });
    
    console.log('User profile data being sent:', {
      name: user.name,
      email: user.email,
      profilePhoto, // URL de la photo de profil
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Update user profile
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Function to handle forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(`Forgot Password Request for: ${email}`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found');
      return res.status(404).send('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
    console.log(`Reset URL: ${resetURL}`);

    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `Click the link to reset your password: ${resetURL}`,
    });

    console.log('Password reset email sent');
    res.status(200).send('Password reset email sent');
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).send('Server error');
  }
};

// Function to handle reset password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  console.log(`Reset Password Request for Token: ${token}`);

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.error('Invalid or expired token');
      return res.status(400).send('Invalid or expired token');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    console.log('Password has been reset successfully');
    res.status(200).send('Password has been reset');
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).send('Server error');
  }
};
