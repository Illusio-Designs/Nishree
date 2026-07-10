'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Location01Icon, Call02Icon, Mail01Icon, Clock01Icon, SentIcon } from 'hugeicons-react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

const INFO = [
  { icon: Location01Icon, title: 'Visit us', lines: ['Ahmedabad, Gujarat', 'India'] },
  { icon: Call02Icon, title: 'Call us', lines: ['+91 00000 00000', 'Mon–Sat, 9am–7pm'] },
  { icon: Mail01Icon, title: 'Email us', lines: ['info@illusiodesigns.agency'] },
  { icon: Clock01Icon, title: 'Working hours', lines: ['Mon–Sat: 9am – 7pm', 'Sunday: Closed'] },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // No public contact endpoint yet — acknowledge locally.
    setTimeout(() => {
      toast.success("Thanks! We'll get back to you shortly.");
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <PageHeader
        title="Get in touch"
        subtitle="Questions, feedback, or a bulk order? We'd love to hear from you."
        crumbs={[{ label: 'Contact' }]}
      />

      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Info */}
          <div className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {INFO.map(({ icon: Icon, title, lines }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-bold text-ink">{title}</p>
                    {lines.map((l) => (
                      <p key={l} className="text-sm text-body">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
              <h2 className="text-xl font-bold text-ink">Send us a message</h2>
              <form onSubmit={onSubmit} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Your name" name="name" value={form.name} onChange={onChange} required />
                  <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
                </div>
                <Input label="Subject" name="subject" value={form.subject} onChange={onChange} />
                <Textarea label="Message" name="message" value={form.message} onChange={onChange} required />
                <Button type="submit" size="lg" iconRight={SentIcon} disabled={loading}>
                  {loading ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
