import { Slider } from '../model/sliderModel.js';
import { Category } from '../model/categoryModel.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import fsSync from 'fs';
import ImageHandler from '../utils/imageHandler.js';
import multer from 'multer';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize image handler
const imageHandler = new ImageHandler(path.join(__dirname, '../uploads/slider'));

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/sliders'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Create the upload middleware
export const upload = multer({ storage });

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
// In createSlider function
export const createSlider = async (req, res) => {
    try {
        console.log("Request body received:", req.body);
        console.log("Request file received:", req.file);
        
        let { title, description, buttonText, categoryId, status, position } = req.body;

        // Check for required fields
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        
        // Check for image
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required for new sliders' });
        }

        // Handle categoryId properly
        if (categoryId) {
            categoryId = Number(categoryId);
            if (isNaN(categoryId)) {
                categoryId = null;
            }
        } else {
            categoryId = null;
        }

        if (categoryId !== null) {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(400).json({ message: 'Category not found' });
            }
        }

        let image = null;

        if (req.file) {
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
        }

        const slider = await Slider.create({
            title,
            description, // Changed from tagline
            buttonText,
            categoryId,
            image,
            status: status || 'active',
            position: position ? Number(position) : 0
        });

        // Rest of the function remains the same
        const sliderWithCategory = await Slider.findByPk(slider.id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
        });

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
// In sliderController.js, modify the getAllSliders function:
export const getAllSliders = async (req, res) => {
    try {
        const sliders = await Slider.findAll({
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }],
            order: [['position', 'ASC']]
        });

        const slidersResponse = sliders.map(formatSliderResponse);

        res.status(200).json({ sliders: slidersResponse });
    } catch (error) {
        console.error('Get all sliders error:', error);
        res.status(500).json({ message: error.message });
    }
};



// Get Slider by ID
export const getSliderById = async (req, res) => {
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
export const updateSlider = async (req, res) => {
    
    try {
        const slider = await Slider.findByPk(req.params.id);
        if (!slider) {
            return res.status(404).json({ message: 'Slider not found' });
        }

        const { title, description, buttonText, categoryId, status, position } = req.body;

        // Add this code here
        let categoryIdToUse = Number(categoryId);
        if (categoryIdToUse === "" || isNaN(categoryIdToUse)) {
          categoryIdToUse = null;
        }
        
        if (categoryIdToUse) {
            const category = await Category.findByPk(categoryIdToUse);
            if (!category) {
                return res.status(400).json({ message: 'Category not found' });
            }
        }

        let image = slider.image;

        if (req.file) {
            if (slider.image) {
                await imageHandler.deleteFile(imageHandler.getImagePath(slider.image));
            }

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
        }

        await slider.update({
            title,
            description,  // Changed from tagline
            buttonText,
            categoryId,
            image,
            status: status || 'active',
            position: position || 0
        });

        const updatedSlider = await Slider.findByPk(slider.id, {
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }]
        });

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
export const deleteSlider = async (req, res) => {
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

