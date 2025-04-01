// Import all models
import User from './userModel.js';
import Category from './categoryModel.js';
import Slider from './sliderModel.js';
import Product from './productModel.js';
import ProductVariation from './productVariationModel.js';
import Attribute from './attributeModel.js';
import AttributeValue from './attributeValueModel.js';
import ProductVariationAttribute from './productVariationAttributeModel.js';
import ProductImage from './productImageModel.js';
import ProductSEO from './productSEOModel.js';
import ProductBadge from './productBadgeModel.js';
import ProductBadgeMapping from './productBadgeMappingModel.js';
import ProductDiscount from './productDiscountModel.js';
import Coupon from './couponModel.js';
import Wishlist from './wishlistModel.js';

// Order management models
import Order from './orderModel.js';
import OrderItem from './orderItemModel.js';
import ShippingAddress from './shippingAddressModel.js';
import ShippingFee from './shippingFeeModel.js';
import OrderStatusHistory from './orderStatusHistoryModel.js';
import Payment from './paymentModel.js';

// Review system models
import Review from './reviewModel.js';
import ReviewImage from './reviewImageModel.js';
import ReviewLike from './reviewLikeModel.js';
import ReviewComment from './reviewCommentModel.js';
import ReviewReport from './reviewReportModel.js';

// Add explicit constraint for featured_review_id to fix foreign key issue
// Wrap in try-catch to prevent errors during initialization
try {
    const { sequelize } = require('../config/db.js');
    sequelize.query(`
        ALTER TABLE products 
        ADD CONSTRAINT fk_products_featured_review 
        FOREIGN KEY (featured_review_id) 
        REFERENCES reviews(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
    `).catch(err => {
        // Just log any errors instead of breaking initialization
        console.log('Note: Featured review constraint will be added after tables are created');
    });
} catch (error) {
    // Ignore errors during initial setup
}

// Category Associations
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });

// Slider Associations
Slider.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Slider, { foreignKey: 'categoryId' });

// Product Associations - Ensure clear foreign key constraints
Product.hasMany(ProductVariation, { 
    foreignKey: 'productId',
    onDelete: 'CASCADE'
});
ProductVariation.belongsTo(Product, { 
    foreignKey: 'productId',
    onDelete: 'CASCADE'
});

Product.hasMany(ProductImage, { 
    foreignKey: 'productId',
    onDelete: 'CASCADE'
});
ProductImage.belongsTo(Product, { 
    foreignKey: 'productId',
    onDelete: 'CASCADE'
});

Product.hasOne(ProductSEO, { 
    foreignKey: 'productId',
    onDelete: 'CASCADE'
});
ProductSEO.belongsTo(Product, { 
    foreignKey: 'productId',
    onDelete: 'CASCADE'
});

Product.belongsToMany(ProductBadge, { 
    through: ProductBadgeMapping,
    foreignKey: 'productId',
    otherKey: 'badgeId'
});
ProductBadge.belongsToMany(Product, { 
    through: ProductBadgeMapping,
    foreignKey: 'badgeId',
    otherKey: 'productId'
});

// ProductVariation Associations
ProductVariation.hasMany(ProductImage, { 
    foreignKey: 'variationId',
    onDelete: 'CASCADE'
});
ProductImage.belongsTo(ProductVariation, { 
    foreignKey: 'variationId',
    onDelete: 'SET NULL'
});

ProductVariation.belongsToMany(AttributeValue, {
    through: ProductVariationAttribute,
    foreignKey: 'variationId',
    otherKey: 'valueId'
});
AttributeValue.belongsToMany(ProductVariation, {
    through: ProductVariationAttribute,
    foreignKey: 'valueId',
    otherKey: 'variationId'
});

// Attribute Associations
Attribute.hasMany(AttributeValue, { 
    foreignKey: 'attributeId',
    onDelete: 'CASCADE'
});
AttributeValue.belongsTo(Attribute, { 
    foreignKey: 'attributeId',
    onDelete: 'CASCADE'
});

// Product Discount Associations
Product.hasMany(ProductDiscount, { 
    foreignKey: 'productId',
    onDelete: 'CASCADE'
});
ProductDiscount.belongsTo(Product, { 
    foreignKey: 'productId',
    onDelete: 'CASCADE'
});

// Wishlist Associations
User.belongsToMany(Product, { 
    through: Wishlist, 
    foreignKey: 'userId',
    otherKey: 'productId'
});
Product.belongsToMany(User, { 
    through: Wishlist, 
    foreignKey: 'productId',
    otherKey: 'userId'
});
User.hasMany(Wishlist, { foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });

