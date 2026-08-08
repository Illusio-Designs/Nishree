'use client';

import StatusPill from '@/components/admin/StatusPill';
import ResourceManager from '@/components/admin/ResourceManager';
import { mediaUrl } from '@/lib/api';
import {
  adminListSliders,
  adminCreateSlider,
  adminUpdateSlider,
  adminDeleteSlider,
} from '@/lib/admin-api';

export default function SlidersPage() {
  return (
    <ResourceManager
      title="Sliders"
      subtitle="Homepage hero banners."
      fetchList={adminListSliders}
      createItem={adminCreateSlider}
      updateItem={adminUpdateSlider}
      deleteItem={adminDeleteSlider}
      searchKeys={['title']}
      addLabel="Add slider"
      columns={[
        {
          key: 'image', label: 'Image', render: (s) => (
            s.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={mediaUrl(s.image)} alt={s.title} className="h-12 w-20 rounded-lg object-cover" />
              : <span className="text-muted">—</span>
          ),
        },
        { key: 'title', label: 'Title', render: (s) => <span className="font-semibold text-ink">{s.title}</span> },
        { key: 'position', label: 'Position', render: (s) => s.position ?? 0 },
        { key: 'status', label: 'Status', render: (s) => <StatusPill status={s.status} /> },
      ]}
      fields={[
        { name: 'title', label: 'Title', required: true, colSpan: 2 },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'image', label: 'Image', type: 'image' },
        { name: 'buttonText', label: 'Button text' },
        { name: 'link', label: 'Link (URL)' },
        { name: 'position', label: 'Position', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ] },
      ]}
      toFormValues={(s) => ({
        title: s.title || '', description: s.description || '', image: s.image || '',
        buttonText: s.buttonText || '', link: s.link || '', position: s.position ?? 0,
        status: s.status || 'active',
      })}
    />
  );
}
