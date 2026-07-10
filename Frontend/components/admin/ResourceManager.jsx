'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Add01Icon, Search01Icon } from 'hugeicons-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import DataTable from '@/components/admin/DataTable';
import Drawer from '@/components/ui/Drawer';
import VariationsEditor from '@/components/admin/VariationsEditor';

// Config-driven CRUD page. Supply list/create/update/remove + columns + fields and
// this renders the toolbar, table, and modal form. Omit create/update/remove to
// hide those affordances (e.g. read-only resources).
export default function ResourceManager({
  title,
  subtitle,
  fetchList,
  createItem,
  updateItem,
  deleteItem,
  columns,
  fields = [],
  searchKeys = [],
  toFormValues,
  toPayload,
  addLabel = 'Add new',
  headerActions,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchList();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!query.trim() || searchKeys.length === 0) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)));
  }, [rows, query, searchKeys]);

  const openCreate = () => {
    setEditing(null);
    const init = {};
    fields.forEach((f) => {
      init[f.name] = f.type === 'checkbox' ? false : f.type === 'variations' ? [{}] : '';
    });
    setValues(init);
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setValues(toFormValues ? toFormValues(row) : fields.reduce((a, f) => ({ ...a, [f.name]: row[f.name] ?? '' }), {}));
    setOpen(true);
  };

  const setField = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = toPayload ? toPayload(values) : values;
      if (editing) await updateItem(editing.id, payload);
      else await createItem(payload);
      toast.success(editing ? 'Updated successfully' : 'Created successfully');
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm(`Delete this ${title.replace(/s$/, '').toLowerCase()}?`)) return;
    try {
      await deleteItem(row.id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="text-body">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {searchKeys.length > 0 && (
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-10 w-44 rounded-full border border-line bg-white pl-9 pr-3 text-sm focus-ring sm:w-56"
              />
              <Search01Icon size={16} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          )}
          {headerActions}
          {createItem && (
            <Button icon={Add01Icon} onClick={openCreate}>{addLabel}</Button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        onEdit={updateItem ? openEdit : undefined}
        onDelete={deleteItem ? onDelete : undefined}
      />

      {/* Form aside panel (drawer) */}
      {(createItem || updateItem) && (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          widthClass="max-w-xl"
          title={editing ? `Edit ${title.replace(/s$/, '')}` : `New ${title.replace(/s$/, '')}`}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={onSubmit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          }
        >
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.colSpan === 2 || f.type === 'textarea' || f.type === 'variations' ? 'sm:col-span-2' : ''}>
                <FormField field={f} value={values[f.name]} onChange={(v) => setField(f.name, v)} />
              </div>
            ))}
          </form>
        </Drawer>
      )}
    </div>
  );
}

function FormField({ field, value, onChange }) {
  const { type = 'text', label, name, options = [], placeholder, required } = field;

  if (type === 'variations') {
    return <VariationsEditor value={value} onChange={onChange} />;
  }
  if (type === 'textarea') {
    return <Textarea label={label} name={name} value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={required} />;
  }
  if (type === 'select') {
    return (
      <Select label={label} name={name} value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={required}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
    );
  }
  if (type === 'checkbox') {
    return (
      <label className="flex h-11 items-center gap-2 text-sm font-medium text-ink">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-brand-600" />
        {label}
      </label>
    );
  }
  if (type === 'image') {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="block w-full text-sm text-body file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
        />
        {value && typeof value === 'string' && <p className="mt-1 text-xs text-muted clamp-1">Current: {value}</p>}
      </div>
    );
  }
  return (
    <Input
      label={label}
      name={name}
      type={type}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  );
}
