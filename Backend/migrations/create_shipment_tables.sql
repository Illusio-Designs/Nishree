-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    shiprocket_order_id VARCHAR(255) NULL COMMENT 'Order ID from Shiprocket',
    shipment_id VARCHAR(255) NULL COMMENT 'Shipment ID from Shiprocket',
    awb_code VARCHAR(255) NULL COMMENT 'Air Waybill Code',
    courier_name VARCHAR(255) NULL COMMENT 'Courier partner name',
    courier_id INT NULL COMMENT 'Courier ID from Shiprocket',
    status VARCHAR(50) DEFAULT 'pending' COMMENT 'Shipment status',
    tracking_url TEXT NULL COMMENT 'Tracking URL for the shipment',
    estimated_delivery_date DATETIME NULL,
    shipped_date DATETIME NULL,
    delivered_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_shiprocket_order_id (shiprocket_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
