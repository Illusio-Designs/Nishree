'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  UserIcon,
  Mail01Icon,
  Call02Icon,
  PackageIcon,
  Location01Icon,
  FavouriteIcon,
  Logout01Icon,
} from 'hugeicons-react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { getUser, clearSession, isLoggedIn } from '@/lib/auth';

const TABS = [
  { icon: PackageIcon, label: 'My Orders' },
  { icon: Location01Icon, label: 'Addresses' },
  { icon: FavouriteIcon, label: 'Wishlist' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
      return;
    }
    setUser(getUser());
    setReady(true);
  }, [router]);

  const onLogout = () => {
    clearSession();
    toast.info('Signed out');
    router.push('/');
  };

  if (!ready) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={32} />
      </div>
    );
  }

  const name = user?.username || user?.full_name || 'Nishree Customer';
  const email = user?.email || '—';

  return (
    <>
      <PageHeader title="My Account" subtitle={`Welcome back, ${name}.`} crumbs={[{ label: 'Profile' }]} />
      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <Card className="h-max p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full brand-gradient text-2xl font-bold text-white">
                {name.charAt(0).toUpperCase()}
              </div>
              <p className="mt-3 font-bold text-ink">{name}</p>
              <p className="text-sm text-muted">{email}</p>
            </div>
            <nav className="mt-6 space-y-1">
              {TABS.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-body transition-colors hover:bg-surface-soft cursor-pointer"
                >
                  <Icon size={18} strokeWidth={2} />
                  {label}
                </button>
              ))}
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-red-50 cursor-pointer"
              >
                <Logout01Icon size={18} strokeWidth={2} />
                Sign out
              </button>
            </nav>
          </Card>

          {/* Content */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-ink">Profile details</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: UserIcon, label: 'Name', value: name },
                  { icon: Mail01Icon, label: 'Email', value: email },
                  { icon: Call02Icon, label: 'Phone', value: user?.phone || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-line p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <div>
                      <dt className="text-xs text-muted">{label}</dt>
                      <dd className="text-sm font-semibold text-ink">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="p-6">
              <h2 className="mb-2 text-lg font-bold text-ink">Recent orders</h2>
              <p className="text-sm text-body">Your order history will appear here.</p>
              <Button href="/products" className="mt-4">Start shopping</Button>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}
