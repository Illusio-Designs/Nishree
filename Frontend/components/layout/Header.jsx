'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search01Icon,
  ShoppingCart01Icon,
  UserIcon,
  Menu01Icon,
  Cancel01Icon,
} from 'hugeicons-react';
import Container from '@/components/ui/Container';
import Logo from '@/components/ui/Logo';
import IconButton from '@/components/ui/IconButton';
import CartDrawer from '@/components/layout/CartDrawer';
import { useCart } from '@/lib/cart-context';
import { cn } from '@/lib/format';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/products' },
  { label: 'Recipes', href: '/recipes' },
  { label: 'Wholesale', href: '/wholesale' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]));

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface-soft lg:hidden cursor-pointer"
        >
          {menuOpen ? <Cancel01Icon size={22} strokeWidth={2} /> : <Menu01Icon size={22} strokeWidth={2} />}
        </button>

        <Logo />

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'relative rounded-full px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href) ? 'text-brand-600' : 'text-body hover:text-ink',
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full brand-gradient" />
              )}
            </Link>
          ))}
        </nav>

        {/* Search (desktop) */}
        <form onSubmit={onSearch} className="ml-auto hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search spices..."
              className="h-11 w-full rounded-full border border-line bg-surface-soft pl-4 pr-11 text-sm text-ink placeholder:text-muted focus-ring"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full brand-gradient text-white cursor-pointer"
            >
              <Search01Icon size={17} strokeWidth={2} />
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <IconButton icon={Search01Icon} label="Search" href="/products" className="md:hidden" />
          <IconButton icon={UserIcon} label="Account" href="/login" />
          <IconButton icon={ShoppingCart01Icon} label="Cart" badge={count} onClick={() => setCartOpen(true)} />
        </div>
      </Container>

      {/* Mobile nav panel */}
      <div
        className={cn(
          'overflow-hidden border-t border-line bg-white transition-[max-height] duration-300 lg:hidden',
          menuOpen ? 'max-h-96' : 'max-h-0',
        )}
      >
        <Container className="flex flex-col py-2">
          <form onSubmit={onSearch} className="py-2 md:hidden">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search spices..."
                className="h-11 w-full rounded-full border border-line bg-surface-soft pl-4 pr-11 text-sm text-ink placeholder:text-muted focus-ring"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                <Search01Icon size={18} strokeWidth={2} />
              </span>
            </div>
          </form>
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                isActive(item.href) ? 'bg-brand-50 text-brand-600' : 'text-body hover:bg-surface-soft',
              )}
            >
              {item.label}
            </Link>
          ))}
        </Container>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
