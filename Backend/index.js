require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const sequelize = require('./config/db');
require('./config/passport'); // Add passport configuration
const categoryRoutes = require('./route/categoryRoutes');
const userRoutes = require('./route/userRoutes'); // Make sure this path is correct
const sliderRoutes = require('./route/sliderRoutes'); // Add slider routes

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({ 
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your-fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sliders', sliderRoutes); // Add slider routes

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        message: 'Server is running',
        timestamp: new Date()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Sync Database
sequelize.sync({ alter: true }) // Using alter:true to update schema without dropping tables
    .then(() => {
        console.log('Database synced successfully');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, (err) => {
            if (err) {
                console.error(`Failed to start server on port ${PORT}:`, err);
                process.exit(1);
            }
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database sync failed:', err);
        process.exit(1);
    });