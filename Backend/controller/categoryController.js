import { Category } from '../model/categoryModel.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import fsSync from 'fs';
import { Op } from 'sequelize';
import ImageHandler from '../utils/imageHandler.js';
import { upload } from '../middleware/uploadMiddleware.js';
import slugify from 'slugify';

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
// Update createCategory function
const createCategory = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            status, 
            parentId, 
            metaTitle, 
            metaDescription, 
            metaKeywords
        } = req.body;
        
        // Generate slug from name
        const slug = slugify(name, { lower: true });

        // Check for duplicate category name
        const existingCategory = await Category.findOne({
            where: { 
                [Op.or]: [
                    { name },
                    { slug }
                ]
            }
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

        // Create category with correct field names
        const category = await Category.create({
            name,
            description,
            status,
            parentId,
            image,
            metaTitle,
            metaDescription,
            metaKeywords,
            slug
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
            include: [{
                model: Category,
                as: 'parent',
                attributes: ['id', 'name']
            }],
            order: [['createdAt', 'DESC']]
        });

        // Format the response
        const formattedCategories = categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            status: category.status,
            parentId: category.parentId,
            parentName: category.parent ? category.parent.name : null,
            image: category.image,
            seoTitle: category.seoTitle,
            seoDescription: category.seoDescription,
            seoKeywords: category.seoKeywords,
            slug: category.slug,
            metaTags: category.metaTags,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        }));

        res.status(200).json(formattedCategories);
    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete Category
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        
        // Check if category exists
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if category is being used as a parent
        const hasChildren = await Category.findOne({
            where: { parentId: categoryId }
        });

        if (hasChildren) {
            return res.status(400).json({ 
                message: 'Cannot delete category: it has child categories',
                error: 'HAS_CHILD_CATEGORIES'
            });
        }

        // Check if category is being used in products (if you have products)
        // const hasProducts = await Product.findOne({
        //     where: { categoryId: categoryId }
        // });
        // if (hasProducts) {
        //     return res.status(400).json({ 
        //         message: 'Cannot delete category: it is being used in products',
        //         error: 'CATEGORY_IN_USE'
        //     });
        // }

        // Delete image if exists
        if (category.image) {
            try {
                await imageHandler.deleteFile(imageHandler.getImagePath(category.image));
            } catch (imageError) {
                console.error('Error deleting image:', imageError);
                // Continue with category deletion even if image deletion fails
            }
        }
        
        await category.destroy();
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
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
// Update updateCategory function
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const { 
            name, 
            description, 
            status, 
            parentId, 
            metaTitle, 
            metaDescription, 
            metaKeywords
        } = req.body;
        
        // Generate new slug if name is changed
        const slug = name !== category.name ? slugify(name, { lower: true }) : category.slug;

        // Check for duplicate slug if name is changed
        if (name !== category.name) {
            const existingCategory = await Category.findOne({
                where: { 
                    [Op.or]: [
                        { name },
                        { slug }
                    ],
                    id: { [Op.ne]: category.id }
                }
            });

            if (existingCategory) {
                return res.status(400).json({ 
                    message: 'Category with this name already exists',
                    error: 'DUPLICATE_CATEGORY_NAME'
                });
            }
        }

        let image = category.image;

        // Handle image update logic...

        await category.update({
            name,
            description,
            status,
            parentId,
            image,
            metaTitle,
            metaDescription,
            metaKeywords,
            slug
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

// Get Public Categories
const getPublicCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: {
                status: 'active'
            },
            include: [{
                model: Category,
                as: 'parent',
                attributes: ['id', 'name']
            }],
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'name', 'description', 'image', 'slug', 'parentId']
        });

        // Format the response
        const formattedCategories = categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            parentId: category.parentId,
            parentName: category.parent ? category.parent.name : null,
            image: category.image,
            slug: category.slug
        }));

        res.status(200).json(formattedCategories);
    } catch (error) {
        console.error('Get public categories error:', error);
        res.status(500).json({ message: error.message });
    }
};

export {
    createCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory,
    getPublicCategories,
    upload
};