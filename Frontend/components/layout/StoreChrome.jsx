'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// The storefront Header/Footer should wrap public pages only. Dashboard routes
// render their own admin shell, so skip the store chrome there.
export default function StoreChrome({ children }) {
  const pathname = usePathname();
  // Admin dashboard and the partner portal render their own shells.
  const ownShell = pathname?.startsWith('/dashboard') || pathname?.startsWith('/portal');

  if (ownShell) return children;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
