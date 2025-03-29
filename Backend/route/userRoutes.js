const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../config/passport'); // Ensure passport is configured
const { 
    register, 
    login, 
    googleAuth, 
    googleAuthCallback, 
    forgotPassword, 
    resetPassword, 
    getCurrentUser,
    updateUser, 
    updatePassword,
    deleteUser,
    upload 
} = require('../controller/userController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google authentication routes
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);

// Protected routes
router.get('/me', auth, getCurrentUser);
router.put('/update', auth, upload.single('profilePic'), updateUser);
router.put('/update-password', auth, updatePassword);
router.delete('/delete', auth, deleteUser);

// Admin only routes
router.get('/admin/users', auth, authorize(['admin']), (req, res) => {
    // This is just a placeholder. You would implement admin functions here
    res.json({ message: 'Admin only route' });
});

module.exports = router;