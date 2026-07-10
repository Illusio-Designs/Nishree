'use client';

import { PencilEdit02Icon, Delete02Icon } from 'hugeicons-react';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';

// Responsive admin table. `columns` = [{ key, label, render?(row), className? }].
// `actions` renders trailing per-row controls; edit/delete are convenience props.
export default function DataTable({ columns, rows, loading, onEdit, onDelete, actions, emptyTitle = 'No records yet' }) {
  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size={30} /></div>;
  }
  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  const hasActions = onEdit || onDelete || actions;

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-soft text-left">
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-semibold text-ink">{c.label}</th>
            ))}
            {hasActions && <th className="px-4 py-3 text-right font-semibold text-ink">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-line last:border-0 hover:bg-surface-soft/60">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 align-middle text-body ${c.className || ''}`}>
                  {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                </td>
              ))}
              {hasActions && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {actions?.(row)}
                    {onEdit && (
                      <button onClick={() => onEdit(row)} aria-label="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg text-body hover:bg-brand-50 hover:text-brand-600 cursor-pointer">
                        <PencilEdit02Icon size={17} strokeWidth={2} />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row)} aria-label="Delete" className="flex h-8 w-8 items-center justify-center rounded-lg text-body hover:bg-red-50 hover:text-danger cursor-pointer">
                        <Delete02Icon size={17} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
