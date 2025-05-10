import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = [
        path.join(__dirname, '../uploads'),
        path.join(__dirname, '../uploads/products'),
        path.join(__dirname, '../uploads/categories'),
        path.join(__dirname, '../uploads/users')
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

// Create directories
createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = path.join(__dirname, '../uploads');
        
        // Determine the correct upload directory based on the field name
        if (file.fieldname === 'images') {
            uploadPath = path.join(uploadPath, 'products');
        } else if (file.fieldname === 'categoryImage') {
            uploadPath = path.join(uploadPath, 'categories');
        } else if (file.fieldname === 'profileImage') {
            uploadPath = path.join(uploadPath, 'users');
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

export default upload; 