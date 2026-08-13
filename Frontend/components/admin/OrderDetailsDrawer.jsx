'use client';

import Drawer from '@/components/ui/Drawer';
import StatusPill from '@/components/admin/StatusPill';
import { mediaUrl } from '@/lib/api';
import { firstImage, variationLabel, formatPrice } from '@/lib/format';

const PAYMENT_LABEL = { cod: 'Cash on Delivery', prepaid: 'Prepaid', credit_card: 'Card', upi: 'UPI', wallet: 'Wallet' };

// Read-only order details: customer, payment, shipping address and line items.
export default function OrderDetailsDrawer({ order, open, onClose }) {
  if (!order) return null;

  const items = order.OrderItems || order.items || [];
  const addr = order.ShippingAddressRef || order.shippingAddress || null;
  const date = order.createdAt || order.created_at;
  const customerName = order.User?.username || order.guest_name || order.Party?.shop_name || '—';
  const customerEmail = order.User?.email || order.guest_email || '';
  const customerPhone = order.guest_phone || addr?.phone_number || '';

  return (
    <Drawer open={open} onClose={onClose} widthClass="max-w-lg" title={order.order_number || `Order #${order.id}`}>
      <div className="space-y-5 p-5">
        {/* Summary chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <StatusPill status={order.status} />
          <span className="rounded-full bg-surface-soft px-3 py-1 font-medium text-body">
            {date ? new Date(date).toLocaleString() : '—'}
          </span>
          <span className="rounded-full bg-surface-soft px-3 py-1 font-semibold uppercase text-muted">{order.channel || 'd2c'}</span>
        </div>

        {/* Customer */}
        <section className="rounded-2xl border border-line p-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Customer</h3>
          <p className="font-semibold text-ink">{customerName}</p>
          {customerEmail && <p className="text-sm text-body">{customerEmail}</p>}
          {customerPhone && <p className="text-sm text-body">{customerPhone}</p>}
        </section>

        {/* Payment */}
        <section className="rounded-2xl border border-line p-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Payment</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">{PAYMENT_LABEL[order.payment_type] || order.payment_type || '—'}</span>
            <StatusPill status={order.payment_status} />
          </div>
        </section>

        {/* Shipping address */}
        <section className="rounded-2xl border border-line p-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Shipping address</h3>
          {addr ? (
            <p className="text-sm leading-relaxed text-body">
              {addr.address}<br />
              {[addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ')}<br />
              {addr.country}
              {addr.phone_number && <><br />{addr.phone_number}</>}
            </p>
          ) : (
            <p className="text-sm text-muted">No address on file.</p>
          )}
        </section>

        {/* Items */}
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Items ({items.length})</h3>
          <ul className="space-y-2">
            {items.map((it) => {
              const img = mediaUrl(firstImage(it.Product) || it.image);
              const variation = it.Variation || it.ProductVariation;
              const vlabel = variation ? variationLabel(variation) : '';
              const price = Number(it.price) || 0;
              const qty = it.quantity ?? it.qty ?? 1;
              const sub = Number(it.subtotal) || price * qty;
              return (
                <li key={it.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-soft">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="clamp-1 text-sm font-semibold text-ink">{it.Product?.name || 'Product'}</p>
                    <p className="text-xs text-muted">{vlabel && `${vlabel} · `}Qty {qty} × {formatPrice(price)}</p>
                  </div>
                  <span className="text-sm font-bold text-ink">{formatPrice(sub)}</span>
                </li>
              );
            })}
            {items.length === 0 && <li className="text-sm text-muted">No items.</li>}
          </ul>
        </section>

        {/* Totals */}
        <section className="rounded-2xl border border-line p-4 text-sm">
          <div className="flex items-center justify-between text-body">
            <span>Subtotal</span>
            <span>{formatPrice(order.total_amount ?? order.subtotal ?? order.final_amount)}</span>
          </div>
          {Number(order.discount_total) > 0 && (
            <div className="mt-1 flex items-center justify-between text-body">
              <span>Discount</span><span>−{formatPrice(order.discount_total)}</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-base font-bold text-ink">
            <span>Total</span><span>{formatPrice(order.final_amount)}</span>
          </div>
        </section>

        {order.notes && (
          <section className="rounded-2xl border border-line p-4">
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">Notes</h3>
            <p className="text-sm text-body">{order.notes}</p>
          </section>
        )}
      </div>
    </Drawer>
  );
}
