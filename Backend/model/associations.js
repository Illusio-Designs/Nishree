// Import models
import { User } from './userModel.js';
import { Category } from './categoryModel.js';
import { Slider } from './sliderModel.js';
import { Product } from './productModel.js';
import { ProductVariation } from './productVariationModel.js';
import { Attribute } from './attributeModel.js';
import { AttributeValue } from './attributeValueModel.js';
import { ProductImage } from './productImageModel.js';
import { ProductSEO } from './productSEOModel.js';
import { Coupon } from './couponModel.js';
import { Cart } from './cartModel.js';
import { CartItem } from './cartItemModel.js';
import { Order } from './orderModel.js';
import { OrderItem } from './orderItemModel.js';
import { ShippingAddress } from './shippingAddressModel.js';
import { ShippingFee } from './shippingFeeModel.js';
import { OrderStatusHistory } from './orderStatusHistoryModel.js';
import { Payment } from './paymentModel.js';
import { Review } from './reviewModel.js';
import { ReviewImage } from './reviewImageModel.js';
import { SeoMetadata } from './seoMetadataModel.js';
import { CouponUsage } from './couponUsageModel.js';
import { Shipment } from './shipmentModel.js';
// B2B management models
import { Zone } from './zoneModel.js';
import { Party } from './partyModel.js';
import { Distributor } from './distributorModel.js';
import { DistributorState } from './distributorStateModel.js';
import { DistributorZone } from './distributorZoneModel.js';
import { Salesman } from './salesmanModel.js';
import { SalesmanState } from './salesmanStateModel.js';
import { SalesmanZone } from './salesmanZoneModel.js';
import { SalesmanCheckin } from './salesmanCheckinModel.js';
import { SalesmanTarget } from './salesmanTargetModel.js';
import { SalesmanExpense } from './salesmanExpenseModel.js';
import { Offer } from './offerModel.js';
import { Event } from './eventModel.js';
import { AuditLog } from './auditLogModel.js';
// import { Notification } from './notificationModel.js';

// Export all models
export {
    User,
    Category,
    Slider,
    Product,
    ProductVariation,
    Attribute,
    AttributeValue,
    ProductImage,
    ProductSEO,
    Coupon,
    Cart,
    CartItem,
    Order,
    OrderItem,
    ShippingAddress,
    ShippingFee,
    OrderStatusHistory,
    Payment,
    Review,
    ReviewImage,
    SeoMetadata,
    CouponUsage,
    Shipment,
    // B2B management
    Zone,
    Party,
    Distributor,
    DistributorState,
    DistributorZone,
    Salesman,
    SalesmanState,
    SalesmanZone,
    SalesmanCheckin,
    SalesmanTarget,
    SalesmanExpense,
    Offer,
    Event,
    AuditLog
    // Notification
};

