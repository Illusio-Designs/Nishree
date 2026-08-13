'use client';

import { Children, isValidElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown01Icon, Tick02Icon, Search01Icon } from 'hugeicons-react';
import { cn } from '@/lib/format';

// Fully themed dropdown. Keeps the native-<select> API — pass <option> children
// and read e.target.value in onChange — but renders a custom, brand-styled
// control and option panel (the native option popup can't be themed). The panel
// is portalled to <body> and fixed-positioned so it never clips inside drawers
// or table cells.
export default function Select({ label, error, className, id, name, value, onChange, disabled, placeholder = 'Select…', children }) {
  const inputId = id || name;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState(null);
  const [query, setQuery] = useState('');
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // Flatten <option> children into { value, label, disabled }.
  const options = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== 'option') return;
    options.push({
      value: child.props.value ?? '',
      label: child.props.children,
      disabled: !!child.props.disabled,
    });
  });

  const selected = options.find((o) => String(o.value) === String(value ?? ''));
  const displayLabel = selected ? selected.label : placeholder;
  const isPlaceholder = !selected || selected.value === '';

  // Show a search box for long lists (e.g. states, cities).
  const searchable = options.length > 8;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => typeof o.label === 'string' && o.label.toLowerCase().includes(q));
  }, [options, query]);

  const position = () => {
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
  };

  useLayoutEffect(() => {
    if (!open) { setQuery(''); return; }
    position();
    // Close on outside scroll, but not when scrolling the option list itself.
    const onScroll = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onResize = () => setOpen(false);
    const onDocClick = (e) => {
      if (btnRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (opt) => {
    if (opt.disabled) return;
    onChange?.({ target: { name, value: opt.value } });
    setOpen(false);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      )}
      <button
        id={inputId}
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-full border border-line bg-white pl-4 pr-3 text-left text-ink transition-all focus-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-danger',
          open && 'border-brand-400',
          className,
        )}
      >
        <span className={cn('truncate', isPlaceholder && 'text-muted')}>{displayLabel}</span>
        <ArrowDown01Icon size={18} strokeWidth={2} className={cn('shrink-0 text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {mounted && open && rect && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[90] flex max-h-72 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-pop"
          style={{ top: rect.bottom + 6, left: rect.left, width: rect.width }}
        >
          {searchable && (
            <div className="border-b border-line p-2">
              <div className="relative">
                <Search01Icon size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="h-9 w-full rounded-full border border-line bg-white pl-8 pr-3 text-sm text-ink focus-ring"
                />
              </div>
            </div>
          )}
          <ul role="listbox" className="overflow-auto p-1.5">
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-muted">No matches</li>}
            {filtered.map((opt, i) => {
              const active = String(opt.value) === String(value ?? '');
              return (
                <li key={`${opt.value}-${i}`}>
                  <button
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => pick(opt)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors cursor-pointer',
                      opt.disabled && 'cursor-not-allowed opacity-50',
                      active ? 'bg-brand-50 font-semibold text-brand-700' : 'text-body hover:bg-surface-soft',
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {active && <Tick02Icon size={16} strokeWidth={2} className="shrink-0 text-brand-600" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>,
        document.body,
      )}

      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
