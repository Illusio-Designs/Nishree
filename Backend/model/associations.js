const User = require('./userModel');
const Category = require('./categoryModel');
const Slider = require('./sliderModel');
const Product = require('./productModel');
const ProductVariation = require('./productVariationModel');
const Attribute = require('./attributeModel');
const AttributeValue = require('./attributeValueModel');
const ProductVariationAttribute = require('./productVariationAttributeModel');
const ProductImage = require('./productImageModel');
const ProductSEO = require('./productSEOModel');
const ProductBadge = require('./productBadgeModel');
const ProductBadgeMapping = require('./productBadgeMappingModel');

// Category Associations
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });

// Slider Associations
Slider.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Slider, { foreignKey: 'categoryId' });

// Product Associations
Product.hasMany(ProductVariation, { foreignKey: 'productId' });
ProductVariation.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(ProductImage, { foreignKey: 'productId' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

Product.hasOne(ProductSEO, { foreignKey: 'productId' });
ProductSEO.belongsTo(Product, { foreignKey: 'productId' });

Product.belongsToMany(ProductBadge, { 
    through: ProductBadgeMapping,
    foreignKey: 'productId'
});
ProductBadge.belongsToMany(Product, { 
    through: ProductBadgeMapping,
    foreignKey: 'badgeId'
});

// ProductVariation Associations
ProductVariation.hasMany(ProductImage, { foreignKey: 'variationId' });
ProductImage.belongsTo(ProductVariation, { foreignKey: 'variationId' });

ProductVariation.belongsToMany(AttributeValue, {
    through: ProductVariationAttribute,
    foreignKey: 'variationId'
});
AttributeValue.belongsToMany(ProductVariation, {
    through: ProductVariationAttribute,
    foreignKey: 'valueId'
});

// Attribute Associations
Attribute.hasMany(AttributeValue, { foreignKey: 'attributeId' });
AttributeValue.belongsTo(Attribute, { foreignKey: 'attributeId' });

module.exports = {
    User,
    Category,
    Slider,
    Product,
    ProductVariation,
    Attribute,
    AttributeValue,
    ProductVariationAttribute,
    ProductImage,
    ProductSEO,
    ProductBadge,
    ProductBadgeMapping
}; 