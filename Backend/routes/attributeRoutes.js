import express from 'express';
import {
    getAllAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    addAttributeValues,
    removeAttributeValues
} from '../controller/attributeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all attributes
router.get('/', getAllAttributes);

// Create a new attribute
router.post('/', authenticateToken, createAttribute);

// Update an attribute
router.put('/:id', authenticateToken, updateAttribute);

// Delete an attribute
router.delete('/:id', authenticateToken, deleteAttribute);

// Add values to an attribute
router.post('/:id/values', authenticateToken, addAttributeValues);

// Remove values from an attribute
router.delete('/:id/values', authenticateToken, removeAttributeValues);

export default router; 