const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const { sequelize } = require('./config/db');

dotenv.config();

const userRoutes = require('./route/userRoutes');
require('./config/passport');

const app = express();

app.use(express.json());
app.use(cors());
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/users', userRoutes);

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
sequelize.sync()
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
