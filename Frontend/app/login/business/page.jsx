'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Call02Icon, SecurityLockIcon } from 'hugeicons-react';
import AuthShell from '@/components/store/AuthShell';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { otpLogin } from '@/lib/portal-api';
import { saveSession, demoLogin } from '@/lib/auth';
import { DEMO_FALLBACK } from '@/lib/api';

// OTP login for B2B partners (salesman / party / distributor) via MSG91.
// Consumers use the email/Google login instead. The MSG91 widget would supply an
// access-token in production; here we support a phone+OTP demo flow so the
// portals are testable without live OTP.
export default function BusinessLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('salesman');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone.replace(/\D/g, '').slice(-10))) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }
    // In production the MSG91 widget sends the OTP; in demo we just advance.
    setStep('otp');
    toast.info('OTP sent to your phone');
  };

  const verify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await otpLogin({ phone, role });
      saveSession({ token: data.token, user: data.user });
      toast.success('Welcome!');
      router.push('/portal');
    } catch (err) {
      // No backend? Fall back to a local demo session so the portal opens.
      if (DEMO_FALLBACK && !err?.response) {
        demoLogin(role);
        toast.info('Signed in (demo mode)');
        router.push('/portal');
        return;
      }
      toast.error(err?.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Business partner login"
      subtitle="Salesmen, retail parties & distributors — sign in with your phone."
      footer={<>Are you a shopper? <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in with email</Link></>}
    >
      {step === 'phone' ? (
        <form onSubmit={sendOtp} className="space-y-4">
          <Input label="Phone number" name="phone" icon={Call02Icon} placeholder="10-digit mobile" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          {DEMO_FALLBACK && (
            <Select label="I am a (demo)" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="salesman">Salesman</option>
              <option value="party">Retail party</option>
              <option value="distributor">Distributor</option>
            </Select>
          )}
          <Button type="submit" fullWidth size="lg">Send OTP</Button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <p className="text-sm text-body">Enter the 6-digit code sent to <span className="font-semibold text-ink">{phone}</span>.</p>
          <Input label="OTP" name="otp" icon={SecurityLockIcon} placeholder="Any code works in demo" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <Button type="submit" fullWidth size="lg" disabled={loading}>{loading ? 'Verifying…' : 'Verify & continue'}</Button>
          <button type="button" onClick={() => setStep('phone')} className="w-full text-center text-sm font-medium text-brand-600 hover:text-brand-700">Change number</button>
        </form>
      )}
    </AuthShell>
  );
}
