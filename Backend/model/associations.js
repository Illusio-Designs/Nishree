// Import models
import { User } from './userModel.js';
import { Category } from './categoryModel.js';
import { Slider } from './sliderModel.js';
import { Product } from './productModel.js';
import { ProductVariation } from './productVariationModel.js';
import { Attribute } from './attributeModel.js';
import { AttributeValue } from './attributeValueModel.js';
import { ProductVariationAttribute } from './productVariationAttributeModel.js';
import { ProductImage } from './productImageModel.js';
import { ProductSEO } from './productSEOModel.js';
import { ProductBadge } from './productBadgeModel.js';
import { ProductBadgeMapping } from './productBadgeMappingModel.js';
import { ProductDiscount } from './productDiscountModel.js';
import { Coupon } from './couponModel.js';
import { Wishlist } from './wishlistModel.js';
import { Cart } from './cartModel.js';
import { CartItem } from './cartItemModel.js';
import { Order } from './orderModel.js';
import { OrderItem } from './orderItemModel.js';
import { ShippingAddress } from './shippingAddressModel.js';
import { ShippingFee } from './shippingFeeModel.js';
import { OrderStatusHistory } from './orderStatusHistoryModel.js';
import { Payment } from './paymentModel.js';
import { Settings } from './settingsModel.js';
import { Review } from './reviewModel.js';
import { ReviewImage } from './reviewImageModel.js';
import { SeoMetadata } from './seoMetadataModel.js';

// Export all models
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
    Cart,
    CartItem,
    Order,
    OrderItem,
    ShippingAddress,
    ShippingFee,
    OrderStatusHistory,
    Payment,
    Settings,
    Review,
    ReviewImage,
    SeoMetadata
};

// Add explicit constraint for featured_review_id to fix foreign key issue
// Wrap in try-catch to prevent errors during initialization
try {
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
Product.belongsTo(Category, { 
    foreignKey: 'categoryId',
    onDelete: 'SET NULL'
});
Category.hasMany(Product, { 
    foreignKey: 'categoryId',
    onDelete: 'SET NULL'
});

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
Payment.belongsTo(User, { foreignKey: 'user_id' });

// Cart Associations
User.hasOne(Cart, { foreignKey: 'user_id' });
Cart.belongsTo(User, { foreignKey: 'user_id' });

Cart.hasMany(CartItem, { 
    foreignKey: 'cart_id',
    onDelete: 'CASCADE'
});
CartItem.belongsTo(Cart, { 
    foreignKey: 'cart_id',
    onDelete: 'CASCADE'
});

Product.hasMany(CartItem, { foreignKey: 'product_id' });
CartItem.belongsTo(Product, { 
    foreignKey: 'product_id',
    onDelete: 'SET NULL'
});

ProductVariation.hasMany(CartItem, { foreignKey: 'variation_id' });
CartItem.belongsTo(ProductVariation, { 
    foreignKey: 'variation_id',
    onDelete: 'SET NULL'
});

// Coupon Associations
Coupon.belongsToMany(Product, {
    through: 'coupon_products',
    foreignKey: 'coupon_id',
    otherKey: 'product_id'
});
Product.belongsToMany(Coupon, {
    through: 'coupon_products',
    foreignKey: 'product_id',
    otherKey: 'coupon_id'
});

// Settings Associations
Settings.belongsTo(User, { foreignKey: 'updated_by' });
User.hasMany(Settings, { foreignKey: 'updated_by' });

// Review Associations
Review.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Review, { foreignKey: 'user_id' });

Review.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(Review, { foreignKey: 'product_id' });

Review.hasMany(ReviewImage, { foreignKey: 'review_id' });
ReviewImage.belongsTo(Review, { foreignKey: 'review_id' });