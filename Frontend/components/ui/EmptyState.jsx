import { InboxIcon } from 'hugeicons-react';

// Friendly empty/no-results placeholder.
export default function EmptyState({ icon: Icon = InboxIcon, title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-4">
        <Icon size={30} strokeWidth={2} />
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {message && <p className="mt-1 text-body max-w-sm">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
