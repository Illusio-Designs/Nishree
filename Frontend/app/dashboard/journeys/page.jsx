'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import { adminListJourneys } from '@/lib/admin-api';

export default function JourneysPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminListJourneys()
      .then((j) => setRows(Array.isArray(j) ? j : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const km = (m) => `${Math.round(((Number(m) || 0) / 1000) * 100) / 100} km`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Salesman Journeys</h1>
        <p className="text-body">Daily field routes tracked by GPS.</p>
      </div>
      <DataTable
        loading={loading}
        emptyTitle="No journeys recorded yet"
        rows={rows}
        columns={[
          { key: 'salesman', label: 'Salesman', render: (j) => <span className="font-semibold text-ink">{j.Salesman?.name || `#${j.salesman_id}`}</span> },
          { key: 'journey_date', label: 'Date', render: (j) => (j.journey_date ? new Date(j.journey_date).toLocaleDateString() : '—') },
          { key: 'start_time', label: 'Start', render: (j) => (j.start_time ? new Date(j.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—') },
          { key: 'end_time', label: 'End', render: (j) => (j.end_time ? new Date(j.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—') },
          { key: 'total_distance_m', label: 'Distance', render: (j) => km(j.total_distance_m) },
          { key: 'status', label: 'Status', render: (j) => <StatusPill status={j.status} /> },
        ]}
      />
    </div>
  );
}
