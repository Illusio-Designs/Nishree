import express from 'express';
import { 
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail
} from '../controller/authController.js';
import passport from 'passport';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, getAllUsers, changePassword } from '../controller/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Google authentication routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

// Protected routes
router.get('/profile', isAuthenticated, getProfile);
router.put('/profile', isAuthenticated, updateProfile);
router.put('/change-password', isAuthenticated, changePassword);

// Admin routes
router.get('/users', isAuthenticated, authorize(['admin']), getAllUsers);

export default router; 