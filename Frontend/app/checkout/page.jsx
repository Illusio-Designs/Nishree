'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { UserIcon, Mail01Icon, Call02Icon, Location01Icon, ShoppingBag02Icon, Add01Icon } from 'hugeicons-react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import LocationSelect from '@/components/ui/LocationSelect';
import EmptyState from '@/components/ui/EmptyState';
import AddressForm from '@/components/store/AddressForm';
import { useCart } from '@/lib/cart-context';
import { formatPrice, cn } from '@/lib/format';
import { isLoggedIn, getUser } from '@/lib/auth';
import { createOrder, createGuestOrder, getMyAddresses, validateCoupon } from '@/lib/api';

const PAYMENTS = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'prepaid', label: 'Prepaid' },
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [payment, setPayment] = useState('cod');
  const [placing, setPlacing] = useState(false);

  // Signed-in address flow
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);

  // Guest form
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', country: 'India', city: '', state: '', pincode: '' });
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, discount }
  const [couponBusy, setCouponBusy] = useState(false);

  const discount = coupon?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponBusy(true);
    try {
      const res = await validateCoupon({ code, orderAmount: subtotal, userId: getUser()?.id });
      setCoupon({ code: code.toUpperCase(), discount: Number(res?.discountAmount) || 0 });
      toast.success('Coupon applied');
    } catch (err) {
      setCoupon(null);
      toast.error(err?.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode('');
  };

  useEffect(() => {
    const loggedIn = isLoggedIn();
    setAuthed(loggedIn);
    if (!loggedIn) {
      setReady(true);
      return;
    }
    getMyAddresses()
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setAddresses(arr);
        const def = arr.find((a) => a.is_default) || arr[0];
        setSelectedId(def?.id ?? null);
        // No saved address yet → open the add-address form straight away.
        if (arr.length === 0) setAddingAddress(true);
      })
      .catch(() => setAddingAddress(true))
      .finally(() => setReady(true));
  }, []);

  const onAddressSaved = (addr) => {
    if (addr) {
      setAddresses((prev) => [addr, ...prev.filter((a) => a.id !== addr.id)]);
      setSelectedId(addr.id);
    }
    setAddingAddress(false);
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    const orderItems = items.map((i) => ({
      product_id: i.id,
      variation_id: i.variationId || null,
      quantity: i.qty,
    }));

    if (authed && !selectedId) {
      toast.error('Please select or add a delivery address.');
      return;
    }

    setPlacing(true);
    try {
      let order;
      if (authed) {
        // Signed-in flow: use the chosen saved address.
        order = await createOrder({
          shipping_address_id: selectedId,
          payment_type: payment,
          notes: '',
          items: orderItems,
          coupon_code: coupon?.code || undefined,
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
          coupon_code: coupon?.code || undefined,
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
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">Delivery address</h2>
                {authed && !addingAddress && (
                  <Button size="sm" icon={Add01Icon} onClick={() => setAddingAddress(true)}>
                    Add new address
                  </Button>
                )}
              </div>

              {/* Signed-in: pick a saved address */}
              {authed ? (
                !ready ? (
                  <div className="flex justify-center py-6"><Spinner size={22} /></div>
                ) : (
                  <div className="space-y-4">
                    {addresses.length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {addresses.map((a) => (
                          <label
                            key={a.id}
                            className={cn(
                              'flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 text-sm transition-colors',
                              selectedId === a.id ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-300',
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-2 font-semibold text-ink">
                                <input
                                  type="radio"
                                  name="address"
                                  className="accent-brand-600"
                                  checked={selectedId === a.id}
                                  onChange={() => setSelectedId(a.id)}
                                />
                                {a.city || 'Address'}
                              </span>
                              {a.is_default && <Badge tone="brand">Default</Badge>}
                            </div>
                            <span className="text-body">
                              {[a.address, a.city, a.state, a.postal_code, a.country].filter(Boolean).join(', ')}
                            </span>
                            {a.phone_number && <span className="text-xs text-muted">Phone: {a.phone_number}</span>}
                          </label>
                        ))}
                      </div>
                    )}

                    {addingAddress && (
                      <div className="rounded-2xl border border-line p-4">
                        <h3 className="mb-3 text-sm font-bold text-ink">New address</h3>
                        <AddressForm
                          onSaved={onAddressSaved}
                          onCancel={addresses.length > 0 ? () => setAddingAddress(false) : undefined}
                        />
                      </div>
                    )}
                  </div>
                )
              ) : (
                /* Guest: fill in shipping details */
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
              )}
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-ink">Payment method</h2>
              <div className="grid gap-3 sm:grid-cols-2">
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
                      <p className="text-xs text-muted">
                        {item.variant ? `${item.variant} · ` : ''}Qty {item.qty}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-ink">{formatPrice(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              {/* Coupon */}
              <div className="mt-5 border-t border-line pt-4">
                {coupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2.5 text-sm">
                    <span className="font-semibold text-brand-700">
                      {coupon.code} applied
                    </span>
                    <button type="button" onClick={removeCoupon} className="text-xs font-medium text-brand-600 hover:underline cursor-pointer">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="h-10 flex-1 rounded-full border border-line bg-white px-4 text-sm uppercase text-ink placeholder:normal-case placeholder:text-muted focus-ring"
                    />
                    <Button type="button" variant="secondary" onClick={applyCoupon} disabled={couponBusy || !couponCode.trim()}>
                      {couponBusy ? '…' : 'Apply'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-body"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-brand-600">
                    <span>Discount</span><span>−{formatPrice(discount)}</span>
                  </div>
                )}
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
