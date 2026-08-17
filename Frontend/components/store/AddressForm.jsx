'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Location01Icon, Call02Icon } from 'hugeicons-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LocationSelect from '@/components/ui/LocationSelect';
import { createShippingAddress, updateShippingAddress } from '@/lib/api';

// Add or edit a shipping address for signed-in shoppers. Pass `address` to edit
// an existing record; the saved record is handed back via onSaved so the caller
// can refresh its list.
export default function AddressForm({ address: existing, onSaved, onCancel }) {
  const editing = !!existing?.id;
  const [form, setForm] = useState({
    address: existing?.address || '',
    phone: existing?.phone_number || '',
    country: existing?.country || 'India',
    state: existing?.state || '',
    city: existing?.city || '',
    pincode: existing?.postal_code || '',
  });
  const [saving, setSaving] = useState(false);
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async () => {
    if (!form.address || !form.city || !form.state || !form.pincode || !form.phone) {
      toast.error('Please fill in address, city, state, pincode and phone.');
      return;
    }
    setSaving(true);
    const payload = {
      address: form.address,
      city: form.city,
      state: form.state,
      postal_code: form.pincode,
      country: form.country || 'India',
      phone_number: form.phone,
    };
    try {
      const addr = editing
        ? await updateShippingAddress(existing.id, payload)
        : await createShippingAddress(payload);
      toast.success(editing ? 'Address updated' : 'Address saved');
      onSaved?.(addr);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Address" name="address" icon={Location01Icon} value={form.address} onChange={onChange} containerClassName="sm:col-span-2" required />
      <div className="sm:col-span-2">
        <LocationSelect value={{ country: form.country, state: form.state, city: form.city }} onChange={(v) => setForm((f) => ({ ...f, ...v }))} required />
      </div>
      <Input label="Pincode" name="pincode" value={form.pincode} onChange={onChange} required />
      <Input label="Phone" name="phone" icon={Call02Icon} value={form.phone} onChange={onChange} required />
      <div className="flex gap-2 sm:col-span-2">
        <Button type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update address' : 'Save address'}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>}
      </div>
    </div>
  );
}
