'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '@/lib/api';

// Cart is fully server-backed (/api/cart) and works for everyone — signed-in
// shoppers by account, guests by their x-guest-id. No localStorage cart.
const CartContext = createContext(null);

const mapServer = (list) =>
  (list || []).map((ci) => ({
    key: ci.variationId || ci.productId,
    id: ci.productId,
    variationId: ci.variationId || null,
    name: ci.name,
    price: Number(ci.price) || 0,
    image: ci.image || '',
    qty: ci.quantity,
  }));

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/cart');
      setItems(mapServer(data?.cart));
    } catch {
      setItems([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    load();
    const onAuth = () => load();
    window.addEventListener('nishree-auth-change', onAuth);
    return () => window.removeEventListener('nishree-auth-change', onAuth);
  }, [load]);

  const addItem = useCallback(async (product, qty = 1) => {
    // Optimistic bump for a snappy UI; the server response is the source of truth.
    setItems((prev) => {
      const key = product.variationId || product.id;
      const ex = prev.find((i) => i.key === key);
      if (ex) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { key, id: product.id, variationId: product.variationId || null, name: product.name, price: Number(product.price) || 0, image: product.image || '', qty }];
    });
    try {
      await api.post('/api/cart/add', { productId: product.id, variationId: product.variationId || null, quantity: qty });
      await load();
    } catch {
      toast.error('Could not add to cart');
      load();
    }
  }, [load]);

  const removeItem = useCallback(async (key) => {
    const item = items.find((i) => i.key === key);
    setItems((prev) => prev.filter((i) => i.key !== key));
    if (!item) return;
    try {
      await api.delete(`/api/cart/item/${item.id}`, { params: { variationId: item.variationId || '' } });
      await load();
    } catch {
      load();
    }
  }, [items, load]);

  const updateQty = useCallback(async (key, qty) => {
    const next = Math.max(0, qty);
    if (next === 0) return removeItem(key);
    const item = items.find((i) => i.key === key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: next } : i)));
    if (!item) return;
    try {
      await api.put(`/api/cart/item/${item.id}`, { quantity: next, variationId: item.variationId || null });
      await load();
    } catch {
      load();
    }
  }, [items, removeItem, load]);

  const clear = useCallback(async () => {
    setItems([]);
    try {
      await api.delete('/api/cart/clear');
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    return { items, count, subtotal, addItem, updateQty, removeItem, clear, ready };
  }, [items, addItem, updateQty, removeItem, clear, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
