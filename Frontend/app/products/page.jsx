import { Suspense } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import ProductsBrowser from '@/components/store/ProductsBrowser';

export const metadata = { title: 'Products' };

export default function ProductsPage() {
  return (
    <>
      <PageHeader title="All Products" subtitle="Fresh picks and everyday essentials, all in one place." crumbs={[{ label: 'Products' }]} />
      <Suspense fallback={<div className="flex justify-center py-24"><Spinner size={32} /></div>}>
        <ProductsBrowser />
      </Suspense>
    </>
  );
}
