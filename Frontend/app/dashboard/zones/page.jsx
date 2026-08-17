'use client';

import StatusPill from '@/components/admin/StatusPill';
import ResourceManager from '@/components/admin/ResourceManager';
import {
  adminListZones,
  adminCreateZone,
  adminUpdateZone,
  adminDeleteZone,
} from '@/lib/admin-api';

export default function ZonesPage() {
  return (
    <ResourceManager
      title="Zones"
      subtitle="Geographic territories used to map distributors, salesmen and parties."
      fetchList={adminListZones}
      createItem={adminCreateZone}
      updateItem={adminUpdateZone}
      deleteItem={adminDeleteZone}
      searchKeys={['name', 'code']}
      addLabel="Add zone"
      columns={[
        { key: 'name', label: 'Zone', render: (z) => <span className="font-semibold text-ink">{z.name}</span> },
        { key: 'code', label: 'Code', render: (z) => z.code || '—' },
        { key: 'description', label: 'Description', render: (z) => <span className="clamp-1 text-body">{z.description || '—'}</span> },
        { key: 'status', label: 'Status', render: (z) => <StatusPill status={z.status} /> },
      ]}
      fields={[
        { name: 'name', label: 'Zone name', required: true, colSpan: 2 },
        { name: 'code', label: 'Code' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ] },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
      ]}
      toFormValues={(z) => ({
        name: z.name || '', code: z.code || '', status: z.status || 'active', description: z.description || '',
      })}
      toPayload={(v) => ({ name: v.name, code: v.code || null, status: v.status || 'active', description: v.description || null })}
    />
  );
}
