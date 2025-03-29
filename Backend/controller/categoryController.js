const Category = require('../model/categoryModel');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

// Configure multer for image uploads
const uploadPath = path.join(__dirname, '../uploads/category');

// Create upload directory if it doesn't exist
const createUploadDir = async () => {
    try {
        await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
        console.error('Failed to create upload directory:', error);
    }
};
createUploadDir();

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    }
}).single('image');

// Create Category
const createCategory = async (req, res) => {
    try {
        // Handle file upload with multer
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            try {
                const { name, description, status, parentId, seoTitle, seoDescription, seoKeywords, slug, metaTags } = req.body;
                let image = null;

                if (req.file) {
                    const uniqueFilename = `category-${uuidv4()}.webp`;
                    await sharp(req.file.buffer)
                        .webp({ quality: 80 })
                        .toFile(path.join(uploadPath, uniqueFilename));
                    image = uniqueFilename;
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

                res.status(201).json({ message: 'Category created successfully', category });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    } catch (error) {
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
        res.status(500).json({ message: error.message });
    }
};

// Get Category by ID
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        category ? res.status(200).json(category) : res.status(404).json({ message: 'Category not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Category
const updateCategory = async (req, res) => {
    try {
        // Handle file upload with multer
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            try {
                const category = await Category.findByPk(req.params.id);
                if (!category) return res.status(404).json({ message: 'Category not found' });

                const { name, description, status, parentId, seoTitle, seoDescription, seoKeywords, slug, metaTags } = req.body;
                let image = category.image;

                if (req.file) {
                    const uniqueFilename = `category-${uuidv4()}.webp`;
                    await sharp(req.file.buffer)
                        .webp({ quality: 80 })
                        .toFile(path.join(uploadPath, uniqueFilename));
                    
                    if (image) {
                        try {
                            await fs.unlink(path.join(uploadPath, image));
                        } catch (error) {
                            console.log('Failed to delete old image:', error);
                        }
                    }
                    
                    image = uniqueFilename;
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

                res.status(200).json({ message: 'Category updated successfully', category });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Category
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        if (category.image) {
            try {
                await fs.unlink(path.join(uploadPath, category.image));
            } catch (error) {
                console.log('Failed to delete image:', error);
            }
        }
        
        await category.destroy();
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};