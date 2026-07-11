'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Add01Icon, Route01Icon, MapPinpoint01Icon, CheckmarkCircle02Icon, Cancel01Icon, Clock01Icon } from 'hugeicons-react';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Drawer from '@/components/ui/Drawer';
import Spinner from '@/components/ui/Spinner';
import LocationSelect from '@/components/ui/LocationSelect';
import ZoneSelect from '@/components/ui/ZoneSelect';
import {
  adminListSalesmen,
  adminCreateSalesman,
  adminUpdateSalesman,
  adminSetSalesmanStatus,
  adminDeleteSalesman,
  adminGetSalesmanRoute,
} from '@/lib/admin-api';

const EMPTY = { name: '', phone: '', email: '', address: '', country: 'India', state: '', city: '', pincode: '', zone_id: '' };

// Pull the primary assigned zone id out of a salesman record (from the API's
// included `Zones` association) so the edit form pre-selects it.
const primaryZoneId = (s) => s?.zone_id || s?.Zones?.[0]?.zone_id || s?.Zones?.[0]?.Zone?.id || '';

export default function SalesmenPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / edit drawer
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  // Route drawer
  const [routeOpen, setRouteOpen] = useState(false);
  const [routeFor, setRouteFor] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const load = () => {
    setLoading(true);
    adminListSalesmen()
      .then((s) => setRows(Array.isArray(s) ? s : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name || '', phone: s.phone || '', email: s.email || '', address: s.address || '',
      country: s.country || 'India', state: s.state || '', city: s.city || '', pincode: s.pincode || '',
      zone_id: primaryZoneId(s),
    });
    setFormOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Territory zone assignment is sent as a `zones` array the backend syncs.
    const { zone_id, ...rest } = form;
    const payload = { ...rest, zones: zone_id ? [zone_id] : [] };
    try {
      if (editing) await adminUpdateSalesman(editing.id, payload);
      else await adminCreateSalesman(payload);
      toast.success(editing ? 'Salesman updated' : 'Salesman added');
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (s) => {
    const next = s.status === 'active' ? 'inactive' : 'active';
    try {
      await adminSetSalesmanStatus(s.id, next);
      setRows((prev) => prev.map((r) => (r.id === s.id ? { ...r, status: next } : r)));
      toast.success(`Salesman marked ${next}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (s) => {
    if (!window.confirm('Delete this salesman?')) return;
    try {
      await adminDeleteSalesman(s.id);
      setRows((prev) => prev.filter((r) => r.id !== s.id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  const openRoute = async (s) => {
    setRouteFor(s);
    setRoute(null);
    setRouteOpen(true);
    setRouteLoading(true);
    try {
      const data = await adminGetSalesmanRoute(s.id);
      setRoute(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not build route');
      setRoute({ stops: [], summary: {} });
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Salesmen</h1>
          <p className="text-body">Field sales reps, territory and status.</p>
        </div>
        <Button icon={Add01Icon} onClick={openCreate}>Add salesman</Button>
      </div>

      <DataTable
        loading={loading}
        emptyTitle="No salesmen yet"
        rows={rows}
        onEdit={openEdit}
        onDelete={remove}
        actions={(s) => (
          <>
            <Button size="sm" variant="soft" icon={Route01Icon} onClick={() => openRoute(s)}>Route</Button>
            <Button size="sm" variant={s.status === 'active' ? 'secondary' : 'soft'} onClick={() => toggle(s)}>
              {s.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
          </>
        )}
        columns={[
          { key: 'name', label: 'Name', render: (s) => <span className="font-semibold text-ink">{s.name}</span> },
          { key: 'phone', label: 'Phone', render: (s) => s.phone || '—' },
          { key: 'email', label: 'Email', render: (s) => s.email || '—' },
          { key: 'state', label: 'State', render: (s) => s.state || '—' },
          { key: 'status', label: 'Status', render: (s) => <StatusPill status={s.status} /> },
        ]}
      />

      {/* Add / edit drawer */}
      <Drawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        widthClass="max-w-xl"
        title={editing ? 'Edit salesman' : 'Add salesman'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        }
      >
        <form onSubmit={save} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Input label="Name" name="name" value={form.name} onChange={onChange} required containerClassName="sm:col-span-2" />
          <Input label="Phone" name="phone" value={form.phone} onChange={onChange} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} />
          <Input label="Address" name="address" value={form.address} onChange={onChange} containerClassName="sm:col-span-2" />
          <div className="sm:col-span-2">
            <LocationSelect value={{ country: form.country, state: form.state, city: form.city }} onChange={(v) => setForm((f) => ({ ...f, ...v }))} />
          </div>
          <Input label="Pincode" name="pincode" value={form.pincode} onChange={onChange} />
          <ZoneSelect label="Assigned zone" value={form.zone_id} onChange={(v) => setForm((f) => ({ ...f, zone_id: v }))} />
        </form>
      </Drawer>

      {/* Assign / view route drawer */}
      <Drawer
        open={routeOpen}
        onClose={() => setRouteOpen(false)}
        widthClass="max-w-lg"
        title={routeFor ? `Route — ${routeFor.name}` : 'Route'}
      >
        <div className="p-5">
          {routeLoading ? (
            <div className="flex justify-center py-16"><Spinner size={30} /></div>
          ) : !route || !route.stops?.length ? (
            <div className="rounded-2xl border border-line bg-surface-soft p-6 text-center text-sm text-body">
              No stops yet. Assign a zone with parties to this salesman to generate a daily beat route.
            </div>
          ) : (
            <RouteView route={route} />
          )}
        </div>
      </Drawer>
    </div>
  );
}

const STOP_META = {
  visited: { icon: CheckmarkCircle02Icon, cls: 'text-green-600 bg-green-50' },
  skipped: { icon: Cancel01Icon, cls: 'text-danger bg-red-50' },
  pending: { icon: Clock01Icon, cls: 'text-amber-600 bg-amber-50' },
};

function RouteView({ route }) {
  const { summary = {}, stops = [], date } = route;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-surface-soft px-3 py-1 font-medium text-body">{date || 'Today'}</span>
        <span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">{summary.total ?? stops.length} stops</span>
        <span className="rounded-full bg-green-50 px-3 py-1 font-semibold text-green-700">{summary.visited ?? 0} visited</span>
        <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">{summary.pending ?? 0} pending</span>
        <span className="rounded-full bg-red-50 px-3 py-1 font-semibold text-danger">{summary.skipped ?? 0} skipped</span>
      </div>

      <ol className="relative space-y-3 border-l border-line pl-6">
        {stops.map((stop) => {
          const meta = STOP_META[stop.status] || STOP_META.pending;
          const Icon = meta.icon;
          const p = stop.Party || {};
          return (
            <li key={stop.id} className="relative">
              <span className={`absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full ${meta.cls}`}>
                <Icon size={14} strokeWidth={2} />
              </span>
              <div className="rounded-2xl border border-line bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{stop.sequence}. {p.shop_name || 'Party'}</p>
                  <StatusPill status={stop.status} />
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <MapPinpoint01Icon size={13} strokeWidth={2} />
                  {[p.address, p.city].filter(Boolean).join(', ') || '—'}
                </p>
                {stop.skip_reason && <p className="mt-1 text-xs text-danger">Skipped: {stop.skip_reason}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
