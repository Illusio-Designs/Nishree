'use client';

import { useEffect, useState } from 'react';
import StatusPill from '@/components/admin/StatusPill';
import ResourceManager from '@/components/admin/ResourceManager';
import { formatPrice } from '@/lib/format';
import {
  adminListTargets,
  adminCreateTarget,
  adminUpdateTarget,
  adminDeleteTarget,
  adminListSalesmen,
} from '@/lib/admin-api';

const fmtDate = (v) => (v ? String(v).slice(0, 10) : '');
const salesmanName = (t) => t.Salesman?.name || t.salesman?.name || (t.salesman_id ? `#${t.salesman_id}` : '—');

export default function TargetsPage() {
  const [salesmanOptions, setSalesmanOptions] = useState([]);

  useEffect(() => {
    adminListSalesmen()
      .then((list) => setSalesmanOptions((Array.isArray(list) ? list : []).map((s) => ({ value: String(s.id), label: s.name || `Salesman #${s.id}` }))))
      .catch(() => {});
  }, []);

  return (
    <ResourceManager
      title="Salesman Targets"
      subtitle="Set sales quotas per salesman for a period. Achievement shows in the salesman's portal."
      fetchList={adminListTargets}
      createItem={adminCreateTarget}
      updateItem={adminUpdateTarget}
      deleteItem={adminDeleteTarget}
      searchKeys={[]}
      addLabel="Add target"
      columns={[
        { key: 'salesman', label: 'Salesman', render: (t) => <span className="font-semibold text-ink">{salesmanName(t)}</span> },
        { key: 'target_amount', label: 'Target', render: (t) => formatPrice(t.target_amount) },
        { key: 'period', label: 'Period', render: (t) => `${fmtDate(t.start_date)} → ${fmtDate(t.end_date)}` },
        { key: 'order_type', label: 'Scope', render: (t) => (t.order_type ? <span className="capitalize">{String(t.order_type).replace('_', ' ')}</span> : 'All orders') },
        { key: 'status', label: 'Status', render: (t) => <StatusPill status={t.status} /> },
      ]}
      fields={[
        { name: 'salesman_id', label: 'Salesman', type: 'select', required: true, options: salesmanOptions, colSpan: 2 },
        { name: 'target_amount', label: 'Target amount (₹)', type: 'number', required: true },
        { name: 'order_type', label: 'Scope', type: 'select', options: [
          { value: '', label: 'All B2B orders' },
          { value: 'party_order', label: 'Party orders' },
          { value: 'distributor_order', label: 'Distributor orders' },
          { value: 'visit_order', label: 'Visit orders' },
          { value: 'event_order', label: 'Event orders' },
        ] },
        { name: 'start_date', label: 'Start date', type: 'date', required: true },
        { name: 'end_date', label: 'End date', type: 'date', required: true },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ] },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
      ]}
      toFormValues={(t) => ({
        salesman_id: String(t.salesman_id || ''),
        target_amount: t.target_amount ?? '',
        order_type: t.order_type || '',
        start_date: fmtDate(t.start_date),
        end_date: fmtDate(t.end_date),
        status: t.status || 'active',
        description: t.description || '',
      })}
      toPayload={(v) => ({
        salesman_id: Number(v.salesman_id) || null,
        target_amount: Number(v.target_amount) || 0,
        order_type: v.order_type || null,
        start_date: v.start_date,
        end_date: v.end_date,
        status: v.status || 'active',
        description: v.description || null,
      })}
    />
  );
}
