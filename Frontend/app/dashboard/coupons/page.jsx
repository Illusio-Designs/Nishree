'use client';

import Badge from '@/components/ui/Badge';
import StatusPill from '@/components/admin/StatusPill';
import ResourceManager from '@/components/admin/ResourceManager';
import { formatPrice } from '@/lib/format';
import {
  adminListCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from '@/lib/admin-api';

export default function CouponsPage() {
  return (
    <ResourceManager
      title="Coupons"
      subtitle="Create and manage discount codes."
      fetchList={adminListCoupons}
      createItem={adminCreateCoupon}
      updateItem={adminUpdateCoupon}
      deleteItem={adminDeleteCoupon}
      searchKeys={['code']}
      addLabel="Add coupon"
      columns={[
        { key: 'code', label: 'Code', render: (c) => <Badge tone="soft">{c.code}</Badge> },
        { key: 'type', label: 'Type', render: (c) => <span className="capitalize">{c.type}</span> },
        { key: 'value', label: 'Value', render: (c) => (c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)) },
        { key: 'usageCount', label: 'Used', render: (c) => `${c.usageCount ?? 0}${c.usageLimit ? ` / ${c.usageLimit}` : ''}` },
        { key: 'status', label: 'Status', render: (c) => <StatusPill status={c.status} /> },
      ]}
      fields={[
        { name: 'code', label: 'Code', required: true },
        { name: 'type', label: 'Type', type: 'select', required: true, options: [
          { value: 'percentage', label: 'Percentage' },
          { value: 'fixed', label: 'Fixed amount' },
        ] },
        { name: 'value', label: 'Value', type: 'number', required: true },
        { name: 'minPurchase', label: 'Min. purchase', type: 'number' },
        { name: 'maxDiscount', label: 'Max. discount', type: 'number' },
        { name: 'usageLimit', label: 'Usage limit', type: 'number' },
        { name: 'startDate', label: 'Start date', type: 'date', required: true },
        { name: 'endDate', label: 'End date', type: 'date', required: true },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ] },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      toFormValues={(c) => ({
        code: c.code, type: c.type, value: c.value, minPurchase: c.minPurchase || '',
        maxDiscount: c.maxDiscount || '', usageLimit: c.usageLimit || '',
        startDate: c.startDate ? c.startDate.slice(0, 10) : '', endDate: c.endDate ? c.endDate.slice(0, 10) : '',
        status: c.status || 'active', description: c.description || '',
      })}
    />
  );
}
