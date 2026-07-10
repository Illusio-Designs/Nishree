'use client';

import StatusPill from '@/components/admin/StatusPill';
import ResourceManager from '@/components/admin/ResourceManager';
import {
  adminListEvents,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
} from '@/lib/admin-api';

export default function EventsPage() {
  return (
    <ResourceManager
      title="Events"
      subtitle="Exhibitions & roadshows that group event orders."
      fetchList={adminListEvents}
      createItem={adminCreateEvent}
      updateItem={adminUpdateEvent}
      deleteItem={adminDeleteEvent}
      searchKeys={['name', 'location']}
      addLabel="Add event"
      columns={[
        { key: 'name', label: 'Event', render: (e) => <span className="font-semibold text-ink">{e.name}</span> },
        { key: 'location', label: 'Location', render: (e) => e.location || '—' },
        { key: 'start_date', label: 'Starts', render: (e) => (e.start_date ? new Date(e.start_date).toLocaleDateString() : '—') },
        { key: 'status', label: 'Status', render: (e) => <StatusPill status={e.status} /> },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true, colSpan: 2 },
        { name: 'location', label: 'Location' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'ongoing', label: 'Ongoing' },
          { value: 'past', label: 'Past' },
        ] },
        { name: 'start_date', label: 'Start date', type: 'date' },
        { name: 'end_date', label: 'End date', type: 'date' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      toFormValues={(e) => ({
        name: e.name, location: e.location || '', status: e.status || 'upcoming',
        start_date: e.start_date ? e.start_date.slice(0, 10) : '', end_date: e.end_date ? e.end_date.slice(0, 10) : '',
        description: e.description || '',
      })}
    />
  );
}
