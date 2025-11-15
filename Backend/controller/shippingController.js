import { ShippingAddress } from '../model/shippingAddressModel.js';
import { ShippingFee } from '../model/shippingFeeModel.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';

// ==================== SHIPPING ADDRESS CONTROLLERS ====================

// Create a new shipping address
export const createShippingAddress = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { address, city, state, postal_code, country, phone_number, is_default } = req.body;
        const userId = req.user.id;

        if (!address || !city || !state || !postal_code || !country || !phone_number) {
            await transaction.rollback();
            return res.status(400).json({ message: 'All fields are required' });
        }

        // If setting as default, unset any existing default address
        if (is_default) {
            await ShippingAddress.update(
                { is_default: false },
                { where: { user_id: userId, is_default: true }, transaction }
            );
        }

        // Check if this is the first address for the user
        const addressCount = await ShippingAddress.count({ where: { user_id: userId }, transaction });
        const makeDefault = addressCount === 0 ? true : (is_default || false);

        const shippingAddress = await ShippingAddress.create({
            user_id: userId,
            address,
            city,
            state,
            postal_code,
            country,
            phone_number,
            is_default: makeDefault
        }, { transaction });

        await transaction.commit();
        res.status(201).json({ message: 'Shipping address created successfully', shippingAddress });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating shipping address:', error);
        res.status(500).json({ message: 'Failed to create shipping address', error: error.message });
    }
};

// Get all shipping addresses for a user
export const getUserShippingAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const shippingAddresses = await ShippingAddress.findAll({
            where: { user_id: userId },
            order: [['is_default', 'DESC'], ['createdAt', 'DESC']]
        });
        res.json({ shippingAddresses });
    } catch (error) {
        console.error('Error getting shipping addresses:', error);
        res.status(500).json({ message: 'Failed to get shipping addresses', error: error.message });
    }
};

// Get a shipping address by ID
export const getShippingAddressById = async (req, res) => {
    try {
        const addressId = req.params.id;
        const userId = req.user.id;

        const shippingAddress = await ShippingAddress.findOne({
            where: { id: addressId, user_id: userId }
        });

        if (!shippingAddress) {
            return res.status(404).json({ message: 'Shipping address not found' });
        }

        res.json({ shippingAddress });
    } catch (error) {
        console.error('Error getting shipping address:', error);
        res.status(500).json({ message: 'Failed to get shipping address', error: error.message });
    }
};

// Update a shipping address
export const updateShippingAddress = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const addressId = req.params.id;
        const userId = req.user.id;
        const { address, city, state, postal_code, country, phone_number, is_default } = req.body;

        const shippingAddress = await ShippingAddress.findOne({
            where: { id: addressId, user_id: userId },
            transaction
        });

        if (!shippingAddress) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Shipping address not found' });
        }

        // If setting as default, unset any existing default address
        if (is_default) {
            await ShippingAddress.update(
                { is_default: false },
                { where: { user_id: userId, is_default: true, id: { [Op.ne]: addressId } }, transaction }
            );
        }

        await shippingAddress.update({
            address: address || shippingAddress.address,
            city: city || shippingAddress.city,
            state: state || shippingAddress.state,
            postal_code: postal_code || shippingAddress.postal_code,
            country: country || shippingAddress.country,
            phone_number: phone_number || shippingAddress.phone_number,
            is_default: is_default !== undefined ? is_default : shippingAddress.is_default
        }, { transaction });

        await transaction.commit();

        const updatedAddress = await ShippingAddress.findByPk(addressId);
        res.json({ message: 'Shipping address updated successfully', shippingAddress: updatedAddress });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating shipping address:', error);
        res.status(500).json({ message: 'Failed to update shipping address', error: error.message });
    }
};

