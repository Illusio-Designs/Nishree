'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { UserIcon, Mail01Icon, Call02Icon, Location01Icon, ShoppingBag02Icon } from 'hugeicons-react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LocationSelect from '@/components/ui/LocationSelect';
import EmptyState from '@/components/ui/EmptyState';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format';
import { isLoggedIn } from '@/lib/auth';
import { createShippingAddress, createOrder, createGuestOrder } from '@/lib/api';

const PAYMENTS = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'upi', label: 'UPI' },
  { value: 'credit_card', label: 'Card' },
];

const SHIPPING_THRESHOLD = 499;
const SHIPPING_FEE = 49;

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [payment, setPayment] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', country: 'India', city: '', state: '', pincode: '' });
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);

    const orderItems = items.map((i) => ({
      product_id: i.id,
      variation_id: i.variationId || null,
      quantity: i.qty,
    }));

    try {
      let order;
      if (isLoggedIn()) {
        // Signed-in flow: save an address on the account, then place the order.
        const address = await createShippingAddress({
          address: form.address,
          city: form.city,
          state: form.state,
          postal_code: form.pincode,
          country: form.country || 'India',
          phone_number: form.phone,
        });
        order = await createOrder({
          shipping_address_id: address.id,
          payment_type: payment,
          notes: '',
          items: orderItems,
        });
      } else {
        // Guest checkout — no account required.
        order = await createGuestOrder({
          guest_name: form.name,
          guest_email: form.email,
          guest_phone: form.phone,
          shipping_address: {
            address: form.address,
            city: form.city,
            state: form.state,
            postal_code: form.pincode,
            country: form.country || 'India',
          },
          items: orderItems,
          payment_type: payment,
          notes: '',
        });
      }

      clear();
      toast.success('Order placed successfully!');
      router.push(`/order-success?order=${order?.order_number || order?.id || ''}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Checkout" crumbs={[{ label: 'Checkout' }]} />
        <Container className="py-16">
          <EmptyState icon={ShoppingBag02Icon} title="Your cart is empty" message="Add items to your cart before checking out." action={<Button href="/products">Shop Now</Button>} />
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Checkout" subtitle="Almost there — just a few details." crumbs={[{ label: 'Checkout' }]} />
      <Container className="py-10">
        <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Details */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-ink">Shipping details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" name="name" icon={UserIcon} value={form.name} onChange={onChange} required />
                <Input label="Phone" name="phone" icon={Call02Icon} value={form.phone} onChange={onChange} required />
                <Input label="Email" name="email" type="email" icon={Mail01Icon} value={form.email} onChange={onChange} containerClassName="sm:col-span-2" required />
                <Input label="Address" name="address" icon={Location01Icon} value={form.address} onChange={onChange} containerClassName="sm:col-span-2" required />
                <div className="sm:col-span-2">
                  <LocationSelect value={{ country: form.country, state: form.state, city: form.city }} onChange={(v) => setForm((f) => ({ ...f, ...v }))} required />
                </div>
                <Input label="Pincode" name="pincode" value={form.pincode} onChange={onChange} required />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-ink">Payment method</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {PAYMENTS.map((p) => (
                  <label
                    key={p.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-colors ${payment === p.value ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line text-body hover:border-brand-300'}`}
                  >
                    <input type="radio" name="payment" value={p.value} checked={payment === p.value} onChange={() => setPayment(p.value)} className="accent-brand-600" />
                    {p.label}
                  </label>
                ))}
              </div>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-24 p-6">
              <h2 className="mb-4 text-lg font-bold text-ink">Order summary</h2>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.key} className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <p className="clamp-1 text-sm font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-muted">Qty {item.qty}</p>
                    </div>
                    <span className="text-sm font-semibold text-ink">{formatPrice(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex justify-between text-body"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-body"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>
              <Button type="submit" fullWidth size="lg" className="mt-5" disabled={placing}>
                {placing ? 'Placing order…' : 'Place Order'}
              </Button>
            </Card>
          </div>
        </form>
      </Container>
    </>
  );
}
