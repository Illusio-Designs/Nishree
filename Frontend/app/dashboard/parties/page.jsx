'use client';

import StatusPill from '@/components/admin/StatusPill';
import ResourceManager from '@/components/admin/ResourceManager';
import {
  adminListParties,
  adminCreateParty,
  adminUpdateParty,
  adminDeleteParty,
} from '@/lib/admin-api';

export default function PartiesPage() {
  return (
    <ResourceManager
      title="Parties"
      subtitle="B2B retail customers (shops)."
      fetchList={adminListParties}
      createItem={adminCreateParty}
      updateItem={adminUpdateParty}
      deleteItem={adminDeleteParty}
      searchKeys={['shop_name', 'city', 'phone']}
      addLabel="Add party"
      columns={[
        { key: 'shop_name', label: 'Shop', render: (p) => <span className="font-semibold text-ink">{p.shop_name}</span> },
        { key: 'contact_person', label: 'Contact', render: (p) => p.contact_person || '—' },
        { key: 'phone', label: 'Phone', render: (p) => p.phone || '—' },
        { key: 'city', label: 'City', render: (p) => p.city || '—' },
        { key: 'status', label: 'Status', render: (p) => <StatusPill status={p.status} /> },
      ]}
      fields={[
        { name: 'shop_name', label: 'Shop name', required: true, colSpan: 2 },
        { name: 'trade_name', label: 'Trade name' },
        { name: 'contact_person', label: 'Contact person' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'gst_number', label: 'GST number' },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'location', label: 'Location', type: 'location' },
        { name: 'pincode', label: 'Pincode' },
        { name: 'zone_id', label: 'Zone', type: 'zone' },
        { name: 'credit_limit', label: 'Credit limit', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ] },
      ]}
      toFormValues={(p) => ({
        shop_name: p.shop_name, trade_name: p.trade_name || '', contact_person: p.contact_person || '',
        phone: p.phone || '', email: p.email || '', gst_number: p.gst_number || '', address: p.address || '',
        country: p.country || 'India', state: p.state || '', city: p.city || '', pincode: p.pincode || '',
        zone_id: p.zone_id || '', credit_limit: p.credit_limit || '', status: p.status || 'active',
      })}
    />
  );
}
