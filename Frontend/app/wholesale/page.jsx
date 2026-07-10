'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  Building01Icon, UserIcon, Call02Icon, Mail01Icon, Location01Icon,
  PackageIcon, DeliveryTruck01Icon, Tag01Icon, CustomerSupportIcon, SentIcon,
} from 'hugeicons-react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { submitWholesaleEnquiry } from '@/lib/api';

const BENEFITS = [
  { icon: Tag01Icon, title: 'Wholesale pricing', text: 'Volume-based rates with quantity discounts.' },
  { icon: DeliveryTruck01Icon, title: 'Reliable supply', text: 'Consistent monthly supply for your business.' },
  { icon: PackageIcon, title: 'Bulk packs', text: 'From 1kg to 20kg packs, freshly sealed.' },
  { icon: CustomerSupportIcon, title: 'Dedicated support', text: 'A relationship manager for your account.' },
];

const EMPTY = { business_name: '', contact_person: '', phone: '', email: '', city: '', state: '', gst_number: '', product_interest: '', quantity_estimate: '', message: '' };

export default function WholesalePage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitWholesaleEnquiry(form);
      toast.success('Enquiry submitted! Our team will contact you shortly.');
      setForm(EMPTY);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Bulk & Wholesale"
        subtitle="Supplying restaurants, retailers and distributors with pure spices at wholesale prices."
        crumbs={[{ label: 'Wholesale' }]}
      />

      <Container className="py-12">
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon size={20} strokeWidth={2} />
              </span>
              <h3 className="mt-3 font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm text-body">{text}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-bold text-ink">Request wholesale pricing</h2>
            <p className="mt-2 text-body">
              Tell us about your business and what you need. Our team will get back to
              you with a tailored quote — usually within one business day.
            </p>
            <div className="mt-6 space-y-3 rounded-2xl border border-line bg-surface-soft p-5">
              <p className="flex items-center gap-2 text-sm text-body"><Call02Icon size={17} strokeWidth={2} className="text-brand-600" /> +91 00000 00000</p>
              <p className="flex items-center gap-2 text-sm text-body"><Mail01Icon size={17} strokeWidth={2} className="text-brand-600" /> wholesale@nishree.com</p>
              <p className="flex items-center gap-2 text-sm text-body"><Location01Icon size={17} strokeWidth={2} className="text-brand-600" /> Ahmedabad, Gujarat, India</p>
            </div>
          </div>

          <Card className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <Input label="Business name" name="business_name" icon={Building01Icon} value={form.business_name} onChange={onChange} required containerClassName="sm:col-span-2" />
              <Input label="Contact person" name="contact_person" icon={UserIcon} value={form.contact_person} onChange={onChange} />
              <Input label="Phone" name="phone" icon={Call02Icon} value={form.phone} onChange={onChange} required />
              <Input label="Email" name="email" type="email" icon={Mail01Icon} value={form.email} onChange={onChange} />
              <Input label="GST number" name="gst_number" value={form.gst_number} onChange={onChange} />
              <Input label="City" name="city" value={form.city} onChange={onChange} />
              <Input label="State" name="state" value={form.state} onChange={onChange} />
              <Input label="Products of interest" name="product_interest" value={form.product_interest} onChange={onChange} containerClassName="sm:col-span-2" placeholder="e.g. Garam Masala, Turmeric" />
              <Input label="Estimated quantity" name="quantity_estimate" value={form.quantity_estimate} onChange={onChange} containerClassName="sm:col-span-2" placeholder="e.g. 50 kg / month" />
              <div className="sm:col-span-2">
                <Textarea label="Message" name="message" value={form.message} onChange={onChange} placeholder="Tell us more about your requirement" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" iconRight={SentIcon} disabled={loading}>
                  {loading ? 'Submitting…' : 'Submit enquiry'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>
    </>
  );
}
