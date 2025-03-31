const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { 
    register, 
    login, 
    forgotPassword, 
    resetPassword, 
    getCurrentUser,
    updateUser, 
    updatePassword,
    deleteUser,
    upload,
    getAllUsers
} = require('../controller/userController');
const { isAuthenticated, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google authentication routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    try {
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email, role: req.user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const userResponse = req.user.toJSON();
        delete userResponse.password;

        res.json({
            message: 'Google authentication successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Google auth callback error:', error);
        res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
});

// Protected routes
router.get('/me', isAuthenticated, getCurrentUser);
router.put('/update', isAuthenticated, upload.single('profilePic'), updateUser);
router.put('/update-password', isAuthenticated, updatePassword);
router.delete('/delete', isAuthenticated, deleteUser);

// Admin routes
router.get('/admin/users', isAuthenticated, authorize(['admin']), getAllUsers);

module.exports = router;