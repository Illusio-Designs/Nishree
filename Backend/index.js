require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const sequelize = require('./config/db');
const categoryRoutes = require('./route/categoryRoutes');
const userRoutes = require('./route/userRoutes'); // Make sure this path is correct

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ 
    secret: process.env.JWT_SECRET || 'your-fallback-secret', 
    resave: false, 
    saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        message: 'Server is running',
        timestamp: new Date(),
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