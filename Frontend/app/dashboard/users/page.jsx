'use client';

import Badge from '@/components/ui/Badge';
import ResourceManager from '@/components/admin/ResourceManager';
import { adminListUsers } from '@/lib/admin-api';

export default function UsersPage() {
  return (
    <ResourceManager
      title="Customers"
      subtitle="People with a Nishree account."
      fetchList={adminListUsers}
      searchKeys={['username', 'email']}
      columns={[
        {
          key: 'username',
          label: 'Name',
          render: (u) => (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
                {(u.username || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-ink">{u.username || '—'}</span>
            </div>
          ),
        },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone', render: (u) => u.phone || '—' },
        { key: 'role', label: 'Role', render: (u) => <Badge tone="soft">{u.role}</Badge> },
        { key: 'createdAt', label: 'Joined', render: (u) => (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—') },
      ]}
    />
  );
}
