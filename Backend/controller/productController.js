const { Product, ProductVariation, Attribute, AttributeValue, ProductVariationAttribute, ProductImage, ProductSEO, ProductBadge, ProductBadgeMapping, ProductDiscount } = require('../model/associations');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const ImageHandler = require('../utils/imageHandler');
const createUploadMiddleware = require('../middleware/uploadMiddleware');
const slugify = require('slugify');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

// Initialize image handler
const imageHandler = new ImageHandler(path.join(__dirname, '../uploads/products'));

// Create upload middleware for product images
const upload = createUploadMiddleware(path.join(__dirname, '../uploads/products'), 'image');

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
        const now = new Date();
        const activeDiscount = productData.discounts.find(discount => 
            discount.status === 'active' && 
            new Date(discount.startDate) <= now && 
            new Date(discount.endDate) >= now
        );
        
        if (activeDiscount) {
            productData.activeDiscount = {
                id: activeDiscount.id,
                discountType: activeDiscount.discountType,
                discountValue: activeDiscount.discountValue,
                startDate: activeDiscount.startDate,
                endDate: activeDiscount.endDate
            };
            
            // Calculate discounted prices for variations if they exist
            if (productData.variations) {
                productData.variations = productData.variations.map(variation => {
                    let discountedPrice = variation.price;
                    if (activeDiscount.discountType === 'percentage') {
                        discountedPrice = variation.price - (variation.price * activeDiscount.discountValue / 100);
                    } else if (activeDiscount.discountType === 'fixed') {
                        discountedPrice = Math.max(0, variation.price - activeDiscount.discountValue);
                    }
                    return {
                        ...variation,
                        originalPrice: variation.price,
                        discountedPrice: parseFloat(discountedPrice.toFixed(2))
                    };
                });
            }
        }
    }

    return productData;
};

