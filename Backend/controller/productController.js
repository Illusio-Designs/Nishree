import { Product, ProductVariation, Attribute, AttributeValue, ProductVariationAttribute, ProductImage, ProductSEO, ProductBadge, ProductBadgeMapping, ProductDiscount, Category } from '../model/associations.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import ImageHandler from '../utils/imageHandler.js';
import { upload } from '../middleware/uploadMiddleware.js';
import slugify from 'slugify';
import { sequelize } from '../config/db.js';
import { Op } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize image handler
const imageHandler = new ImageHandler(path.join(__dirname, '../uploads/products'));

// Helper function to format product response
const formatProductResponse = (product) => {
    const productData = product.toJSON();
    
    // Add image URLs
    if (productData.images) {
        productData.images = productData.images.map(img => ({
            ...img,
            url: `/uploads/products/${img.imageName}`
        }));
    }

    // Add category details
    if (productData.Category) {
        productData.category = {
            id: productData.Category.id,
            name: productData.Category.name,
            slug: productData.Category.slug
        };
        delete productData.Category;
    }

    // Add variation details
    if (productData.variations) {
        productData.variations = productData.variations.map(variation => ({
            ...variation,
            attributes: variation.attributeValues?.map(av => ({
                name: av.attribute.name,
                value: av.value
            }))
        }));
    }

    // Add badge details
    if (productData.badges) {
        productData.badges = productData.badges.map(badge => ({
            name: badge.name,
            type: badge.badgeType,
            color: badge.colorCode,
            icon: badge.iconName
        }));
    }

    // Add active discount details if any
    if (productData.discounts && productData.discounts.length > 0) {
        const activeDiscount = productData.discounts.find(d => 
            new Date(d.startDate) <= new Date() && 
            (!d.endDate || new Date(d.endDate) >= new Date())
        );
        if (activeDiscount) {
            productData.activeDiscount = {
                type: activeDiscount.discountType,
                value: activeDiscount.discountValue,
                startDate: activeDiscount.startDate,
                endDate: activeDiscount.endDate
            };
        }
    }

    return productData;
};

// Create a new product
export const createProduct = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        console.log('Received request body:', req.body);
        console.log('Received files:', req.files);

        // Parse form data
        const name = req.body.name?.trim();
        const description = req.body.description?.trim();
        const categoryId = req.body.categoryId;
        const status = req.body.status || 'active';
        const variations = JSON.parse(req.body.variations || '[]');
        const seo = JSON.parse(req.body.seo || '{}');
        const images = req.files;

        // Validate required fields
        if (!name) {
            throw new Error('Product name is required');
        }

        if (!categoryId) {
            throw new Error('Category is required');
        }

        // Validate category
        const category = await Category.findByPk(categoryId);
        if (!category) {
            throw new Error('Invalid category');
        }

        // Create product with basic info
        const product = await Product.create({
            name,
            description,
            categoryId,
            status,
            slug: slugify(name, { lower: true })
        }, { transaction });

        // Create SEO record
        await ProductSEO.create({
            product_id: product.id,
            meta_title: seo.metaTitle || name,
            meta_description: seo.metaDescription || description,
            meta_keywords: seo.metaKeywords || '',
            og_title: seo.ogTitle || name,
            og_description: seo.ogDescription || description,
            og_image: seo.ogImage
        }, { transaction });

        // Handle variations
        if (variations && variations.length > 0) {
            for (const variation of variations) {
                if (!variation.price || isNaN(variation.price) || variation.price <= 0) {
                    throw new Error('Invalid price for variation');
                }

                await ProductVariation.create({
                    productId: product.id,
                    sku: variation.sku || `SKU-${product.id}-${Date.now()}`,
                    price: Number(variation.price),
                    comparePrice: variation.comparePrice ? Number(variation.comparePrice) : null,
                    stock: Number(variation.stock || 0),
                    weight: variation.weight ? Number(variation.weight) : null,
                    weightUnit: variation.weightUnit || 'g',
                    attributes: variation.attributes || {}
                }, { transaction });
            }
        }

        // Handle images
        if (images && images.length > 0) {
            console.log('Processing images:', images.length, 'files');
            
            // Create an array of image creation promises
            const imagePromises = images.map(async (image) => {
                console.log('Processing image:', image.originalname);
                return ProductImage.create({
                    product_id: product.id,
                    image_url: `/uploads/products/${image.filename}`,
                    alt_text: name,
                    display_order: 0,
                    is_primary: false,
                    status: 'active'
                }, { transaction });
            });

            // Wait for all images to be created
            await Promise.all(imagePromises);
            console.log('All images processed successfully');
        }

        await transaction.commit();
        
        // Fetch the complete product with all relations
        const completeProduct = await Product.findByPk(product.id, {
            include: [
                { model: Category },
                { model: ProductVariation },
                { model: ProductImage },
                { model: ProductSEO }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: formatProductResponse(completeProduct)
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
};

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const { category, search, sort, page = 1, limit = 10 } = req.query;
        
        // Build filter
        const filter = {};
        if (category) filter.categoryId = category;
        if (search) {
            filter[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Build sort options
        const sortOptions = [];
        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions.push([field, order.toUpperCase()]);
        }

        // Get products with pagination
        const products = await Product.findAndCountAll({
            where: filter,
            order: sortOptions,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            include: [
                { model: Category },
                { model: ProductVariation, include: [{ model: AttributeValue, include: [{ model: Attribute }] }] },
                { model: ProductImage },
                { model: ProductBadge, through: ProductBadgeMapping },
                { model: ProductSEO },
                { model: ProductDiscount }
            ]
        });

        res.json({
            products: products.rows.map(formatProductResponse),
            total: products.count,
            page: parseInt(page),
            totalPages: Math.ceil(products.count / parseInt(limit))
        });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ message: 'Failed to get products', error: error.message });
    }
};

