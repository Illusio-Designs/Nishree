import { initializeSeoData } from './utils/initializeSeoData.js';

// Initialize database and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        
        // Initialize default SEO data
        await initializeSeoData();
        
        console.log(`Server is running on port ${PORT}`);
    } catch (error) {
        console.error('Unable to start server:', error);
    }
}); 