const { Product, ProductVariation, Attribute, AttributeValue, ProductVariationAttribute, ProductImage, ProductSEO, ProductBadge, ProductBadgeMapping } = require('../model');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const ImageHandler = require('../utils/imageHandler');
const createUploadMiddleware = require('../middleware/uploadMiddleware');
const slugify = require('slugify');

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
            badges
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
                }
            ]
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productResponse = formatProductResponse(product);
        res.status(200).json(productResponse);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            status,
            variations,
            attributes,
            seo,
            badges
        } = req.body;

        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Start transaction
        await sequelize.transaction(async (t) => {
            // Update basic product info
            if (name) {
                product.slug = slugify(name, { lower: true, strict: true });
            }
            await product.update({
                name: name || product.name,
                description: description || product.description,
                status: status || product.status
            }, { transaction: t });

            // Handle new images
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
                        altText: `${product.name} - Image ${index + 1}`,
                        isDefault: index === 0
                    }, { transaction: t });
                });

                await Promise.all(imagePromises);
            }

            // Handle variations update
            if (variations) {
                // Delete existing variations
                await ProductVariation.destroy({
                    where: { productId: product.id },
                    transaction: t
                });

                // Create new variations
                for (const variation of variations) {
                    const productVariation = await ProductVariation.create({
                        productId: product.id,
                        sku: variation.sku,
                        price: variation.price,
                        stock: variation.stock,
                        status: variation.status || 'active'
                    }, { transaction: t });

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

            // Handle SEO update
            if (seo) {
                await ProductSEO.upsert({
                    productId: product.id,
                    ...seo
                }, { transaction: t });
            }

            // Handle badges update
            if (badges) {
                // Delete existing badge mappings
                await ProductBadgeMapping.destroy({
                    where: { productId: product.id },
                    transaction: t
                });

                // Create new badge mappings
                const badgePromises = badges.map(badgeId =>
                    ProductBadgeMapping.create({
                        productId: product.id,
                        badgeId
                    }, { transaction: t })
                );
                await Promise.all(badgePromises);
            }
        });

        // Get updated product with associations
        const updatedProduct = await Product.findByPk(product.id, {
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
                }
            ]
        });

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