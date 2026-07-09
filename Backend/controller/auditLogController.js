import { AuditLog } from '../model/auditLogModel.js';
import { User } from '../model/userModel.js';

// List audit-log entries (admin), with optional ?entity= and ?action= filters
// and simple pagination.
export const getAuditLogs = async (req, res) => {
    try {
        const where = {};
        if (req.query.entity) where.entity = req.query.entity;
        if (req.query.action) where.action = req.query.action;
        if (req.query.entity_id) where.entity_id = req.query.entity_id;

        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
        const offset = parseInt(req.query.offset, 10) || 0;

        const { count, rows } = await AuditLog.findAndCountAll({
            where,
            include: [{ model: User, attributes: ['id', 'username', 'email'] }],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        res.json({ total: count, limit, offset, logs: rows });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ message: 'Failed to fetch audit logs', error: error.message });
    }
};
