'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowRight01Icon } from 'hugeicons-react';

// Lightweight newsletter signup. There's no subscribe endpoint yet, so this
// acknowledges the sign-up client-side; swap in an API call when one exists.
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    // Placeholder — no backend list yet.
    setTimeout(() => {
      toast.success('Thanks for subscribing!');
      setEmail('');
      setBusy(false);
    }, 300);
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-md gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="h-11 flex-1 rounded-full border border-line bg-white px-4 text-sm text-ink placeholder:text-muted focus-ring"
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full brand-gradient px-5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60 cursor-pointer"
      >
        Subscribe <ArrowRight01Icon size={16} strokeWidth={2} />
      </button>
    </form>
  );
}
