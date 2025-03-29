const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const { sequelize } = require('./config/db');
const userRoutes = require('./route/userRoutes');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/users', userRoutes);

// Sync Database
sequelize.sync()
    .then(() => {
        console.log('Database synced successfully');
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('Database sync failed:', err));
