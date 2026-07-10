'use client';

import Link from 'next/link';
import { ShoppingCart01Icon, Delete02Icon } from 'hugeicons-react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import QuantityStepper from '@/components/ui/QuantityStepper';
import EmptyState from '@/components/ui/EmptyState';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format';

export default function CartDrawer({ open, onClose }) {
  const { items, subtotal, updateQty, removeItem } = useCart();

  return (
    <Drawer open={open} onClose={onClose} title={`Your Cart (${items.length})`}>
      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart01Icon}
          title="Your cart is empty"
          message="Browse our spices and add something you love."
          action={<Button href="/products" onClick={onClose}>Shop Now</Button>}
        />
      ) : (
        <div className="flex h-full flex-col">
          <ul className="flex-1 divide-y divide-line px-5">
            {items.map((item) => (
              <li key={item.key} className="flex gap-3 py-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-soft">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="clamp-2 text-sm font-semibold text-ink">{item.name}</p>
                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => removeItem(item.key)}
                      className="text-muted hover:text-danger cursor-pointer"
                    >
                      <Delete02Icon size={18} strokeWidth={2} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper
                      size="sm"
                      value={item.qty}
                      onChange={(q) => updateQty(item.key, q)}
                    />
                    <span className="text-sm font-bold text-brand-600">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-line p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-body">Subtotal</span>
              <span className="text-lg font-bold text-ink">{formatPrice(subtotal)}</span>
            </div>
            <Button href="/checkout" fullWidth size="lg" onClick={onClose}>
              Checkout
            </Button>
            <Link
              href="/products"
              onClick={onClose}
              className="mt-3 block text-center text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  );
}
