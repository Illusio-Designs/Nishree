import multer from 'multer';
import path from 'path';
import fsSync from 'fs';

// Create upload middleware factory
const createUploadMiddleware = (uploadDir, fieldName = 'image') => {
    // Configure storage
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            if (!fsSync.existsSync(uploadDir)) {
                fsSync.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, `temp-${Date.now()}-${file.originalname}`);
        }
    });

    // Configure file filter
    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    };

    // Create and return the multer instance
    return multer({ 
        storage, 
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    });
};

export default createUploadMiddleware; 