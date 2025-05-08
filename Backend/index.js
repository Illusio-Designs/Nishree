import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { sequelize } from './config/db.js';
import routesManager from './routes/routesManager.js';
import passport from './config/passport.js';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import settingsRoutes from './routes/settingsRoutes.js';
import { setupDatabase } from './scripts/setupDatabase.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes - convert to ES module imports
import googleAnalyticsRouter from './integration/googleAnalytics.js';
import facebookPixelRouter from './integration/facebookPixel.js';
import facebookCatalogRouter from './integration/facebookCatalog.js';
import dashboardAnalyticsRouter from './integration/dashboardAnalytics.js';

// Initialize dotenv
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure morgan to skip repetitive API calls to reduce console log spam
app.use(morgan('combined', {
    skip: function (req, res) {
        // Skip logging for /api/users/me requests that return 304 (not modified)
        return req.path === '/api/users/me' && res.statusCode === 304;
    }
}));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Health check API endpoint
app.get('/api/health', (req, res) => {
    const healthData = {
        uptime: process.uptime(),
        timestamp: Date.now(),
        status: 'ok',
        database: {
            status: sequelize.authenticate().then(() => 'connected').catch(() => 'disconnected')
        }
    };
    
    res.status(200).json(healthData);
});

// Mount all routes under /api
app.use('/api', routesManager);

// Use the routes
app.use('/api/google-analytics', googleAnalyticsRouter);
app.use('/api/facebook-pixel', facebookPixelRouter);
app.use('/api/facebook-catalog', facebookCatalogRouter);
app.use('/api/dashboard', dashboardAnalyticsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Setup database (creates database if not exists and syncs all models)
        await setupDatabase();
        
        // Start listening
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

export { app };
export default app;