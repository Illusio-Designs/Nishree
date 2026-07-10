'use client';

import { Add01Icon, Delete02Icon } from 'hugeicons-react';

// Repeatable pack-size / variation editor for the product form. Each row is a
// variation: label (weight), price, MRP, wholesale price and stock.
export default function VariationsEditor({ value, onChange }) {
  const rows = Array.isArray(value) && value.length ? value : [{}];

  const update = (i, key, val) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r));
    onChange(next);
  };
  const add = () => onChange([...rows, {}]);
  const remove = (i) => {
    const next = rows.filter((_, idx) => idx !== i);
    onChange(next.length ? next : [{}]);
  };

  const cell = 'h-10 w-full rounded-lg border border-line bg-white px-2.5 text-sm focus-ring';

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">Pack sizes & pricing</label>
      <div className="space-y-2">
        {/* header (desktop) */}
        <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_0.8fr_auto] gap-2 px-1 text-xs font-semibold text-muted sm:grid">
          <span>Pack size</span><span>Price ₹</span><span>MRP ₹</span><span>Wholesale ₹</span><span>Stock</span><span />
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-line p-2 sm:grid-cols-[1.2fr_1fr_1fr_1fr_0.8fr_auto] sm:border-0 sm:p-0">
            <input className={cell} placeholder="e.g. 100g" value={r.weight ?? ''} onChange={(e) => update(i, 'weight', e.target.value)} />
            <input className={cell} type="number" placeholder="Price" value={r.price ?? ''} onChange={(e) => update(i, 'price', e.target.value)} />
            <input className={cell} type="number" placeholder="MRP" value={r.comparePrice ?? ''} onChange={(e) => update(i, 'comparePrice', e.target.value)} />
            <input className={cell} type="number" placeholder="Wholesale" value={r.wholesalePrice ?? ''} onChange={(e) => update(i, 'wholesalePrice', e.target.value)} />
            <input className={cell} type="number" placeholder="Qty" value={r.stock ?? ''} onChange={(e) => update(i, 'stock', e.target.value)} />
            <button
              type="button"
              aria-label="Remove pack size"
              onClick={() => remove(i)}
              className="flex h-10 items-center justify-center rounded-lg text-body hover:bg-red-50 hover:text-danger cursor-pointer"
            >
              <Delete02Icon size={17} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 cursor-pointer"
      >
        <Add01Icon size={16} strokeWidth={2} /> Add pack size
      </button>
    </div>
  );
}
