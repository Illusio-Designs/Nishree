'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/admin/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { createParty } from '@/lib/portal-api';

const EMPTY = { shop_name: '', contact_person: '', phone: '', address: '', city: '', state: '', pincode: '' };

// Lets a salesman register a new shop (party) from the field.
export default function AddPartyModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createParty(form);
      toast.success('New party added');
      setForm(EMPTY);
      onCreated?.(created);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not add party');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add new party"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save party'}</Button>
        </div>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Shop name" name="shop_name" value={form.shop_name} onChange={onChange} required containerClassName="sm:col-span-2" />
        <Input label="Contact person" name="contact_person" value={form.contact_person} onChange={onChange} />
        <Input label="Phone" name="phone" value={form.phone} onChange={onChange} required />
        <Input label="Address" name="address" value={form.address} onChange={onChange} containerClassName="sm:col-span-2" />
        <Input label="City" name="city" value={form.city} onChange={onChange} />
        <Input label="State" name="state" value={form.state} onChange={onChange} />
        <Input label="Pincode" name="pincode" value={form.pincode} onChange={onChange} />
      </form>
    </Modal>
  );
}