// Get product by ID
export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findByPk(id, {
            include: [
                { model: Category },
                { model: ProductVariation, include: [{ model: AttributeValue, include: [{ model: Attribute }] }] },
                { model: ProductImage },
                { model: ProductBadge, through: ProductBadgeMapping },
                { model: ProductSEO },
                { model: ProductDiscount }
            ]
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(formatProductResponse(product));
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({ message: 'Failed to get product', error: error.message });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const {
            name,
            description,
            categoryId,
            status,
            variations,
            badges,
            seo,
            images
        } = req.body;

        // Validate category if provided
        if (categoryId) {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                throw new Error('Invalid category');
            }
        }

        // Find product
        const product = await Product.findByPk(id, {
            include: [
                { model: Category },
                { model: ProductVariation },
                { model: ProductImage },
                { model: ProductBadge, through: ProductBadgeMapping },
                { model: ProductSEO }
            ],
            transaction
        });

        if (!product) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update basic info
        await product.update({
            name,
            description,
            categoryId,
            status,
            slug: name ? slugify(name, { lower: true }) : product.slug
        }, { transaction });

        // Handle variations
        if (variations) {
            // Delete existing variations
            await ProductVariation.destroy({
                where: { productId: id },
                transaction
            });

            // Create new variations
            for (const variation of variations) {
                const productVariation = await ProductVariation.create({
                    productId: id,
                    price: variation.price,
                    stock: variation.stock,
                    sku: variation.sku || uuidv4()
                }, { transaction });

                // Handle variation attributes
                if (variation.attributes) {
                    for (const attr of variation.attributes) {
                        const [attribute] = await Attribute.findOrCreate({
                            where: { name: attr.name },
                            transaction
                        });

                        const [attributeValue] = await AttributeValue.findOrCreate({
                            where: {
                                attributeId: attribute.id,
                                value: attr.value
                            },
                            transaction
                        });

                        await ProductVariationAttribute.create({
                            variationId: productVariation.id,
                            attributeValueId: attributeValue.id
                        }, { transaction });
                    }
                }
            }
        }

        // Handle badges
        if (badges) {
            // Delete existing badge mappings
            await ProductBadgeMapping.destroy({
                where: { productId: id },
                transaction
            });

            // Create new badge mappings
            for (const badge of badges) {
                const [productBadge] = await ProductBadge.findOrCreate({
                    where: { name: badge.name },
                    defaults: {
                        badgeType: badge.type,
                        colorCode: badge.color,
                        iconName: badge.icon
                    },
                    transaction
                });

                await ProductBadgeMapping.create({
                    productId: id,
                    badgeId: productBadge.id
                }, { transaction });
            }
        }

        // Handle SEO
        if (seo) {
            if (product.ProductSEO) {
                await product.ProductSEO.update({
                    title: seo.title,
                    description: seo.description,
                    keywords: seo.keywords
                }, { transaction });
            } else {
                await ProductSEO.create({
                    productId: id,
                    title: seo.title,
                    description: seo.description,
                    keywords: seo.keywords
                }, { transaction });
            }
        }

        // Handle images
        if (images) {
            // Delete existing images
            await ProductImage.destroy({
                where: { productId: id },
                transaction
            });

            // Create new images
            for (const image of images) {
                await ProductImage.create({
                    product_id: id,
                    image_url: `/uploads/products/${image.name}`,
                    alt_text: name,
                    display_order: 0,
                    is_primary: image.isPrimary || false,
                    status: 'active'
                }, { transaction });
            }
        }

        await transaction.commit();

        // Fetch updated product
        const updatedProduct = await Product.findByPk(id, {
            include: [
                { model: ProductVariation, include: [{ model: AttributeValue, include: [{ model: Attribute }] }] },
                { model: ProductImage },
                { model: ProductBadge, through: ProductBadgeMapping },
                { model: ProductSEO },
                { model: ProductDiscount }
            ]
        });

        res.json({
            message: 'Product updated successfully',
            product: formatProductResponse(updatedProduct)
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Failed to update product', error: error.message });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        
        const product = await Product.findByPk(id, {
            include: [{ model: ProductImage }],
            transaction
        });

        if (!product) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete product images
        for (const image of product.ProductImages) {
            await imageHandler.deleteFile(path.join(__dirname, '../uploads/products', image.imageName));
        }

        // Delete product and all related records
        await product.destroy({ transaction });

        await transaction.commit();

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
};

// Example function to get best-selling products
export const getBestSellers = async (req, res) => {
    try {
        const bestSellers = await Product.findAll({
            where: { soldCount: { [Op.gt]: 0 } }, // Assuming you have a soldCount field
            order: [['soldCount', 'DESC']],
            limit: 10 // Limit to top 10 best sellers
        });

        res.json(bestSellers);
    } catch (error) {
        console.error('Error fetching best sellers:', error);
        res.status(500).json({ message: 'Failed to fetch best sellers', error: error.message });
    }
};

// Example function to get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await Product.findAll({
            where: { isFeatured: true }, // Assuming you have an isFeatured field
            limit: 10 // Limit to top 10 featured products
        });

        res.json(featuredProducts);
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({ message: 'Failed to fetch featured products', error: error.message });
    }
};