// User Associations
User.hasMany(Order, { 
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Order.belongsTo(User, { 
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Cart, { 
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Cart.belongsTo(User, { 
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Category Associations
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// Category self-referential association
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

// Product Associations
Product.hasMany(ProductVariation, { foreignKey: 'productId', as: 'ProductVariations' });
ProductVariation.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'ProductImages' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

Product.hasOne(ProductSEO, { foreignKey: 'product_id', as: 'ProductSEO' });
ProductSEO.belongsTo(Product, { foreignKey: 'product_id' });

// Product Variation and Attribute Associations
ProductVariation.belongsToMany(Attribute, { 
    through: AttributeValue,
    foreignKey: 'variationId',
    otherKey: 'attributeId'
});
Attribute.belongsToMany(ProductVariation, { 
    through: AttributeValue,
    foreignKey: 'attributeId',
    otherKey: 'variationId'
});

// Order Associations
Order.hasMany(OrderItem, { 
    foreignKey: 'orderId',
    onDelete: 'CASCADE'
});
OrderItem.belongsTo(Order, { 
    foreignKey: 'orderId',
    onDelete: 'CASCADE'
});

// OrderItem to Product Association
OrderItem.belongsTo(Product, { 
    foreignKey: 'product_id',
    as: 'Product'
});
Product.hasMany(OrderItem, { 
    foreignKey: 'product_id'
});

// OrderItem to ProductVariation Association
OrderItem.belongsTo(ProductVariation, { 
    foreignKey: 'variation_id',
    as: 'Variation'
});
ProductVariation.hasMany(OrderItem, { 
    foreignKey: 'variation_id'
});

Order.hasMany(OrderStatusHistory, { 
    foreignKey: 'orderId',
    onDelete: 'CASCADE'
});
OrderStatusHistory.belongsTo(Order, { 
    foreignKey: 'orderId',
    onDelete: 'CASCADE'
});

Order.hasOne(Payment, { 
    foreignKey: 'orderId',
    onDelete: 'CASCADE'
});
Payment.belongsTo(Order, { 
    foreignKey: 'orderId',
    onDelete: 'CASCADE'
});

Order.hasOne(ShippingAddress, { 
    foreignKey: 'orderId',
    onDelete: 'CASCADE'
});
ShippingAddress.belongsTo(Order, { 
    foreignKey: 'orderId',
    onDelete: 'CASCADE'
});

// Cart Associations
Cart.hasMany(CartItem, { 
    foreignKey: 'cartId',
    onDelete: 'CASCADE'
});
CartItem.belongsTo(Cart, { 
    foreignKey: 'cartId',
    onDelete: 'CASCADE'
});

// Review Associations
Review.hasMany(ReviewImage, { 
    foreignKey: 'reviewId',
    onDelete: 'CASCADE'
});
ReviewImage.belongsTo(Review, { 
    foreignKey: 'reviewId',
    onDelete: 'CASCADE'
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
// Coupon Associations
Coupon.hasMany(CouponUsage, { foreignKey: 'couponId', as: 'CouponUsages' });
CouponUsage.belongsTo(Coupon, { foreignKey: 'couponId' });

User.hasMany(CouponUsage, { foreignKey: 'userId', as: 'CouponUsages' });
CouponUsage.belongsTo(User, { foreignKey: 'userId' });

// Shipment Associations
Order.hasOne(Shipment, {
    foreignKey: 'order_id',
    onDelete: 'CASCADE'
});
Shipment.belongsTo(Order, {
    foreignKey: 'order_id',
    onDelete: 'CASCADE'
});

// ---------------------------------------------------------------------------
// B2B Management Associations
// ---------------------------------------------------------------------------

// Optional login accounts for B2B end-user roles.
User.hasOne(Party, { foreignKey: 'user_id' });
Party.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Distributor, { foreignKey: 'user_id' });
Distributor.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Salesman, { foreignKey: 'user_id' });
Salesman.belongsTo(User, { foreignKey: 'user_id' });

// A party may be routed through a distributor and belongs to a zone.
Distributor.hasMany(Party, { foreignKey: 'distributor_id', as: 'Parties' });
Party.belongsTo(Distributor, { foreignKey: 'distributor_id' });

Zone.hasMany(Party, { foreignKey: 'zone_id' });
Party.belongsTo(Zone, { foreignKey: 'zone_id' });

// Distributor territory (states + zones).
Distributor.hasMany(DistributorState, { foreignKey: 'distributor_id', as: 'States', onDelete: 'CASCADE' });
DistributorState.belongsTo(Distributor, { foreignKey: 'distributor_id' });

Distributor.hasMany(DistributorZone, { foreignKey: 'distributor_id', as: 'Zones', onDelete: 'CASCADE' });
DistributorZone.belongsTo(Distributor, { foreignKey: 'distributor_id' });
Zone.hasMany(DistributorZone, { foreignKey: 'zone_id' });
DistributorZone.belongsTo(Zone, { foreignKey: 'zone_id' });

// Salesman territory (states + zones).
Salesman.hasMany(SalesmanState, { foreignKey: 'salesman_id', as: 'States', onDelete: 'CASCADE' });
SalesmanState.belongsTo(Salesman, { foreignKey: 'salesman_id' });

Salesman.hasMany(SalesmanZone, { foreignKey: 'salesman_id', as: 'Zones', onDelete: 'CASCADE' });
SalesmanZone.belongsTo(Salesman, { foreignKey: 'salesman_id' });
Zone.hasMany(SalesmanZone, { foreignKey: 'zone_id' });
SalesmanZone.belongsTo(Zone, { foreignKey: 'zone_id' });

// Salesman activity.
Salesman.hasMany(SalesmanCheckin, { foreignKey: 'salesman_id', as: 'Checkins', onDelete: 'CASCADE' });
SalesmanCheckin.belongsTo(Salesman, { foreignKey: 'salesman_id' });
Party.hasMany(SalesmanCheckin, { foreignKey: 'party_id' });
SalesmanCheckin.belongsTo(Party, { foreignKey: 'party_id' });

Salesman.hasMany(SalesmanTarget, { foreignKey: 'salesman_id', as: 'Targets', onDelete: 'CASCADE' });
SalesmanTarget.belongsTo(Salesman, { foreignKey: 'salesman_id' });

Salesman.hasMany(SalesmanExpense, { foreignKey: 'salesman_id', as: 'Expenses', onDelete: 'CASCADE' });
SalesmanExpense.belongsTo(Salesman, { foreignKey: 'salesman_id' });

// B2B orders reuse the unified Order table (channel = 'b2b').
Party.hasMany(Order, { foreignKey: 'party_id' });
Order.belongsTo(Party, { foreignKey: 'party_id' });

Distributor.hasMany(Order, { foreignKey: 'distributor_id' });
Order.belongsTo(Distributor, { foreignKey: 'distributor_id' });

Salesman.hasMany(Order, { foreignKey: 'salesman_id' });
Order.belongsTo(Salesman, { foreignKey: 'salesman_id' });

Event.hasMany(Order, { foreignKey: 'event_id' });
Order.belongsTo(Event, { foreignKey: 'event_id' });

// Audit trail actor.
User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

// Notification Associations - Commented out temporarily
// User.hasMany(Notification, { 
//     foreignKey: {
//         name: 'user_id',
//         allowNull: false
//     },
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE'
// });
// Notification.belongsTo(User, { 
//     foreignKey: {
//         name: 'user_id',
//         allowNull: false
//     },
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE'
// });

// Order.hasMany(Notification, { 
//     foreignKey: {
//         name: 'order_id',
//         allowNull: true
//     },
//     onDelete: 'SET NULL',
//     onUpdate: 'CASCADE'
// });
// Notification.belongsTo(Order, { 
//     foreignKey: {
//         name: 'order_id',
//         allowNull: true
//     },
//     onDelete: 'SET NULL',
//     onUpdate: 'CASCADE'
// });
