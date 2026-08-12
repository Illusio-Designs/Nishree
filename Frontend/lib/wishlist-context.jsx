'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getWishlistIds, addToWishlist, removeFromWishlist } from '@/lib/wishlist-api';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => new Set());

  const refresh = useCallback(async () => {
    const list = await getWishlistIds();
    setIds(new Set(list.map(Number)));
  }, []);

  useEffect(() => {
    refresh();
    const onAuth = () => refresh();
    window.addEventListener('nishree-auth-change', onAuth);
    return () => window.removeEventListener('nishree-auth-change', onAuth);
  }, [refresh]);

  const has = useCallback((productId) => ids.has(Number(productId)), [ids]);

  // Toggle a product in the wishlist. Works for guests (x-guest-id) too.
  const toggle = useCallback(async (productId) => {
    const pid = Number(productId);
    const wasIn = ids.has(pid);
    // Optimistic update.
    setIds((prev) => {
      const next = new Set(prev);
      if (wasIn) next.delete(pid); else next.add(pid);
      return next;
    });
    try {
      if (wasIn) await removeFromWishlist(pid);
      else await addToWishlist(pid);
      toast.success(wasIn ? 'Removed from wishlist' : 'Saved to wishlist');
    } catch {
      // Revert on failure.
      setIds((prev) => {
        const next = new Set(prev);
        if (wasIn) next.add(pid); else next.delete(pid);
        return next;
      });
      toast.error('Could not update wishlist');
    }
    return !wasIn;
  }, [ids]);

  const value = useMemo(() => ({ ids, has, toggle, refresh, count: ids.size }), [ids, has, toggle, refresh]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext) || { ids: new Set(), has: () => false, toggle: () => {}, refresh: () => {}, count: 0 };
}