// Example function to get new arrivals
export const getNewArrivals = async (req, res) => {
    try {
        const newArrivals = await Product.findAll({
            order: [['createdAt', 'DESC']], // Assuming you want the latest products
            limit: 10 // Limit to top 10 new arrivals
        });

        res.json(newArrivals);
    } catch (error) {
        console.error('Error fetching new arrivals:', error);
        res.status(500).json({ message: 'Failed to fetch new arrivals', error: error.message });
    }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const products = await Product.findAll({
            where: { categoryId },
            include: [
                { model: ProductVariation, include: [{ model: AttributeValue, include: [{ model: Attribute }] }] },
                { model: ProductImage },
                { model: ProductBadge, through: ProductBadgeMapping },
                { model: ProductSEO },
                { model: ProductDiscount }
            ]
        });

        if (!products.length) {
            return res.status(404).json({ message: 'No products found for this category' });
        }

        res.json(products.map(formatProductResponse));
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ message: 'Failed to fetch products by category', error: error.message });
    }
};

// Search products
export const searchProducts = async (req, res) => {
    try {
        const { query } = req.query;

        const products = await Product.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${query}%`
                }
            },
            include: [
                { model: ProductVariation, include: [{ model: AttributeValue, include: [{ model: Attribute }] }] },
                { model: ProductImage },
                { model: ProductBadge, through: ProductBadgeMapping },
                { model: ProductSEO },
                { model: ProductDiscount }
            ]
        });

        if (!products.length) {
            return res.status(404).json({ message: 'No products found matching your search' });
        }

        res.json(products.map(formatProductResponse));
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Failed to search products', error: error.message });
    }
};

