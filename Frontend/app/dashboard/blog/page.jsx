'use client';

import { mediaUrl } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import StatusPill from '@/components/admin/StatusPill';
import ResourceManager from '@/components/admin/ResourceManager';
import {
  adminListBlogs,
  adminCreateBlog,
  adminUpdateBlog,
  adminDeleteBlog,
} from '@/lib/admin-api';

export default function BlogAdminPage() {
  return (
    <ResourceManager
      title="Recipes & Blog"
      subtitle="Publish recipes and articles for the storefront."
      fetchList={adminListBlogs}
      createItem={adminCreateBlog}
      updateItem={adminUpdateBlog}
      deleteItem={adminDeleteBlog}
      searchKeys={['title', 'category']}
      addLabel="Add post"
      columns={[
        {
          key: 'title',
          label: 'Post',
          render: (b) => (
            <div className="flex items-center gap-3">
              <div className="h-10 w-14 overflow-hidden rounded-lg bg-surface-soft">
                {b.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(b.image)} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <span className="font-semibold text-ink clamp-1">{b.title}</span>
            </div>
          ),
        },
        { key: 'type', label: 'Type', render: (b) => <Badge tone="soft">{b.type}</Badge> },
        { key: 'category', label: 'Category', render: (b) => b.category || '—' },
        { key: 'status', label: 'Status', render: (b) => <StatusPill status={b.status} /> },
      ]}
      fields={[
        { name: 'title', label: 'Title', required: true, colSpan: 2 },
        { name: 'type', label: 'Type', type: 'select', options: [
          { value: 'recipe', label: 'Recipe' },
          { value: 'article', label: 'Article' },
        ] },
        { name: 'category', label: 'Category', placeholder: 'Recipes / Tips' },
        { name: 'author', label: 'Author' },
        { name: 'read_time', label: 'Read time', placeholder: 'e.g. 20 min' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' },
        ] },
        { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
        { name: 'content', label: 'Content (HTML allowed)', type: 'textarea' },
        { name: 'image', label: 'Cover image', type: 'image', colSpan: 2 },
      ]}
      toFormValues={(b) => ({
        title: b.title, type: b.type || 'recipe', category: b.category || '', author: b.author || '',
        read_time: b.read_time || '', status: b.status || 'draft', excerpt: b.excerpt || '',
        content: b.content || '', image: b.image || '',
      })}
    />
  );
}
