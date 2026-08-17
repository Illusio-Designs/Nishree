'use client';

import { useEffect, useState, useCallback } from 'react';
import DataTable from '@/components/admin/DataTable';
import Badge from '@/components/ui/Badge';
import { adminListAuditLogs } from '@/lib/admin-api';

const ACTION_TONE = { create: 'success', update: 'brand', delete: 'warning' };
const fmt = (v) => (v ? new Date(v).toLocaleString() : '—');

export default function AuditLogsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await adminListAuditLogs({ limit: 200, ...(entity ? { entity } : {}) }));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [entity]);

  useEffect(() => { load(); }, [load]);

  const entities = Array.from(new Set(rows.map((r) => r.entity).filter(Boolean))).sort();

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Audit Logs</h1>
          <p className="text-body">Every create, update and delete across the system.</p>
        </div>
        <select
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          className="h-10 rounded-full border border-line bg-white px-4 text-sm text-ink focus-ring"
        >
          <option value="">All entities</option>
          {entities.map((en) => <option key={en} value={en}>{en}</option>)}
        </select>
      </div>

      <DataTable
        loading={loading}
        emptyTitle="No audit entries"
        rows={rows}
        columns={[
          { key: 'created_at', label: 'When', render: (l) => <span className="text-body">{fmt(l.created_at || l.createdAt)}</span> },
          { key: 'user', label: 'By', render: (l) => l.User?.username || l.User?.email || (l.user_id ? `#${l.user_id}` : 'System') },
          { key: 'action', label: 'Action', render: (l) => <Badge tone={ACTION_TONE[l.action] || 'neutral'}><span className="capitalize">{l.action}</span></Badge> },
          { key: 'entity', label: 'Entity', render: (l) => <span className="font-semibold text-ink">{l.entity}{l.entity_id ? ` #${l.entity_id}` : ''}</span> },
        ]}
      />
    </div>
  );
}