// Delete a shipping address
export const deleteShippingAddress = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const addressId = req.params.id;
        const userId = req.user.id;

        const shippingAddress = await ShippingAddress.findOne({
            where: { id: addressId, user_id: userId },
            transaction
        });

        if (!shippingAddress) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Shipping address not found' });
        }

        const wasDefault = shippingAddress.is_default;
        await shippingAddress.destroy({ transaction });

        // If the deleted address was the default, set a new default
        if (wasDefault) {
            const anotherAddress = await ShippingAddress.findOne({
                where: { user_id: userId },
                order: [['createdAt', 'DESC']],
                transaction
            });

            if (anotherAddress) {
                anotherAddress.is_default = true;
                await anotherAddress.save({ transaction });
            }
        }

        await transaction.commit();
        res.json({ message: 'Shipping address deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting shipping address:', error);
        res.status(500).json({ message: 'Failed to delete shipping address', error: error.message });
    }
};

// Set a shipping address as default
export const setDefaultShippingAddress = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const addressId = req.params.id;
        const userId = req.user.id;

        const shippingAddress = await ShippingAddress.findOne({
            where: { id: addressId, user_id: userId },
            transaction
        });

        if (!shippingAddress) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Shipping address not found' });
        }

        await ShippingAddress.update(
            { is_default: false },
            { where: { user_id: userId, is_default: true }, transaction }
        );

        shippingAddress.is_default = true;
        await shippingAddress.save({ transaction });

        await transaction.commit();
        res.json({ message: 'Default shipping address updated successfully', shippingAddress });
    } catch (error) {
        await transaction.rollback();
        console.error('Error setting default shipping address:', error);
        res.status(500).json({ message: 'Failed to set default shipping address', error: error.message });
    }
};

// ==================== SHIPPING FEE CONTROLLERS ====================

// Get all shipping fees
export const getAllShippingFees = async (req, res) => {
    try {
        const shippingFees = await ShippingFee.findAll();
        res.json({ shippingFees });
    } catch (error) {
        console.error('Error getting shipping fees:', error);
        res.status(500).json({ message: 'Failed to get shipping fees', error: error.message });
    }
};

// Create or update shipping fee
export const createOrUpdateShippingFee = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { order_type, fee, weight_based_fee, location_based_fee } = req.body;
        
        if (!order_type || fee === undefined) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Order type and fee are required' });
        }
        
        const existingFee = await ShippingFee.findOne({ where: { order_type }, transaction });
        
        let shippingFee;
        if (existingFee) {
            shippingFee = existingFee;
            shippingFee.fee = fee;
            shippingFee.weight_based_fee = weight_based_fee !== undefined ? weight_based_fee : shippingFee.weight_based_fee;
            shippingFee.location_based_fee = location_based_fee !== undefined ? location_based_fee : shippingFee.location_based_fee;
            await shippingFee.save({ transaction });
        } else {
            shippingFee = await ShippingFee.create({
                order_type,
                fee,
                weight_based_fee: weight_based_fee || 0,
                location_based_fee: location_based_fee || 0
            }, { transaction });
        }
        
        await transaction.commit();
        res.status(existingFee ? 200 : 201).json({
            message: `Shipping fee ${existingFee ? 'updated' : 'created'} successfully`,
            shippingFee
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating/updating shipping fee:', error);
        res.status(500).json({ message: 'Failed to create/update shipping fee', error: error.message });
    }
};

// Get shipping fee by order type
export const getShippingFeeByType = async (req, res) => {
    try {
        const orderType = req.params.type;
        const shippingFee = await ShippingFee.findOne({ where: { order_type: orderType } });
        
        if (!shippingFee) {
            return res.status(404).json({ message: 'Shipping fee not found for this order type' });
        }
        
        res.json({ shippingFee });
    } catch (error) {
        console.error('Error getting shipping fee:', error);
        res.status(500).json({ message: 'Failed to get shipping fee', error: error.message });
    }
};

// Delete shipping fee
export const deleteShippingFee = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const feeId = req.params.id;
        const shippingFee = await ShippingFee.findByPk(feeId, { transaction });
        
        if (!shippingFee) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Shipping fee not found' });
        }
        
        await shippingFee.destroy({ transaction });
        await transaction.commit();
        res.json({ message: 'Shipping fee deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting shipping fee:', error);
        res.status(500).json({ message: 'Failed to delete shipping fee', error: error.message });
    }
};
