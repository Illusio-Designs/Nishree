import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { User } from '../model/userModel.js';
import nodemailer from 'nodemailer';
import ImageHandler from '../utils/imageHandler.js';
import upload from '../middleware/uploadMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize image handler
const imageHandler = new ImageHandler(path.join(__dirname, '../uploads/users'));

// Helper function to add image URL to user response
const addImageUrlToResponse = (userResponse) => {
    if (userResponse.profileImage) {
        // Check if profileImage already contains the full path
        if (userResponse.profileImage.startsWith('/uploads/')) {
            userResponse.profileImageUrl = userResponse.profileImage;
        } else {
            userResponse.profileImageUrl = `/uploads/users/${userResponse.profileImage}`;
        }
    }
    return userResponse;
};

// **User Registration**
export const register = async (req, res) => {
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
export const login = async (req, res) => {
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

// **OTP Login (MSG91)** — for B2B users (party / distributor / salesman).
// Consumers keep email/password/Google login. Flow: the browser MSG91 widget
// returns an access-token after OTP entry; we verify it with MSG91 to get the
// phone, find the matching user, and issue a JWT. A demo path (no MSG91 configured)
// accepts { phone } directly so the portals are testable without live OTP.
export const otpLogin = async (req, res) => {
    try {
        const { accessToken, phone: bodyPhone, role } = req.body;
        let phone = bodyPhone;

        // Verify the MSG91 widget access-token when credentials are configured.
        if (accessToken && process.env.MSG91_AUTH_KEY) {
            try {
                const { data } = await axios.post(
                    'https://control.msg91.com/api/v5/widget/verifyAccessToken',
                    { authkey: process.env.MSG91_AUTH_KEY, 'access-token': accessToken },
                    { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
                );
                phone = data?.mobile || data?.data?.mobile || phone;
            } catch (err) {
                console.error('MSG91 verify failed:', err.message);
                return res.status(401).json({ message: 'OTP verification failed' });
            }
        }

        if (!phone) return res.status(400).json({ message: 'Phone (or a verified access token) is required' });

        let user = await User.findOne({ where: { phone } });

        // No account yet: provision a B2B user (demo/dev), or reject in live OTP mode.
        if (!user) {
            const liveOtp = !!process.env.MSG91_AUTH_KEY;
            if (liveOtp && process.env.NODE_ENV === 'production') {
                return res.status(404).json({ message: 'No account is registered for this number. Please contact the Nishree team.' });
            }
            const b2bRole = ['party', 'distributor', 'salesman'].includes(role) ? role : 'party';
            user = await User.create({
                username: `${b2bRole.charAt(0).toUpperCase() + b2bRole.slice(1)} User`,
                email: `b2b_${phone}@nishree.local`,
                phone,
                role: b2bRole
            });
        }

        // OTP login is for B2B; a consumer account should use email/Google login.
        if (user.role === 'consumer') {
            return res.status(403).json({ message: 'This number is registered as a shopper. Please sign in with email.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({ message: 'OTP login successful', token, user: userResponse });
    } catch (error) {
        console.error('OTP login error:', error);
        res.status(500).json({ message: 'OTP login failed', error: error.message });
    }
};

// **Google Authentication**
export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

// **Google Auth Callback**
export const googleAuthCallback = (req, res) => {
    try {
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email, role: req.user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );
        
        // Remove password from response
        const userResponse = req.user.toJSON();
        delete userResponse.password;
        
        res.json({ message: 'Google authentication successful', token, user: userResponse });
    } catch (error) {
        console.error('Google auth callback error:', error);
        res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
};

// **Forgot Password**
export const forgotPassword = async (req, res) => {
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
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
            console.error('Email credentials not properly configured in .env file');
            return res.json({ 
                message: 'Reset token generated. Email not sent due to configuration.',
                resetToken: resetToken
            });
        }

        // Create transporter with more detailed configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            },
            debug: true
        });

        const mailOptions = {
            from: `"Illusio Designs" <${process.env.EMAIL_USER}>`,
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
            res.json({ 
                message: 'Reset link sent to your email',
                resetToken: resetToken // Include token in response for testing
            });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            res.json({ 
                message: 'Reset token generated. Email delivery failed.',
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
export const resetPassword = async (req, res) => {
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
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] }
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add image URL to response
        const userResponse = addImageUrlToResponse(user.toJSON());
        
        res.json(userResponse);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Failed to get user', error: error.message });
    }
};

// **Update User**
export const updateUser = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['username', 'email', 'phone'];
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
            try {
                // Process the new image using image handler
                const filename = await imageHandler.handleUserProfileImage(
                    user.profileImage,
                    req.file.path,
                    user.id
                );

                // Store only the filename in the database
                user.profileImage = filename;
            } catch (imageError) {
                console.error('Error handling profile image:', imageError);
                return res.status(500).json({ 
                    message: 'Error processing profile picture', 
                    error: imageError.message 
                });
            }
        }

        await user.save();
        
        // Remove sensitive data from response
        const userResponse = user.toJSON();
        delete userResponse.password;
        delete userResponse.resetToken;
        delete userResponse.resetTokenExpiry;

        // Add image URL to response
        const responseWithImage = addImageUrlToResponse(userResponse);
        
        res.json({ 
            message: 'User updated successfully', 
            user: responseWithImage 
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// **Update Password**
export const updatePassword = async (req, res) => {
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
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete profile image
        if (user.profile_image) {
            await imageHandler.deleteImage(user.profile_image);
        }

        await user.destroy();

        res.json({ 
            success: true, 
            message: 'User deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to delete user', 
            error: error.message 
        });
    }
};

// **Get All Users**
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Error getting users' });
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Error getting profile' });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Handle profile image update
        if (req.file) {
            try {
                updateData.profile_image = await imageHandler.handleUserProfileImage(
                    user.profile_image,
                    req.file.path,
                    user.id
                );
            } catch (error) {
                console.error('Error handling profile image update:', error);
                return res.status(500).json({ 
                    success: false,
                    message: 'Failed to process image',
                    error: error.message 
                });
            }
        }

        await user.update(updateData);
        
        res.json({ 
            success: true, 
            message: 'Profile updated successfully', 
            data: user 
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update profile', 
            error: error.message 
        });
    }
};

// Add the missing logout function
export const logout = (req, res) => {
    try {
        // Clear the token from client storage
        res.clearCookie('token');
        
        // If using passport session
        if (req.logout) {
            req.logout((err) => {
                if (err) {
                    return res.status(500).json({ 
                        message: 'Logout failed', 
                        error: err.message 
                    });
                }
            });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            message: 'Logout failed', 
            error: error.message 
        });
    }
};

// Add missing verifyEmail function
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ where: { verificationToken: token } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Failed to verify email', error: error.message });
    }
};

// Add missing changePassword function
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
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

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Failed to change password', error: error.message });
    }
};

// Export all functions individually
export {
    upload
};

// Remove the userController object export