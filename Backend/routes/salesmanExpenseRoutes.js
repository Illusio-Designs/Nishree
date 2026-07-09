import express from 'express';
import {
    getAllExpenses,
    createExpense,
    setExpenseStatus,
    deleteExpense
} from '../controller/salesmanExpenseController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'sales_manager', 'expense_manager'];

router.get('/', isAuthenticated, authorize([...MANAGERS, 'salesman', 'reports_manager']), getAllExpenses);
router.post('/', isAuthenticated, authorize([...MANAGERS, 'salesman']), upload.single('receipt'), createExpense);
router.patch('/:id/status', isAuthenticated, authorize(MANAGERS), setExpenseStatus);
router.delete('/:id', isAuthenticated, authorize([...MANAGERS, 'salesman']), deleteExpense);

export default router;
