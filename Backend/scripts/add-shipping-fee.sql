-- Add shipping fee for prepaid orders
-- Run this SQL in your database

-- First, check if prepaid shipping fee exists
SELECT * FROM shipping_fees WHERE orderType = 'prepaid';

-- If not exists, insert it
INSERT INTO shipping_fees (orderType, fee, weightBasedFee, locationBasedFee, createdAt, updatedAt) 
VALUES ('prepaid', 0.00, 0.00, 0.00, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    fee = 0.00,
    weightBasedFee = 0.00,
    locationBasedFee = 0.00,
    updatedAt = NOW();

-- Verify the data
SELECT * FROM shipping_fees;
