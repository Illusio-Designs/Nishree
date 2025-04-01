// index.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { sequelize, testConnection, syncModels } from './config/db.js';
import './config/passport.js'; // Changed to import

// Import routes - convert to ES module imports
import routes from './routes/routesManager.js';

// Import integration routes
import googleAnalyticsRouter from './integration/googleAnalytics.js';
import facebookPixelRouter from './integration/facebookPixel.js';
import facebookCatalogRouter from './integration/facebookCatalog.js';
import dashboardAnalyticsRouter from './integration/dashboardAnalytics.js';

// Initialize dotenv
dotenv.config();

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

// Mount all routes under /api
app.use('/api', routes);

// Use the routes
app.use('/api/google-analytics', googleAnalyticsRouter);
app.use('/api/facebook-pixel', facebookPixelRouter);
app.use('/api/facebook-catalog', facebookCatalogRouter);
app.use('/api/dashboard', dashboardAnalyticsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Initialize database and start server
const startServer = async () => {
    try {
        // Test database connection
        const isConnected = await testConnection();
        if (!isConnected) {
            throw new Error('Failed to connect to database');
        }

        // Try to sync models
        const isSynced = await syncModels();
        if (!isSynced) {
            console.warn('Warning: Database models could not be fully synchronized.');
            console.warn('Some features may be limited. Please check your database configuration.');
        }

        // Start the server
        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();