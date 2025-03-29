const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const User = require('../model/userModel'); // Adjust the path if needed
const nodemailer = require('nodemailer');
require('dotenv').config();

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/user/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter for images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// **User Registration**
const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'consumer'
        });

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json({ message: 'User registered successfully', user: userResponse });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

// **User Login**
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({ message: 'Login successful', token, user: userResponse });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

// **Google login callback**
const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

const googleAuthCallback = (req, res) => {
    passport.authenticate('google', { session: false }, async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: 'Authentication failed' });
        }
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );
        
        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;
        
        res.json({ token, user: userResponse });
    })(req, res);
};

// **Forgot Password**
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        // Check if email credentials are properly set
        if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
            console.error('Email credentials not properly configured in .env file');
            return res.status(500).json({ 
                message: 'Server configuration error. Please contact administrator.',
                debug: 'Email credentials missing in server configuration'
            });
        }

        // Create transporter with more detailed configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS
            },
            debug: true // Enable debug output
        });

        const mailOptions = {
            from: `"Your App Name" <${process.env.EMAIL}>`,
            to: email,
            subject: 'Reset Password',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Please click the link below to reset your password:</p>
                <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">Reset Password</a>
                <p>This link will expire in 15 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            `
        };

        // Send email with error handling
        try {
            await transporter.sendMail(mailOptions);
            res.json({ message: 'Reset link sent to your email' });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            
            // Store the reset token for testing purposes
            res.status(207).json({ 
                message: 'Account found, but email delivery failed. For testing purposes only, here is your token.',
                resetToken: resetToken,
                error: emailError.message
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Failed to process request', error: error.message });
    }
};

// **Reset Password**
const resetPassword = async (req, res) => {
    try {
        const { resetToken, password, confirmPassword } = req.body;

        if (!resetToken || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ where: { resetToken } });
        if (!user || user.resetTokenExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
};

// **Get Current User**
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] }
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Failed to get user', error: error.message });
    }
};

// **Update User**
const updateUser = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['username', 'email']; // Removed password from allowed updates
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        
        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates!' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        updates.forEach(update => {
            if (req.body[update]) user[update] = req.body[update];
        });

        // Handle profile picture upload
        if (req.file) {
            const fileName = `${req.user.id}-${Date.now()}.webp`;
            const webpPath = `uploads/user/${fileName}`;
            
            // Delete old profile pic if exists
            if (user.profilePic && fs.existsSync(user.profilePic)) {
                fs.unlinkSync(user.profilePic);
            }
            
            // Process and save new image
            await sharp(req.file.path)
                .resize(200, 200)
                .toFormat('webp')
                .toFile(webpPath);
                
            // Delete original uploaded file
            fs.unlinkSync(req.file.path);
            
            // Update profile pic path in database
            user.profilePic = webpPath;
        }

        await user.save();
        
        // Remove sensitive data from response
        const userResponse = user.toJSON();
        delete userResponse.password;
        delete userResponse.resetToken;
        delete userResponse.resetTokenExpiry;
        
        res.json({ message: 'User updated successfully', user: userResponse });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// **Update Password**
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }
        
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Failed to update password', error: error.message });
    }
};

// **Delete User**
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Delete profile pic if exists
        if (user.profilePic && fs.existsSync(user.profilePic)) {
            fs.unlinkSync(user.profilePic);
        }
        
        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};

module.exports = { 
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
};