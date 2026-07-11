'use client';

import { useEffect, useMemo, useState } from 'react';
import { PencilEdit02Icon, Delete02Icon, ArrowLeft01Icon, ArrowRight01Icon } from 'hugeicons-react';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';

// Responsive admin table. `columns` = [{ key, label, render?(row), className? }].
// `actions` renders trailing per-row controls; edit/delete are convenience props.
// Paginates client-side (`pageSize`, default 10); pass pageSize={0} to disable.
export default function DataTable({ columns, rows, loading, onEdit, onDelete, actions, emptyTitle = 'No records yet', pageSize = 10 }) {
  const [page, setPage] = useState(1);
  const total = rows?.length ?? 0;
  const paginated = pageSize > 0 && total > pageSize;
  const totalPages = paginated ? Math.ceil(total / pageSize) : 1;

  // Snap back to a valid page when the underlying data shrinks (search/delete).
  useEffect(() => { setPage((p) => Math.min(p, totalPages)); }, [totalPages]);

  const pageRows = useMemo(() => {
    if (!paginated) return rows || [];
    const start = (page - 1) * pageSize;
    return (rows || []).slice(start, start + pageSize);
  }, [rows, page, pageSize, paginated]);

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size={30} /></div>;
  }
  if (total === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  const hasActions = onEdit || onDelete || actions;
  const from = paginated ? (page - 1) * pageSize + 1 : 1;
  const to = paginated ? Math.min(page * pageSize, total) : total;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="overflow-x-auto">
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
            {pageRows.map((row, i) => (
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

      {/* Footer: record count + pager */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-body sm:flex-row">
        <span>
          Showing <span className="font-semibold text-ink">{from}</span>–<span className="font-semibold text-ink">{to}</span> of{' '}
          <span className="font-semibold text-ink">{total}</span> {total === 1 ? 'record' : 'records'}
        </span>
        {paginated && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-body hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <ArrowLeft01Icon size={16} strokeWidth={2} />
            </button>
            {pageNumbers(page, totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className="px-1 text-muted">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-current={p === page}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium cursor-pointer ${p === page ? 'brand-gradient text-white' : 'border border-line text-body hover:bg-surface-soft'}`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-body hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <ArrowRight01Icon size={16} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact page list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 20.
function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('…');
    out.push(p);
    prev = p;
  }
  return out;
}