// Create Product
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            status,
            variations,
            attributes,
            seo,
            badges,
            discount
        } = req.body;

        // Generate slug from name
        const slug = slugify(name, { lower: true, strict: true });

        // Start transaction
        const result = await sequelize.transaction(async (t) => {
            // Create product
            const product = await Product.create({
                name,
                slug,
                description,
                status
            }, { transaction: t });

            // Handle images
            if (req.files && req.files.length > 0) {
                const imagePromises = req.files.map(async (file, index) => {
                    const result = await imageHandler.processImage(file.path, {
                        width: 800,
                        height: 800,
                        quality: 80,
                        format: 'webp',
                        filename: `product-${product.id}-${uuidv4()}`
                    });

                    if (!result.success) {
                        throw new Error(result.error);
                    }

                    return ProductImage.create({
                        productId: product.id,
                        imageName: result.filename,
                        altText: `${name} - Image ${index + 1}`,
                        isDefault: index === 0
                    }, { transaction: t });
                });

                await Promise.all(imagePromises);
            }

            // Handle variations
            if (variations && variations.length > 0) {
                for (const variation of variations) {
                    const productVariation = await ProductVariation.create({
                        productId: product.id,
                        sku: variation.sku,
                        price: variation.price,
                        stock: variation.stock,
                        status: variation.status || 'active'
                    }, { transaction: t });

                    // Handle variation attributes
                    if (variation.attributes) {
                        const attributePromises = variation.attributes.map(async (attr) => {
                            const attributeValue = await AttributeValue.findOne({
                                where: {
                                    attributeId: attr.attributeId,
                                    value: attr.value
                                }
                            });

                            if (attributeValue) {
                                await ProductVariationAttribute.create({
                                    variationId: productVariation.id,
                                    attributeId: attr.attributeId,
                                    valueId: attributeValue.id
                                }, { transaction: t });
                            }
                        });

                        await Promise.all(attributePromises);
                    }
                }
            }

            // Handle SEO
            if (seo) {
                await ProductSEO.create({
                    productId: product.id,
                    ...seo
                }, { transaction: t });
            }

            // Handle badges
            if (badges && badges.length > 0) {
                const badgePromises = badges.map(badgeId =>
                    ProductBadgeMapping.create({
                        productId: product.id,
                        badgeId
                    }, { transaction: t })
                );
                await Promise.all(badgePromises);
            }

            // Handle product discount
            if (discount) {
                // Validate discount data
                if (discount.discountType === 'percentage' && (discount.discountValue <= 0 || discount.discountValue > 100)) {
                    throw new Error('Percentage discount must be between 0 and 100');
                }

                if (discount.discountType === 'fixed' && discount.discountValue <= 0) {
                    throw new Error('Fixed discount value must be greater than 0');
                }

                await ProductDiscount.create({
                    productId: product.id,
                    discountType: discount.discountType,
                    discountValue: discount.discountValue,
                    startDate: discount.startDate || new Date(),
                    endDate: discount.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    status: discount.status || 'active'
                }, { transaction: t });
            }

            return product;
        });

        // Get complete product with associations
        const product = await Product.findByPk(result.id, {
            include: [
                {
                    model: ProductImage,
                    as: 'images'
                },
                {
                    model: ProductVariation,
                    as: 'variations',
                    include: [{
                        model: AttributeValue,
                        as: 'attributeValues',
                        include: [{
                            model: Attribute,
                            as: 'attribute'
                        }]
                    }]
                },
                {
                    model: ProductSEO,
                    as: 'seo'
                },
                {
                    model: ProductBadge,
                    as: 'badges'
                },
                {
                    model: ProductDiscount,
                    as: 'discounts'
                }
            ]
        });

        // Format response
        const productResponse = formatProductResponse(product);

        res.status(201).json({
            message: 'Product created successfully',
            product: productResponse
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get All Products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                {
                    model: ProductImage,
                    as: 'images',
                    where: { isDefault: true },
                    required: false
                },
                {
                    model: ProductVariation,
                    as: 'variations',
                    include: [{
                        model: AttributeValue,
                        as: 'attributeValues',
                        include: [{
                            model: Attribute,
                            as: 'attribute'
                        }]
                    }]
                },
                {
                    model: ProductSEO,
                    as: 'seo'
                },
                {
                    model: ProductBadge,
                    as: 'badges'
                },
                {
                    model: ProductDiscount,
                    as: 'discounts',
                    where: {
                        status: 'active',
                        startDate: { [Op.lte]: new Date() },
                        endDate: { [Op.gte]: new Date() }
                    },
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const productsResponse = products.map(formatProductResponse);
        res.status(200).json(productsResponse);
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get Product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: ProductImage,
                    as: 'images'
                },
                {
                    model: ProductVariation,
                    as: 'variations',
                    include: [{
                        model: AttributeValue,
                        as: 'attributeValues',
                        include: [{
                            model: Attribute,
                            as: 'attribute'
                        }]
                    }]
                },
                {
                    model: ProductSEO,
                    as: 'seo'
                },
                {
                    model: ProductBadge,
                    as: 'badges'
                },
                {
                    model: ProductDiscount,
                    as: 'discounts',
                    where: {
                        status: 'active',
                        startDate: { [Op.lte]: new Date() },
                        endDate: { [Op.gte]: new Date() }
                    },
                    required: false
                }
            ]
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productResponse = formatProductResponse(product);
        res.status(200).json(productResponse);
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const {
            name,
            description,
            status,
            variations,
            seo,
            badges,
            discount // New discount data
        } = req.body;

        // Check if product exists
        const existingProduct = await Product.findByPk(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await sequelize.transaction(async (t) => {
            // Update basic product info
            if (name || description || status) {
                await existingProduct.update({
                    name: name || existingProduct.name,
                    slug: name ? slugify(name, { lower: true, strict: true }) : existingProduct.slug,
                    description: description || existingProduct.description,
                    status: status || existingProduct.status
                }, { transaction: t });
            }

            // Handle images
            if (req.files && req.files.length > 0) {
                // Get existing images
                const existingImages = await ProductImage.findAll({
                    where: { productId }
                });

                // Delete existing images from storage
                for (const img of existingImages) {
                    await imageHandler.deleteImage(img.imageName);
                }

                // Delete from database
                await ProductImage.destroy({
                    where: { productId },
                    transaction: t
                });

                // Upload new images
                const imagePromises = req.files.map(async (file, index) => {
                    const result = await imageHandler.processImage(file.path, {
                        width: 800,
                        height: 800,
                        quality: 80,
                        format: 'webp',
                        filename: `product-${productId}-${uuidv4()}`
                    });

                    if (!result.success) {
                        throw new Error(result.error);
                    }

                    return ProductImage.create({
                        productId: productId,
                        imageName: result.filename,
                        altText: `${name || existingProduct.name} - Image ${index + 1}`,
                        isDefault: index === 0
                    }, { transaction: t });
                });

                await Promise.all(imagePromises);
            }

            // Handle variations
            if (variations && variations.length > 0) {
                // Delete existing variations and their attributes
                await ProductVariation.destroy({
                    where: { productId },
                    transaction: t
                });

                // Create new variations
                for (const variation of variations) {
                    const productVariation = await ProductVariation.create({
                        productId: productId,
                        sku: variation.sku,
                        price: variation.price,
                        stock: variation.stock,
                        status: variation.status || 'active'
                    }, { transaction: t });

                    // Handle variation attributes
                    if (variation.attributes) {
                        const attributePromises = variation.attributes.map(async (attr) => {
                            const attributeValue = await AttributeValue.findOne({
                                where: {
                                    attributeId: attr.attributeId,
                                    value: attr.value
                                }
                            });

                            if (attributeValue) {
                                await ProductVariationAttribute.create({
                                    variationId: productVariation.id,
                                    attributeId: attr.attributeId,
                                    valueId: attributeValue.id
                                }, { transaction: t });
                            }
                        });

                        await Promise.all(attributePromises);
                    }
                }
            }

            // Handle SEO
            if (seo) {
                await ProductSEO.upsert({
                    productId: productId,
                    ...seo
                }, { transaction: t });
            }

            // Handle badges
            if (badges) {
                // Remove existing badge mappings
                await ProductBadgeMapping.destroy({
                    where: { productId },
                    transaction: t
                });

                // Add new badge mappings
                if (badges.length > 0) {
                    const badgePromises = badges.map(badgeId =>
                        ProductBadgeMapping.create({
                            productId: productId,
                            badgeId
                        }, { transaction: t })
                    );
                    await Promise.all(badgePromises);
                }
            }

            // Handle product discount
            if (discount) {
                // Find existing active discount
                const existingDiscount = await ProductDiscount.findOne({
                    where: { 
                        productId,
                        status: 'active'
                    },
                    transaction: t
                });

                // Validate discount data
                if (discount.discountType === 'percentage' && (discount.discountValue <= 0 || discount.discountValue > 100)) {
                    throw new Error('Percentage discount must be between 0 and 100');
                }

                if (discount.discountType === 'fixed' && discount.discountValue <= 0) {
                    throw new Error('Fixed discount value must be greater than 0');
                }

                if (existingDiscount) {
                    // Update existing discount
                    await existingDiscount.update({
                        discountType: discount.discountType || existingDiscount.discountType,
                        discountValue: discount.discountValue || existingDiscount.discountValue,
                        startDate: discount.startDate || existingDiscount.startDate,
                        endDate: discount.endDate || existingDiscount.endDate,
                        status: discount.status || existingDiscount.status
                    }, { transaction: t });
                } else {
                    // Create new discount
                    await ProductDiscount.create({
                        productId: productId,
                        discountType: discount.discountType,
                        discountValue: discount.discountValue,
                        startDate: discount.startDate || new Date(),
                        endDate: discount.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                        status: discount.status || 'active'
                    }, { transaction: t });
                }
            }
        });

        // Get updated product with associations
        const updatedProduct = await Product.findByPk(productId, {
            include: [
                {
                    model: ProductImage,
                    as: 'images'
                },
                {
                    model: ProductVariation,
                    as: 'variations',
                    include: [{
                        model: AttributeValue,
                        as: 'attributeValues',
                        include: [{
                            model: Attribute,
                            as: 'attribute'
                        }]
                    }]
                },
                {
                    model: ProductSEO,
                    as: 'seo'
                },
                {
                    model: ProductBadge,
                    as: 'badges'
                },
                {
                    model: ProductDiscount,
                    as: 'discounts'
                }
            ]
        });

        // Format response
        const productResponse = formatProductResponse(updatedProduct);

        res.status(200).json({
            message: 'Product updated successfully',
            product: productResponse
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete product images
        const images = await ProductImage.findAll({
            where: { productId: product.id }
        });

        for (const image of images) {
            await imageHandler.deleteFile(imageHandler.getImagePath(image.imageName));
        }

        // Delete product and all related records
        await product.destroy();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    upload
}; 