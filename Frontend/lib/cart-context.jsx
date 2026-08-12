'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';

// Cart is server-backed for signed-in shoppers (/api/cart) and falls back to
// localStorage for guests. A guest cart is merged into the account on login.
const CartContext = createContext(null);

const STORAGE_KEY = 'nishree_cart';

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
  const authed = useRef(false);

  const loadServer = useCallback(async () => {
    try {
      const { data } = await api.get('/api/cart');
      setItems(mapServer(data?.cart));
    } catch {
      setItems([]);
    }
  }, []);

  const loadLocal = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, []);

  // Push any guest cart into the account, then clear the local copy.
  const mergeLocalToServer = useCallback(async () => {
    let local = [];
    try {
      local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      local = [];
    }
    for (const i of local) {
      try {
        await api.post('/api/cart/add', { productId: i.id, variationId: i.variationId || null, quantity: i.qty });
      } catch {
        /* skip a failed line */
      }
    }
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const sync = useCallback(async () => {
    if (isLoggedIn()) {
      authed.current = true;
      await mergeLocalToServer();
      await loadServer();
    } else {
      authed.current = false;
      loadLocal();
    }
    setReady(true);
  }, [loadServer, loadLocal, mergeLocalToServer]);

  useEffect(() => {
    sync();
    const onAuth = () => sync();
    window.addEventListener('nishree-auth-change', onAuth);
    return () => window.removeEventListener('nishree-auth-change', onAuth);
  }, [sync]);

  // Persist to localStorage only for guests.
  useEffect(() => {
    if (ready && !authed.current) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const localAdd = (product, qty) =>
    setItems((prev) => {
      const key = product.variationId || product.id;
      const existing = prev.find((i) => i.key === key);
      if (existing) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [
        ...prev,
        { key, id: product.id, variationId: product.variationId || null, name: product.name, price: Number(product.price) || 0, image: product.image || '', qty },
      ];
    });

  const addItem = useCallback(async (product, qty = 1) => {
    localAdd(product, qty); // optimistic in both modes
    if (authed.current) {
      try {
        await api.post('/api/cart/add', { productId: product.id, variationId: product.variationId || null, quantity: qty });
        await loadServer();
      } catch { /* keep optimistic */ }
    }
  }, [loadServer]);

  const removeItem = useCallback(async (key) => {
    const item = items.find((i) => i.key === key);
    setItems((prev) => prev.filter((i) => i.key !== key));
    if (authed.current && item) {
      try {
        await api.delete(`/api/cart/item/${item.id}`, { params: { variationId: item.variationId || '' } });
        await loadServer();
      } catch { /* keep optimistic */ }
    }
  }, [items, loadServer]);

  const updateQty = useCallback(async (key, qty) => {
    const next = Math.max(0, qty);
    if (next === 0) return removeItem(key);
    const item = items.find((i) => i.key === key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: next } : i)));
    if (authed.current && item) {
      try {
        await api.put(`/api/cart/item/${item.id}`, { quantity: next, variationId: item.variationId || null });
        await loadServer();
      } catch { /* keep optimistic */ }
    }
  }, [items, removeItem, loadServer]);

  const clear = useCallback(async () => {
    setItems([]);
    if (authed.current) {
      try { await api.delete('/api/cart/clear'); } catch { /* ignore */ }
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
