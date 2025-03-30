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
const ProductDiscount = require('./productDiscountModel');
const Coupon = require('./couponModel');
const Wishlist = require('./wishlistModel');

// New models for order management
const Order = require('./orderModel');
const OrderItem = require('./orderItemModel');
const ShippingAddress = require('./shippingAddressModel');
const ShippingFee = require('./shippingFeeModel');
const OrderStatusHistory = require('./orderStatusHistoryModel');
const Payment = require('./paymentModel');

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

// Product Discount Associations
Product.hasMany(ProductDiscount, { foreignKey: 'productId' });
ProductDiscount.belongsTo(Product, { foreignKey: 'productId' });

// Wishlist Associations
User.belongsToMany(Product, { through: Wishlist, foreignKey: 'userId' });
Product.belongsToMany(User, { through: Wishlist, foreignKey: 'productId' });
User.hasMany(Wishlist, { foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });

// New associations for order management

// User to Order relationship
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// Order to OrderItem relationship
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// Product to OrderItem relationship
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

// ProductVariation to OrderItem relationship
ProductVariation.hasMany(OrderItem, { foreignKey: 'variation_id' });
OrderItem.belongsTo(ProductVariation, { foreignKey: 'variation_id' });

// User to ShippingAddress relationship
User.hasMany(ShippingAddress, { foreignKey: 'user_id' });
ShippingAddress.belongsTo(User, { foreignKey: 'user_id' });

// Order to OrderStatusHistory relationship
Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id' });

// User to OrderStatusHistory relationship (for updated_by)
User.hasMany(OrderStatusHistory, { foreignKey: 'updated_by' });
OrderStatusHistory.belongsTo(User, { foreignKey: 'updated_by' });

// Order to Payment relationship
Order.hasMany(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

// User to Payment relationship
User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

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
    ProductBadgeMapping,
    ProductDiscount,
    Coupon,
    Wishlist,
    Order,
    OrderItem,
    ShippingAddress,
    ShippingFee,
    OrderStatusHistory,
    Payment
}; 