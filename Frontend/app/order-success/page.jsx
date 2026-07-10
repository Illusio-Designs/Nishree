import { Suspense } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import OrderSuccessInner from '@/components/store/OrderSuccessInner';

export const metadata = { title: 'Order Confirmed' };

export default function OrderSuccessPage() {
  return (
    <Container className="py-16">
      <Suspense fallback={<div className="flex justify-center py-16"><Spinner size={32} /></div>}>
        <OrderSuccessInner />
      </Suspense>
      <div className="mx-auto mt-8 flex max-w-md justify-center gap-3">
        <Button href="/products">Continue Shopping</Button>
        <Button href="/profile" variant="secondary">View Orders</Button>
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Need help? <Link href="/contact" className="font-medium text-brand-600 hover:text-brand-700">Contact support</Link>
      </p>
    </Container>
  );
}
