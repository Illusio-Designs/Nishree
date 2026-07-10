'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Mail01Icon, LockPasswordIcon } from 'hugeicons-react';
import AuthShell from '@/components/store/AuthShell';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { login as apiLogin, DEMO_FALLBACK } from '@/lib/api';
import { saveSession, demoLogin } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiLogin(form);
      saveSession({ token: data.token, user: data.user });
      toast.success('Welcome back!');
      router.push('/profile');
    } catch (err) {
      // No backend? Fall back to a demo session so the app stays testable.
      if (DEMO_FALLBACK && !err?.response) {
        const role = form.email?.toLowerCase().includes('admin') ? 'admin' : 'consumer';
        demoLogin(role);
        toast.info('Signed in (demo mode)');
        router.push(role === 'admin' ? '/dashboard' : '/profile');
        return;
      }
      toast.error(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const enterDemo = () => {
    demoLogin('admin');
    toast.info('Exploring the demo dashboard');
    router.push('/dashboard');
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back — let's get you shopping."
      footer={
        <>
          New to Nishree?{' '}
          <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          icon={Mail01Icon}
          value={form.email}
          onChange={onChange}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          icon={LockPasswordIcon}
          value={form.password}
          onChange={onChange}
          required
        />
        <div className="flex justify-end">
          <Link href="/login" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>

        {DEMO_FALLBACK && (
          <>
            <div className="flex items-center gap-3 py-1 text-xs text-muted">
              <span className="h-px flex-1 bg-line" />
              or
              <span className="h-px flex-1 bg-line" />
            </div>
            <Button type="button" variant="secondary" fullWidth onClick={enterDemo}>
              Explore the demo dashboard
            </Button>
            <p className="text-center text-xs text-muted">
              No account needed — opens the admin dashboard with demo data.
            </p>
          </>
        )}
      </form>
    </AuthShell>
  );
}
