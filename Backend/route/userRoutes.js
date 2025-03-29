const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, googleAuth, googleAuthCallback, forgotPassword, upload, uploadProfilePic } = require('../controller/userController');

// Register & Login
router.post('/register', register);
router.post('/login', login);

// Google authentication
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', googleAuthCallback);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Profile picture upload
router.post('/upload-profile-pic', upload.single('profilePic'), uploadProfilePic);

module.exports = router;
