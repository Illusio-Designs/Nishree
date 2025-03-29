const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const User = require('../model/userModel');
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

const upload = multer({ storage });

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

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error });
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

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'Login successful', token, user });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
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
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user });
    })(req, res);
};

// **Forgot Password**
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
        to: email,
        subject: 'Reset Password',
        text: `Click the link to reset password: ${process.env.CLIENT_URL}/reset-password/${resetToken}`
    };

    transporter.sendMail(mailOptions);
    res.json({ message: 'Reset link sent' });
};

// **Upload and compress profile picture**
const uploadProfilePic = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const webpPath = `uploads/user/${Date.now()}.webp`;
    await sharp(req.file.path)
        .resize(200, 200)
        .toFormat('webp')
        .toFile(webpPath);
    
    fs.unlinkSync(req.file.path);
    res.json({ profilePic: webpPath });
};

module.exports = { register, login, googleAuth, googleAuthCallback, forgotPassword, upload, uploadProfilePic };
