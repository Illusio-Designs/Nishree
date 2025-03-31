const SEOMetadata = require('../model/seoMetadataModel');

// Initialize default SEO data for pages
const initializeSEOData = async () => {
    try {
        const defaultPages = [
            { 
                page_name: "home", 
                slug: "/", 
                meta_title: "Home - Nishree", 
                meta_description: "Welcome to Nishree, your one-stop shop for all your needs."
            },
            { 
                page_name: "about-us", 
                slug: "/about-us", 
                meta_title: "About Us - Nishree", 
                meta_description: "Learn more about Nishree and our mission."
            },
            { 
                page_name: "contact", 
                slug: "/contact", 
                meta_title: "Contact Us - Nishree", 
                meta_description: "Get in touch with our team for any queries or support."
            },
            { 
                page_name: "products", 
                slug: "/products", 
                meta_title: "Products - Nishree", 
                meta_description: "Explore our wide range of high-quality products."
            },
            { 
                page_name: "faq", 
                slug: "/faq", 
                meta_title: "Frequently Asked Questions - Nishree", 
                meta_description: "Find answers to commonly asked questions about our products and services."
            }
        ];

        for (const page of defaultPages) {
            const [existingPage, created] = await SEOMetadata.findOrCreate({
                where: { page_name: page.page_name },
                defaults: page
            });

            if (created) {
                console.log(`Created SEO data for ${page.page_name}`);
            }
        }

        console.log('SEO data initialization completed');
    } catch (error) {
        console.error('Error initializing SEO data:', error);
    }
};

// Get SEO data for a specific page
const getSEOData = async (req, res) => {
    try {
        const { page_name } = req.query;
        
        if (!page_name) {
            return res.status(400).json({ message: 'Page name is required' });
        }

        const seoData = await SEOMetadata.findOne({
            where: { page_name }
        });

        if (!seoData) {
            return res.status(404).json({ message: 'SEO data not found' });
        }

        res.json(seoData);
    } catch (error) {
        console.error('Error getting SEO data:', error);
        res.status(500).json({ message: 'Failed to get SEO data', error: error.message });
    }
};

// Get all SEO data
const getAllSEOData = async (req, res) => {
    try {
        const allSEOData = await SEOMetadata.findAll({
            order: [['page_name', 'ASC']]
        });

        res.json(allSEOData);
    } catch (error) {
        console.error('Error getting all SEO data:', error);
        res.status(500).json({ message: 'Failed to get all SEO data', error: error.message });
    }
};

// Update SEO data for a page
const updateSEOData = async (req, res) => {
    try {
        const { 
            page_name, 
            slug, 
            meta_title, 
            meta_description, 
            meta_keywords, 
            canonical_url, 
            meta_image 
        } = req.body;

        if (!page_name) {
            return res.status(400).json({ message: 'Page name is required' });
        }

        const seoData = await SEOMetadata.findOne({
            where: { page_name }
        });

        if (!seoData) {
            return res.status(404).json({ message: 'SEO data not found' });
        }

        // Update fields
        await seoData.update({
            slug: slug || seoData.slug,
            meta_title: meta_title || seoData.meta_title,
            meta_description: meta_description || seoData.meta_description,
            meta_keywords: meta_keywords || seoData.meta_keywords,
            canonical_url: canonical_url || seoData.canonical_url,
            meta_image: meta_image || seoData.meta_image
        });

        res.json({ 
            success: true, 
            message: 'SEO data updated successfully', 
            data: seoData 
        });
    } catch (error) {
        console.error('Error updating SEO data:', error);
        res.status(500).json({ message: 'Failed to update SEO data', error: error.message });
    }
};

// Create new SEO entry for a page
const createSEOData = async (req, res) => {
    try {
        const { 
            page_name, 
            slug, 
            meta_title, 
            meta_description, 
            meta_keywords, 
            canonical_url, 
            meta_image 
        } = req.body;

        if (!page_name || !slug) {
            return res.status(400).json({ message: 'Page name and slug are required' });
        }

        const [seoData, created] = await SEOMetadata.findOrCreate({
            where: { page_name },
            defaults: {
                slug,
                meta_title,
                meta_description,
                meta_keywords,
                canonical_url,
                meta_image
            }
        });

        if (!created) {
            return res.status(400).json({ message: 'SEO data for this page already exists' });
        }

        res.status(201).json({ 
            success: true, 
            message: 'SEO data created successfully', 
            data: seoData 
        });
    } catch (error) {
        console.error('Error creating SEO data:', error);
        res.status(500).json({ message: 'Failed to create SEO data', error: error.message });
    }
};

// Delete SEO data for a page
const deleteSEOData = async (req, res) => {
    try {
        const { page_name } = req.params;
        
        if (!page_name) {
            return res.status(400).json({ message: 'Page name is required' });
        }

        const seoData = await SEOMetadata.findOne({
            where: { page_name }
        });

        if (!seoData) {
            return res.status(404).json({ message: 'SEO data not found' });
        }

        await seoData.destroy();

        res.json({ 
            success: true, 
            message: 'SEO data deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting SEO data:', error);
        res.status(500).json({ message: 'Failed to delete SEO data', error: error.message });
    }
};

module.exports = {
    initializeSEOData,
    getSEOData,
    getAllSEOData,
    updateSEOData,
    createSEOData,
    deleteSEOData
}; 