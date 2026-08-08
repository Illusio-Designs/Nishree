'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import Select from '@/components/ui/Select';
import { adminListMessages, adminSetMessageStatus, adminDeleteMessage } from '@/lib/admin-api';

const STATUSES = ['new', 'read', 'replied', 'closed'];

export default function MessagesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminListMessages()
      .then((m) => setRows(Array.isArray(m) ? m : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setStatus = async (m, status) => {
    setRows((prev) => prev.map((r) => (r.id === m.id ? { ...r, status } : r)));
    try {
      await adminSetMessageStatus(m.id, status);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (m) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await adminDeleteMessage(m.id);
      setRows((prev) => prev.filter((r) => r.id !== m.id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Messages</h1>
        <p className="text-body">Enquiries from the public contact form.</p>
      </div>
      <DataTable
        loading={loading}
        emptyTitle="No messages yet"
        rows={rows}
        onDelete={remove}
        actions={(m) => (
          <Select
            value={m.status || 'new'}
            onChange={(e) => setStatus(m, e.target.value)}
            className="h-9 w-32"
            aria-label="Message status"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </Select>
        )}
        columns={[
          { key: 'name', label: 'From', render: (m) => (
            <div>
              <p className="font-semibold text-ink">{m.name}</p>
              <p className="text-xs text-muted">{m.email}</p>
            </div>
          ) },
          { key: 'subject', label: 'Subject', render: (m) => m.subject || '—' },
          { key: 'message', label: 'Message', render: (m) => <span className="clamp-2 block max-w-md text-body">{m.message}</span> },
          { key: 'status', label: 'Status', render: (m) => <StatusPill status={m.status} /> },
        ]}
      />
    </div>
  );
}
