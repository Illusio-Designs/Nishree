import { AuditLog } from '../model/auditLogModel.js';

/**
 * Write an audit-log entry. Never throws — auditing must not break the request
 * that triggered it.
 *
 * @param {object} opts
 * @param {number|null} opts.userId  actor performing the action
 * @param {string} opts.entity       logical table/entity name (e.g. 'Party')
 * @param {number|null} opts.entityId affected record id
 * @param {'create'|'update'|'delete'} opts.action
 * @param {object|null} opts.oldValues snapshot before the change
 * @param {object|null} opts.newValues snapshot after the change
 */
export const writeAudit = async ({ userId = null, entity, entityId = null, action, oldValues = null, newValues = null }) => {
    try {
        await AuditLog.create({
            user_id: userId,
            entity,
            entity_id: entityId,
            action,
            old_values: oldValues,
            new_values: newValues
        });
    } catch (error) {
        console.error('Audit log write failed:', error.message);
    }
};

export default { writeAudit };
