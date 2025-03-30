const multer = require('multer');
const path = require('path');
const fsSync = require('fs');

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

    // Create multer instance
    const upload = multer({ 
        storage, 
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    }).single(fieldName);

    // Wrap multer middleware with error handling
    return (req, res, next) => {
        upload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ 
                        message: 'File size too large. Maximum size is 5MB.',
                        error: 'FILE_TOO_LARGE'
                    });
                }
                return res.status(400).json({ 
                    message: 'Error uploading file',
                    error: err.message
                });
            } else if (err) {
                return res.status(400).json({ 
                    message: 'Invalid file type',
                    error: err.message
                });
            }
            next();
        });
    };
};

module.exports = createUploadMiddleware; 