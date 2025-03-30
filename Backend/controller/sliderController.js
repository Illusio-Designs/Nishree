const Slider = require('../model/sliderModel');
const Category = require('../model/categoryModel');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const ImageHandler = require('../utils/imageHandler');
const createUploadMiddleware = require('../middleware/uploadMiddleware');

// Initialize image handler
const imageHandler = new ImageHandler(path.join(__dirname, '../uploads/slider'));

// Create upload middleware for slider images
const upload = createUploadMiddleware(path.join(__dirname, '../uploads/slider'), 'image');

// Helper function to format slider response
const formatSliderResponse = (slider) => {
    const sliderData = slider.toJSON();
    sliderData.categoryName = slider.category ? slider.category.name : null;
    // Generate buttonLink dynamically
    sliderData.buttonLink = slider.categoryId ? `/category/${slider.categoryId}` : null;
    delete sliderData.category;
    return sliderData;
};

// Create Slider
const createSlider = async (req, res) => {
    try {
        const { title, tagline, buttonText, categoryId, status, order } = req.body;
        
        // Check if category exists if categoryId is provided
        if (categoryId) {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(400).json({ message: 'Category not found' });
            }
        }

        let image = null;

        if (req.file) {
            try {
                const result = await imageHandler.processImage(req.file.path, {
                    width: 1920,
                    height: 1080,
                    quality: 80,
                    format: 'webp',
                    filename: `slider-${uuidv4()}`
                });

                if (!result.success) {
                    throw new Error(result.error);
                }

                image = result.filename;
            } catch (imageError) {
                console.error('Error processing image:', imageError);
                return res.status(500).json({ 
                    message: 'Error processing image', 
                    error: imageError.message 
                });
            }
        }

        const slider = await Slider.create({
            title,
            tagline,
            buttonText,
            categoryId,
            image,
            status,
            order
        });

        // Get slider with category info
        const sliderWithCategory = await Slider.findByPk(slider.id, {
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }]
        });

        // Format response
        const sliderResponse = formatSliderResponse(sliderWithCategory);

        res.status(201).json({ 
            message: 'Slider created successfully', 
            slider: sliderResponse 
        });
    } catch (error) {
        console.error('Create slider error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get All Sliders
const getAllSliders = async (req, res) => {
    try {
        const sliders = await Slider.findAll({
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }],
            order: [['order', 'ASC']]
        });

        // Format response
        const slidersResponse = sliders.map(formatSliderResponse);

        res.status(200).json(slidersResponse);
    } catch (error) {
        console.error('Get all sliders error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get Slider by ID
const getSliderById = async (req, res) => {
    try {
        const slider = await Slider.findByPk(req.params.id, {
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }]
        });

        if (!slider) {
            return res.status(404).json({ message: 'Slider not found' });
        }

        // Format response
        const sliderResponse = formatSliderResponse(slider);

        res.status(200).json(sliderResponse);
    } catch (error) {
        console.error('Get slider error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update Slider
const updateSlider = async (req, res) => {
    try {
        const slider = await Slider.findByPk(req.params.id);
        if (!slider) {
            return res.status(404).json({ message: 'Slider not found' });
        }

        const { title, tagline, buttonText, categoryId, status, order } = req.body;

        // Check if category exists if categoryId is provided
        if (categoryId) {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(400).json({ message: 'Category not found' });
            }
        }

        let image = slider.image;

        if (req.file) {
            try {
                // Delete old image if exists
                if (slider.image) {
                    await imageHandler.deleteFile(imageHandler.getImagePath(slider.image));
                }

                // Process new image
                const result = await imageHandler.processImage(req.file.path, {
                    width: 1920,
                    height: 1080,
                    quality: 80,
                    format: 'webp',
                    filename: `slider-${uuidv4()}`
                });

                if (!result.success) {
                    throw new Error(result.error);
                }

                image = result.filename;
            } catch (imageError) {
                console.error('Error processing image:', imageError);
                return res.status(500).json({ 
                    message: 'Error processing image', 
                    error: imageError.message 
                });
            }
        }

        await slider.update({
            title,
            tagline,
            buttonText,
            categoryId,
            image,
            status,
            order
        });

        // Get updated slider with category info
        const updatedSlider = await Slider.findByPk(slider.id, {
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }]
        });

        // Format response
        const sliderResponse = formatSliderResponse(updatedSlider);

        res.status(200).json({ 
            message: 'Slider updated successfully', 
            slider: sliderResponse 
        });
    } catch (error) {
        console.error('Update slider error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete Slider
const deleteSlider = async (req, res) => {
    try {
        const slider = await Slider.findByPk(req.params.id);
        if (!slider) {
            return res.status(404).json({ message: 'Slider not found' });
        }

        // Delete image if exists
        if (slider.image) {
            await imageHandler.deleteFile(imageHandler.getImagePath(slider.image));
        }

        await slider.destroy();
        res.status(200).json({ message: 'Slider deleted successfully' });
    } catch (error) {
        console.error('Delete slider error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSlider,
    getAllSliders,
    getSliderById,
    updateSlider,
    deleteSlider,
    upload
}; 