// Order management associations
// Standardize field names to follow the same convention
// Either use snake_case or camelCase consistently

// User to Order relationship
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// Order to OrderItem relationship
Order.hasMany(OrderItem, { 
    foreignKey: 'order_id',
    onDelete: 'CASCADE'
});
OrderItem.belongsTo(Order, { 
    foreignKey: 'order_id',
    onDelete: 'CASCADE'
});

// Product to OrderItem relationship
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { 
    foreignKey: 'product_id',
    onDelete: 'SET NULL'
});

// ProductVariation to OrderItem relationship
ProductVariation.hasMany(OrderItem, { foreignKey: 'variation_id' });
OrderItem.belongsTo(ProductVariation, { 
    foreignKey: 'variation_id',
    onDelete: 'SET NULL'
});

// User to ShippingAddress relationship
User.hasMany(ShippingAddress, { foreignKey: 'user_id' });
ShippingAddress.belongsTo(User, { foreignKey: 'user_id' });

// Order to OrderStatusHistory relationship
Order.hasMany(OrderStatusHistory, { 
    foreignKey: 'order_id',
    onDelete: 'CASCADE'
});
OrderStatusHistory.belongsTo(Order, { 
    foreignKey: 'order_id',
    onDelete: 'CASCADE'
});

// User to OrderStatusHistory relationship (for updated_by)
User.hasMany(OrderStatusHistory, { foreignKey: 'updated_by' });
OrderStatusHistory.belongsTo(User, { 
    foreignKey: 'updated_by',
    onDelete: 'SET NULL'
});

// Order to Payment relationship
Order.hasMany(Payment, { 
    foreignKey: 'order_id',
    onDelete: 'CASCADE'
});
Payment.belongsTo(Order, { 
    foreignKey: 'order_id',
    onDelete: 'CASCADE'
});

// User to Payment relationship
User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { 
    foreignKey: 'user_id',
    onDelete: 'SET NULL'
});

// Review system associations
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { 
    foreignKey: 'user_id',
    onDelete: 'SET NULL'
});

Product.hasMany(Review, { 
    foreignKey: 'product_id',
    onDelete: 'CASCADE'
});
Review.belongsTo(Product, { 
    foreignKey: 'product_id',
    onDelete: 'CASCADE'
});

Order.hasMany(Review, { foreignKey: 'order_id' });
Review.belongsTo(Order, { 
    foreignKey: 'order_id',
    onDelete: 'SET NULL'
});

// Handle the circular reference properly
Product.belongsTo(Review, { 
    foreignKey: 'featured_review_id', 
    as: 'FeaturedReview', 
    constraints: false // Disable automatic constraint creation
});

Review.hasMany(ReviewImage, { 
    foreignKey: 'review_id',
    onDelete: 'CASCADE'
});
ReviewImage.belongsTo(Review, { 
    foreignKey: 'review_id',
    onDelete: 'CASCADE'
});

Review.hasMany(ReviewLike, { 
    foreignKey: 'review_id',
    onDelete: 'CASCADE'
});
ReviewLike.belongsTo(Review, { 
    foreignKey: 'review_id',
    onDelete: 'CASCADE'
});

User.hasMany(ReviewLike, { foreignKey: 'user_id' });
ReviewLike.belongsTo(User, { 
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

Review.hasMany(ReviewComment, { 
    foreignKey: 'review_id',
    onDelete: 'CASCADE'
});
ReviewComment.belongsTo(Review, { 
    foreignKey: 'review_id',
    onDelete: 'CASCADE'
});

User.hasMany(ReviewComment, { foreignKey: 'user_id' });
ReviewComment.belongsTo(User, { 
    foreignKey: 'user_id',
    onDelete: 'SET NULL'
});

Review.hasMany(ReviewReport, { 
    foreignKey: 'review_id',
    onDelete: 'CASCADE'
});
ReviewReport.belongsTo(Review, { 
    foreignKey: 'review_id',
    onDelete: 'CASCADE'
});

User.hasMany(ReviewReport, { foreignKey: 'user_id' });
ReviewReport.belongsTo(User, { 
    foreignKey: 'user_id',
    onDelete: 'SET NULL'
});

export {
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
    Payment,
    Review,
    ReviewImage,
    ReviewLike,
    ReviewComment,
    ReviewReport
};