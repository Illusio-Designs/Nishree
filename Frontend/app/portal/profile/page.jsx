'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { UserIcon, Call02Icon, Mail01Icon, Location01Icon, Logout01Icon } from 'hugeicons-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { getUser, clearSession } from '@/lib/auth';
import { getMySalesman, getMyParty, getMyDistributor } from '@/lib/portal-api';

export default function PortalProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? getUser() : null;
  const role = user?.role || 'party';

  useEffect(() => {
    const fetcher = role === 'salesman' ? getMySalesman : role === 'distributor' ? getMyDistributor : getMyParty;
    fetcher().then(setProfile).catch(() => setProfile(null)).finally(() => setLoading(false));
  }, [role]);

  const onLogout = () => { clearSession(); toast.info('Signed out'); router.push('/'); };

  if (loading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>;

  const name = profile?.name || profile?.shop_name || user?.username || 'Partner';
  const rows = [
    { icon: UserIcon, label: 'Name', value: name },
    { icon: Call02Icon, label: 'Phone', value: profile?.phone || user?.phone || '—' },
    { icon: Mail01Icon, label: 'Email', value: profile?.email || user?.email || '—' },
    { icon: Location01Icon, label: 'Location', value: [profile?.city, profile?.state].filter(Boolean).join(', ') || '—' },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-ink">My Profile</h1>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full brand-gradient text-2xl font-bold text-white">{name.charAt(0).toUpperCase()}</div>
          <div>
            <p className="text-lg font-bold text-ink">{name}</p>
            <p className="text-sm capitalize text-muted">{role}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-line p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Icon size={18} strokeWidth={2} /></span>
              <div><dt className="text-xs text-muted">{label}</dt><dd className="text-sm font-semibold text-ink">{value}</dd></div>
            </div>
          ))}
        </dl>
        <Button variant="secondary" icon={Logout01Icon} className="mt-6" onClick={onLogout}>Sign out</Button>
      </Card>
    </div>
  );
}
