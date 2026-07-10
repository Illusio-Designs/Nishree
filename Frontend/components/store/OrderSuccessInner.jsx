'use client';

import { useSearchParams } from 'next/navigation';
import { CheckmarkCircle02Icon, PackageIcon } from 'hugeicons-react';

export default function OrderSuccessInner() {
  const params = useSearchParams();
  const orderNo = params.get('order');

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <CheckmarkCircle02Icon size={44} strokeWidth={2} />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-ink">Thank you for your order!</h1>
      <p className="mt-2 text-body">
        Your order has been placed successfully. We&apos;ll send you an update as it
        ships.
      </p>
      {orderNo && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface-soft px-4 py-2 text-sm font-semibold text-ink">
          <PackageIcon size={17} strokeWidth={2} className="text-brand-600" />
          Order #{orderNo}
        </div>
      )}
    </div>
  );
}
