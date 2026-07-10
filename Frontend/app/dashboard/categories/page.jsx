'use client';

import { mediaUrl } from '@/lib/api';
import { firstImage } from '@/lib/format';
import StatusPill from '@/components/admin/StatusPill';
import ResourceManager from '@/components/admin/ResourceManager';
import {
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '@/lib/admin-api';

export default function CategoriesPage() {
  return (
    <ResourceManager
      title="Categories"
      subtitle="Organise your catalogue."
      fetchList={adminListCategories}
      createItem={adminCreateCategory}
      updateItem={adminUpdateCategory}
      deleteItem={adminDeleteCategory}
      searchKeys={['name']}
      addLabel="Add category"
      columns={[
        {
          key: 'name',
          label: 'Category',
          render: (c) => (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-lg bg-surface-soft">
                {firstImage(c) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(firstImage(c))} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <span className="font-semibold text-ink">{c.name}</span>
            </div>
          ),
        },
        { key: 'status', label: 'Status', render: (c) => <StatusPill status={c.status || 'active'} /> },
        { key: 'created_at', label: 'Created', render: (c) => (c.createdAt || c.created_at ? new Date(c.createdAt || c.created_at).toLocaleDateString() : '—') },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true, colSpan: 2 },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ] },
        { name: 'image', label: 'Image', type: 'image', colSpan: 2 },
      ]}
      toFormValues={(c) => ({ name: c.name, description: c.description || '', status: c.status || 'active', image: firstImage(c) })}
    />
  );
}
