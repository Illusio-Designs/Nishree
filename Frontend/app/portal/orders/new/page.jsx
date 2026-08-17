'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Add01Icon, Delete02Icon, ShoppingCart01Icon } from 'hugeicons-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { getProducts } from '@/lib/api';
import { getPartiesForOrder, placeB2BOrder } from '@/lib/portal-api';
import { variationLabel, formatPrice } from '@/lib/format';

const ORDER_TYPES = [
  { value: 'party_order', label: 'Party order' },
  { value: 'visit_order', label: 'Visit order (on-site, GPS verified)' },
];
const PAYMENTS = [
  { value: 'credit', label: 'Credit' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'prepaid', label: 'Prepaid' },
];

const selectCls = 'h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink focus-ring';

export default function NewB2BOrderPage() {
  const router = useRouter();
  const [parties, setParties] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [partyId, setPartyId] = useState('');
  const [orderType, setOrderType] = useState('party_order');
  const [payment, setPayment] = useState('credit');
  const [notes, setNotes] = useState('');

  const [productId, setProductId] = useState('');
  const [variationId, setVariationId] = useState('');
  const [qty, setQty] = useState(1);
  const [lines, setLines] = useState([]);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    Promise.all([getPartiesForOrder(), getProducts({ limit: 200 })])
      .then(([p, pr]) => {
        setParties(Array.isArray(p) ? p : []);
        setProducts(Array.isArray(pr) ? pr : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedProduct = useMemo(() => products.find((p) => String(p.id) === String(productId)), [products, productId]);
  const variations = selectedProduct?.ProductVariations || selectedProduct?.variations || [];

  const addLine = () => {
    if (!productId) return toast.error('Pick a product.');
    if (variations.length > 0 && !variationId) return toast.error('Pick a pack size.');
    const v = variations.find((x) => String(x.id) === String(variationId));
    const price = Number(v?.wholesalePrice ?? v?.price ?? selectedProduct?.price ?? 0);
    setLines((prev) => [
      ...prev,
      {
        key: `${productId}-${variationId || 'base'}-${prev.length}`,
        product_id: Number(productId),
        variation_id: v ? Number(v.id) : null,
        quantity: Math.max(1, Number(qty) || 1),
        name: selectedProduct?.name || 'Product',
        variant: v ? variationLabel(v) : '',
        price,
      },
    ]);
    setProductId(''); setVariationId(''); setQty(1);
  };

  const removeLine = (key) => setLines((prev) => prev.filter((l) => l.key !== key));

  const estTotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  const submit = async () => {
    if (!partyId) return toast.error('Select a party.');
    if (lines.length === 0) return toast.error('Add at least one item.');
    setPlacing(true);

    const items = lines.map((l) => ({ product_id: l.product_id, variation_id: l.variation_id, quantity: l.quantity }));
    const payload = { order_type: orderType, party_id: Number(partyId), items, payment_type: payment, notes };

    const doPost = async () => {
      try {
        const order = await placeB2BOrder(payload);
        toast.success('Order placed');
        router.push('/portal/orders');
        return order;
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Could not place order');
      } finally {
        setPlacing(false);
      }
    };

    // A visit order is geofence-verified — attach the device GPS.
    if (orderType === 'visit_order' && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { payload.checkin_latitude = pos.coords.latitude; payload.checkin_longitude = pos.coords.longitude; doPost(); },
        () => { toast.error('Location needed for a visit order. Enable GPS or use a party order.'); setPlacing(false); },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      doPost();
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">New Order</h1>
        <p className="text-body">Place a wholesale order for a party. Prices are applied at your wholesale rate.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Order details */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">Order details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-ink">Party</label>
                <select value={partyId} onChange={(e) => setPartyId(e.target.value)} className={selectCls} required>
                  <option value="">Select a party…</option>
                  {parties.map((p) => <option key={p.id} value={p.id}>{p.shop_name || p.name || `Party #${p.id}`}</option>)}
                </select>
                {parties.length === 0 && <p className="mt-1 text-xs text-muted">No parties in your zone yet — add one from My Route.</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Order type</label>
                <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className={selectCls}>
                  {ORDER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Payment</label>
                <select value={payment} onChange={(e) => setPayment(e.target.value)} className={selectCls}>
                  {PAYMENTS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {/* Add items */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">Add items</h2>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_90px_auto]">
              <select value={productId} onChange={(e) => { setProductId(e.target.value); setVariationId(''); }} className={selectCls}>
                <option value="">Product…</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={variationId} onChange={(e) => setVariationId(e.target.value)} className={selectCls} disabled={!variations.length}>
                <option value="">{variations.length ? 'Pack size…' : 'No packs'}</option>
                {variations.map((v) => <option key={v.id} value={v.id}>{variationLabel(v) || `#${v.id}`}</option>)}
              </select>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className={selectCls} />
              <Button type="button" icon={Add01Icon} onClick={addLine}>Add</Button>
            </div>

            {lines.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No items added yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {lines.map((l) => (
                  <li key={l.key} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="clamp-1 text-sm font-medium text-ink">{l.name}</p>
                      <p className="text-xs text-muted">{l.variant ? `${l.variant} · ` : ''}Qty {l.quantity}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-ink">{formatPrice(l.price * l.quantity)}</span>
                      <button type="button" onClick={() => removeLine(l.key)} className="text-muted hover:text-danger cursor-pointer">
                        <Delete02Icon size={17} strokeWidth={2} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-24 p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">Summary</h2>
            {lines.length === 0 ? (
              <EmptyState icon={ShoppingCart01Icon} title="No items" message="Add products to build the order." />
            ) : (
              <>
                <div className="flex justify-between text-sm text-body"><span>Items</span><span>{lines.length}</span></div>
                <div className="mt-2 flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
                  <span>Est. total</span><span>{formatPrice(estTotal)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">Final wholesale pricing &amp; offers are applied by the system.</p>
              </>
            )}
            <Button fullWidth size="lg" className="mt-5" onClick={submit} disabled={placing || lines.length === 0 || !partyId}>
              {placing ? 'Placing…' : 'Place Order'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
