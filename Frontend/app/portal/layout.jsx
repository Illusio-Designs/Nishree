import PortalShell from '@/components/portal/PortalShell';

export const metadata = { title: 'Partner Portal' };

export default function PortalLayout({ children }) {
  return <PortalShell>{children}</PortalShell>;
}
