import express from 'express';
import {
    getPublicBlogs,
    getPublicBlog,
    getAllBlogs,
    createBlog,
    updateBlog,
    deleteBlog
} from '../controller/blogController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'reports_manager'];

// Public
router.get('/public', getPublicBlogs);
router.get('/public/:slug', getPublicBlog);

// Admin
router.get('/', isAuthenticated, authorize(MANAGERS), getAllBlogs);
router.post('/', isAuthenticated, authorize(MANAGERS), upload.single('image'), createBlog);
router.put('/:id', isAuthenticated, authorize(MANAGERS), upload.single('image'), updateBlog);
router.delete('/:id', isAuthenticated, authorize(MANAGERS), deleteBlog);

export default router;
