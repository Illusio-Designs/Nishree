const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../config/passport');
const { register, login, googleAuth, googleAuthCallback, forgotPassword, upload, uploadProfilePic } = require('../controller/userController');

// Register & Login
router.post('/register', register);
router.post('/login', login);

// Start Google Auth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Callback & Return JSON Instead of HTML
router.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    res.json({
        message: "Google Authentication Successful",
        user: req.user
    });
});

// Forgot password
router.post('/forgot-password', forgotPassword);

// Profile picture upload
router.post('/upload-profile-pic', upload.single('profilePic'), uploadProfilePic);

module.exports = router;
