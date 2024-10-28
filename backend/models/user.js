const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationToken: { type: String }, // Ensure this field exists
  isVerified: { type: Boolean, default: false }, 
  profilePhoto: {
    type: String,
    default: '/Profile-auth/photo.png', // Set a default profile picture path
  },
  resetPasswordToken: { type: String }, // For password reset functionality
  resetPasswordExpires: { type: Date }, // Expiration for password reset
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
