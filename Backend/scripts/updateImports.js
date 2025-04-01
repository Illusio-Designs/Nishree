import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filesToUpdate = [
    'model/orderStatusHistoryModel.js',
    'model/productImageModel.js',
    'model/productDiscountModel.js',
    'model/productBadgeModel.js',
    'model/productBadgeMappingModel.js',
    'model/paymentModel.js',
    'model/productVariationAttributeModel.js',
    'model/reviewCommentModel.js',
    'model/reviewImageModel.js',
    'model/reviewLikeModel.js',
    'model/productVariationModel.js',
    'model/productSEOModel.js',
    'model/shippingFeeModel.js',
    'model/wishlistModel.js',
    'model/shippingAddressModel.js',
    'model/settingsModel.js',
    'model/reviewReportModel.js',
    'model/seoMetadataModel.js',
    'model/reviewModel.js',
    'model/orderModel.js',
    'model/orderItemModel.js',
    'model/couponModel.js',
    'model/attributeValueModel.js',
    'model/attributeModel.js',
    'controller/orderController.js',
    'controller/orderStatusHistoryController.js',
    'controller/reviewController.js',
    'controller/shippingAddressController.js',
    'controller/shippingFeeController.js',
    'controller/productController.js',
    'controller/paymentController.js',
    'integration/facebookCatalog.js',
    'integration/dashboardAnalytics.js'
];

const updateFile = (filePath) => {
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(
        /import sequelize from ['"]\.\.\/config\/db\.js['"]/,
        "import { sequelize } from '../config/db.js'"
    );
    fs.writeFileSync(fullPath, content);
    console.log(`Updated: ${filePath}`);
};

filesToUpdate.forEach(updateFile); 