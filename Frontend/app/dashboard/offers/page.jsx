'use client';

import StatusPill from '@/components/admin/StatusPill';
import ResourceManager from '@/components/admin/ResourceManager';
import { formatPrice } from '@/lib/format';
import {
  adminListOffers,
  adminCreateOffer,
  adminUpdateOffer,
  adminDeleteOffer,
} from '@/lib/admin-api';

export default function OffersPage() {
  return (
    <ResourceManager
      title="Offers"
      subtitle="Wholesale discounts applied to B2B orders."
      fetchList={adminListOffers}
      createItem={adminCreateOffer}
      updateItem={adminUpdateOffer}
      deleteItem={adminDeleteOffer}
      searchKeys={['name', 'code']}
      addLabel="Add offer"
      columns={[
        { key: 'name', label: 'Name', render: (o) => <span className="font-semibold text-ink">{o.name}</span> },
        { key: 'type', label: 'Type', render: (o) => <span className="capitalize">{o.type}</span> },
        { key: 'value', label: 'Value', render: (o) => (o.type === 'percentage' ? `${o.value}%` : formatPrice(o.value)) },
        { key: 'status', label: 'Status', render: (o) => <StatusPill status={o.status} /> },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true, colSpan: 2 },
        { name: 'code', label: 'Code' },
        { name: 'type', label: 'Type', type: 'select', required: true, options: [
          { value: 'percentage', label: 'Percentage' },
          { value: 'fixed', label: 'Fixed amount' },
        ] },
        { name: 'value', label: 'Value', type: 'number', required: true },
        { name: 'min_order_amount', label: 'Min. order amount', type: 'number' },
        { name: 'max_discount', label: 'Max. discount', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ] },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      toFormValues={(o) => ({
        name: o.name, code: o.code || '', type: o.type, value: o.value,
        min_order_amount: o.min_order_amount || '', max_discount: o.max_discount || '',
        status: o.status || 'active', description: o.description || '',
      })}
    />
  );
}
