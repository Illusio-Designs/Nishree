'use client';

import StatusPill from '@/components/admin/StatusPill';
import ResourceManager from '@/components/admin/ResourceManager';
import {
  adminListDistributors,
  adminCreateDistributor,
  adminUpdateDistributor,
  adminDeleteDistributor,
} from '@/lib/admin-api';

export default function DistributorsPage() {
  return (
    <ResourceManager
      title="Distributors"
      subtitle="Wholesale partners and their territory."
      fetchList={adminListDistributors}
      createItem={adminCreateDistributor}
      updateItem={adminUpdateDistributor}
      deleteItem={adminDeleteDistributor}
      searchKeys={['name', 'company_name', 'city']}
      addLabel="Add distributor"
      columns={[
        { key: 'name', label: 'Name', render: (d) => <span className="font-semibold text-ink">{d.name}</span> },
        { key: 'company_name', label: 'Company', render: (d) => d.company_name || '—' },
        { key: 'phone', label: 'Phone', render: (d) => d.phone || '—' },
        { key: 'state', label: 'State', render: (d) => d.state || '—' },
        { key: 'status', label: 'Status', render: (d) => <StatusPill status={d.status} /> },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'company_name', label: 'Company name' },
        { name: 'contact_person', label: 'Contact person' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'gst_number', label: 'GST number' },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'city', label: 'City' },
        { name: 'state', label: 'State' },
        { name: 'pincode', label: 'Pincode' },
        { name: 'credit_limit', label: 'Credit limit', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ] },
      ]}
    />
  );
}
