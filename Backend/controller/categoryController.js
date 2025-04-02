import { Category } from '../model/categoryModel.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import fsSync from 'fs';
import { Op } from 'sequelize';
import ImageHandler from '../utils/imageHandler.js';
import { upload } from '../middleware/uploadMiddleware.js';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize image handler
const imageHandler = new ImageHandler(path.join(__dirname, '../uploads/category'));

// Helper function to format category response
const formatCategoryResponse = (category) => {
    const categoryData = category.toJSON();
    categoryData.parentName = category.parent ? category.parent.name : null;
    delete categoryData.parent;
    return categoryData;
};

// Create Category
const createCategory = async (req, res) => {
    try {
        const { name, description, status, parentId, seoTitle, seoDescription, seoKeywords, slug, metaTags } = req.body;
        
        // Check for duplicate category name
        const existingCategory = await Category.findOne({
            where: { name }
        });

        if (existingCategory) {
            return res.status(400).json({ 
                message: 'Category with this name already exists',
                error: 'DUPLICATE_CATEGORY_NAME'
            });
        }

        let image = null;

        if (req.file) {
            try {
                const result = await imageHandler.processImage(req.file.path, {
                    width: 800,
                    height: 600,
                    quality: 80,
                    format: 'webp',
                    filename: `category-${uuidv4()}`
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

        const category = await Category.create({
            name,
            description,
            status,
            parentId,
            image,
            seoTitle,
            seoDescription,
            seoKeywords,
            slug,
            metaTags
        });

        // Get category with parent info
        const categoryWithParent = await Category.findByPk(category.id, {
            include: [{
                model: Category,
                as: 'parent',
                attributes: ['id', 'name']
            }]
        });

        // Format response
        const categoryResponse = formatCategoryResponse(categoryWithParent);

        res.status(201).json({ 
            message: 'Category created successfully', 
            category: categoryResponse 
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get All Categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get Category by ID
const getCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const category = await Category.findByPk(id, {
            include: [{
                model: Category,
                as: 'parent',
                attributes: ['id', 'name']
            }]
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Format response
        const categoryResponse = formatCategoryResponse(category);

        res.status(200).json(categoryResponse);
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update Category
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const { name, description, status, parentId, seoTitle, seoDescription, seoKeywords, slug, metaTags } = req.body;
        let image = category.image;

        // Handle image update
        if (req.file) {
            try {
                // Delete old image if exists
                if (category.image) {
                    await imageHandler.deleteFile(imageHandler.getImagePath(category.image));
                }

                // Process new image
                const result = await imageHandler.processImage(req.file.path, {
                    width: 800,
                    height: 600,
                    quality: 80,
                    format: 'webp',
                    filename: `category-${uuidv4()}`
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

        // Check for duplicate name if name is being updated
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({
                where: {
                    name: name,
                    id: { [Op.ne]: category.id } // Exclude current category
                }
            });

            if (existingCategory) {
                return res.status(400).json({ 
                    message: 'Category with this name already exists',
                    error: 'DUPLICATE_CATEGORY_NAME'
                });
            }
        }

        await category.update({
            name,
            description,
            status,
            parentId,
            image,
            seoTitle,
            seoDescription,
            seoKeywords,
            slug,
            metaTags
        });

        // Get updated category with parent info
        const updatedCategory = await Category.findByPk(category.id, {
            include: [{
                model: Category,
                as: 'parent',
                attributes: ['id', 'name']
            }]
        });

        // Format response
        const categoryResponse = formatCategoryResponse(updatedCategory);

        res.status(200).json({ 
            message: 'Category updated successfully', 
            category: categoryResponse 
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete Category
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Delete image if exists
        if (category.image) {
            await imageHandler.deleteFile(imageHandler.getImagePath(category.image));
        }
        
        await category.destroy();
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: error.message });
    }
};

export {
    createCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory,
    upload
};