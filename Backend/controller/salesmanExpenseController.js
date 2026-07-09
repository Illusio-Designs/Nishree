import { SalesmanExpense } from '../model/salesmanExpenseModel.js';
import { Salesman } from '../model/salesmanModel.js';
import { writeAudit } from '../utils/audit.js';

// A salesman may only file expenses against their own profile; managers may file
// on behalf of any salesman via an explicit salesman_id.
const resolveSalesmanId = async (req) => {
    if (req.body.salesman_id && ['admin', 'sales_manager', 'expense_manager'].includes(req.user.role)) {
        return parseInt(req.body.salesman_id, 10);
    }
    const salesman = await Salesman.findOne({ where: { user_id: req.user.id } });
    return salesman ? salesman.id : null;
};

// List expenses. Salesmen see their own; managers see all (optionally filtered).
export const getAllExpenses = async (req, res) => {
    try {
        const where = {};
        if (['admin', 'sales_manager', 'expense_manager', 'reports_manager'].includes(req.user.role)) {
            if (req.query.salesman_id) where.salesman_id = req.query.salesman_id;
            if (req.query.status) where.status = req.query.status;
        } else {
            const salesman = await Salesman.findOne({ where: { user_id: req.user.id } });
            if (!salesman) return res.json([]);
            where.salesman_id = salesman.id;
        }
        const expenses = await SalesmanExpense.findAll({
            where,
            include: [{ model: Salesman, attributes: ['id', 'name'] }],
            order: [['expense_date', 'DESC']]
        });
        res.json(expenses);
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
    }
};

// Create expense
export const createExpense = async (req, res) => {
    try {
        const { amount, expense_date } = req.body;
        if (amount == null || !expense_date) {
            return res.status(400).json({ message: 'amount and expense_date are required' });
        }
        const salesman_id = await resolveSalesmanId(req);
        if (!salesman_id) return res.status(403).json({ message: 'No salesman profile linked to this account' });

        const expense = await SalesmanExpense.create({
            ...req.body,
            salesman_id,
            receipt: req.file ? req.file.filename : null
        });
        await writeAudit({ userId: req.user?.id, entity: 'SalesmanExpense', entityId: expense.id, action: 'create', newValues: expense.toJSON() });
        res.status(201).json({ message: 'Expense logged successfully', expense });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ message: 'Failed to log expense', error: error.message });
    }
};

// Approve / reject an expense (managers only)
export const setExpenseStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'status must be pending, approved or rejected' });
        }
        const expense = await SalesmanExpense.findByPk(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        const oldValues = expense.toJSON();
        await expense.update({ status });
        await writeAudit({ userId: req.user?.id, entity: 'SalesmanExpense', entityId: expense.id, action: 'update', oldValues, newValues: expense.toJSON() });
        res.json({ message: `Expense ${status}`, expense });
    } catch (error) {
        console.error('Set expense status error:', error);
        res.status(500).json({ message: 'Failed to update expense status', error: error.message });
    }
};

// Delete expense
export const deleteExpense = async (req, res) => {
    try {
        const expense = await SalesmanExpense.findByPk(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        const oldValues = expense.toJSON();
        await expense.destroy();
        await writeAudit({ userId: req.user?.id, entity: 'SalesmanExpense', entityId: req.params.id, action: 'delete', oldValues });
        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ message: 'Failed to delete expense', error: error.message });
    }
};
