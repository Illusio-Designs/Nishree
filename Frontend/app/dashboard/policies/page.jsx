'use client';

import ResourceManager from '@/components/admin/ResourceManager';
import {
  adminListPolicies,
  adminCreatePolicy,
  adminUpdatePolicy,
  adminDeletePolicy,
} from '@/lib/admin-api';

export default function PoliciesPage() {
  return (
    <ResourceManager
      title="Policies"
      subtitle="Store policies shown on the public Policies page."
      fetchList={adminListPolicies}
      createItem={adminCreatePolicy}
      updateItem={adminUpdatePolicy}
      deleteItem={adminDeletePolicy}
      searchKeys={['title']}
      addLabel="Add policy"
      columns={[
        { key: 'title', label: 'Title', render: (p) => <span className="font-semibold text-ink">{p.title}</span> },
        {
          key: 'content',
          label: 'Preview',
          render: (p) => (
            <span className="clamp-1 text-body">
              {String(p.content || '').replace(/<[^>]*>/g, '').slice(0, 80) || '—'}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'title', label: 'Title', required: true, colSpan: 2 },
        { name: 'content', label: 'Content', type: 'textarea', required: true, colSpan: 2 },
      ]}
      toFormValues={(p) => ({ title: p.title || '', content: p.content || '' })}
      toPayload={(v) => ({ title: v.title, content: v.content })}
    />
  );
}
