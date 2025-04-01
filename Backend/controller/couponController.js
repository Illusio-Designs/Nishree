import { Coupon } from '../model/associations.js';
import { Op } from 'sequelize';

// Create a new coupon
export const createCoupon = async (req, res) => {
    try {
        const {
            code,
            discountType,
            discountValue,
            minOrderAmount,
            maxUsage,
            validFrom,
            validTo,
            status
        } = req.body;

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({
            where: { code: code.toUpperCase() }
        });

        if (existingCoupon) {
            return res.status(400).json({
                message: 'Coupon code already exists'
            });
        }

        // Validate discount value based on type
        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
            return res.status(400).json({
                message: 'Percentage discount must be between 0 and 100'
            });
        }

        if (discountType === 'fixed' && discountValue <= 0) {
            return res.status(400).json({
                message: 'Fixed discount value must be greater than 0'
            });
        }

        // Validate min order amount
        if (minOrderAmount < 0) {
            return res.status(400).json({
                message: 'Minimum order amount cannot be negative'
            });
        }

        // Validate max usage
        if (maxUsage < 1) {
            return res.status(400).json({
                message: 'Maximum usage must be at least 1'
            });
        }

        // Validate dates
        const startDate = new Date(validFrom);
        const endDate = new Date(validTo);

        if (endDate <= startDate) {
            return res.status(400).json({
                message: 'End date must be after start date'
            });
        }

        // Create the coupon
        const newCoupon = await Coupon.create({
            code: code.toUpperCase(), // Store coupon codes in uppercase
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxUsage: maxUsage || 1,
            usedCount: 0,
            validFrom: startDate,
            validTo: endDate,
            status: status || 'active'
        });

        res.status(201).json({
            message: 'Coupon created successfully',
            coupon: newCoupon
        });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({
            message: 'Failed to create coupon',
            error: error.message
        });
    }
};

// Get all coupons
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll();

        res.status(200).json({
            count: coupons.length,
            coupons
        });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({
            message: 'Failed to fetch coupons',
            error: error.message
        });
    }
};

// Get a single coupon by ID
export const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.status(200).json(coupon);
    } catch (error) {
        console.error('Error fetching coupon:', error);
        res.status(500).json({
            message: 'Failed to fetch coupon',
            error: error.message
        });
    }
};

// Validate a coupon
export const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        // Find the coupon
        const coupon = await Coupon.findOne({
            where: { 
                code: code.toUpperCase(),
                status: 'active',
                validFrom: { [Op.lte]: new Date() },
                validTo: { [Op.gte]: new Date() }
            }
        });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or expired coupon code' });
        }

        // Check if coupon is already used to its maximum
        if (coupon.usedCount >= coupon.maxUsage) {
            return res.status(400).json({ message: 'Coupon has reached maximum usage limit' });
        }

        // Check if order meets minimum amount
        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({ 
                message: `Order must be at least ${coupon.minOrderAmount} to use this coupon` 
            });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
        } else {
            discountAmount = coupon.discountValue;
            // Ensure discount doesn't exceed order amount
            if (discountAmount > orderAmount) {
                discountAmount = orderAmount;
            }
        }

        res.status(200).json({
            message: 'Coupon is valid',
            coupon,
            discountAmount,
            finalAmount: orderAmount - discountAmount
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({
            message: 'Failed to validate coupon',
            error: error.message
        });
    }
};

// Apply a coupon (increment used count)
export const applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        // Find the coupon
        const coupon = await Coupon.findOne({
            where: { 
                code: code.toUpperCase(),
                status: 'active',
                validFrom: { [Op.lte]: new Date() },
                validTo: { [Op.gte]: new Date() }
            }
        });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or expired coupon code' });
        }

        // Check if coupon is already used to its maximum
        if (coupon.usedCount >= coupon.maxUsage) {
            return res.status(400).json({ message: 'Coupon has reached maximum usage limit' });
        }

        // Increment used count
        await coupon.update({
            usedCount: coupon.usedCount + 1
        });

        res.status(200).json({
            message: 'Coupon applied successfully',
            coupon
        });
    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({
            message: 'Failed to apply coupon',
            error: error.message
        });
    }
};

// Update a coupon
export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            code,
            discountType,
            discountValue,
            minOrderAmount,
            maxUsage,
            validFrom,
            validTo,
            status
        } = req.body;

        const coupon = await Coupon.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Check if updated code already exists (if changing the code)
        if (code && code !== coupon.code) {
            const existingCoupon = await Coupon.findOne({
                where: { 
                    code: code.toUpperCase(),
                    id: { [Op.ne]: id }
                }
            });

            if (existingCoupon) {
                return res.status(400).json({
                    message: 'Coupon code already exists'
                });
            }
        }

        // Validate discount value based on type
        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
            return res.status(400).json({
                message: 'Percentage discount must be between 0 and 100'
            });
        }

        if (discountType === 'fixed' && discountValue <= 0) {
            return res.status(400).json({
                message: 'Fixed discount value must be greater than 0'
            });
        }

        // Validate min order amount
        if (minOrderAmount && minOrderAmount < 0) {
            return res.status(400).json({
                message: 'Minimum order amount cannot be negative'
            });
        }

        // Validate max usage
        if (maxUsage && maxUsage < 1) {
            return res.status(400).json({
                message: 'Maximum usage must be at least 1'
            });
        }

        // Validate dates
        let startDate = coupon.validFrom;
        let endDate = coupon.validTo;

        if (validFrom) startDate = new Date(validFrom);
        if (validTo) endDate = new Date(validTo);

        if (endDate <= startDate) {
            return res.status(400).json({
                message: 'End date must be after start date'
            });
        }

        // Update the coupon
        await coupon.update({
            code: code ? code.toUpperCase() : coupon.code,
            discountType: discountType || coupon.discountType,
            discountValue: discountValue || coupon.discountValue,
            minOrderAmount: minOrderAmount !== undefined ? minOrderAmount : coupon.minOrderAmount,
            maxUsage: maxUsage || coupon.maxUsage,
            validFrom: startDate,
            validTo: endDate,
            status: status || coupon.status
        });

        res.status(200).json({
            message: 'Coupon updated successfully',
            coupon
        });
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({
            message: 'Failed to update coupon',
            error: error.message
        });
    }
};

// Delete a coupon
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        await coupon.destroy();

        res.status(200).json({
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({
            message: 'Failed to delete coupon',
            error: error.message
        });
    }
}; 