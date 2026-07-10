import DashboardShell from '@/components/admin/DashboardShell';

export const metadata = { title: 'Dashboard' };

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
