'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { UserIcon, Mail01Icon, LockPasswordIcon, Call02Icon } from 'hugeicons-react';
import AuthShell from '@/components/store/AuthShell';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { register as apiRegister } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRegister(form);
      toast.success('Account created! Please sign in.');
      router.push('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Nishree for fresh spice deals and fast delivery."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Full name" name="username" placeholder="Your name" icon={UserIcon} value={form.username} onChange={onChange} required />
        <Input label="Email" name="email" type="email" placeholder="you@example.com" icon={Mail01Icon} value={form.email} onChange={onChange} required />
        <Input label="Phone" name="phone" placeholder="+91 00000 00000" icon={Call02Icon} value={form.phone} onChange={onChange} />
        <Input label="Password" name="password" type="password" placeholder="Create a password" icon={LockPasswordIcon} value={form.password} onChange={onChange} required />
        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  );
}
