const jwt = require('jsonwebtoken');
const User = require('../model/userModel'); // Adjust path as needed

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid authentication token' });
    }
};

/**
 * Admin Authorization Middleware
 * Checks if authenticated user has admin role
 */
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    next();
};

/**
 * Role-based Authorization Middleware
 * @param {string[]} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access forbidden' });
        }

        next();
    };
};

// For backward compatibility
const auth = isAuthenticated;

module.exports = {
    isAuthenticated,
    isAdmin,
    authorize,
    auth
};