import Link from 'next/link';
import { cn } from '@/lib/format';

const VARIANTS = {
  solid: 'brand-gradient text-white shadow-soft hover:brightness-105',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  outline: 'bg-white text-ink border border-line hover:border-brand-300 hover:text-brand-600',
  ghost: 'bg-transparent text-ink hover:bg-surface-soft',
};

const SIZES = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-12 w-12' };

// Circular icon-only button (search, cart, account, close…).
export default function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  href,
  className,
  badge,
  ...props
}) {
  const classes = cn(
    'relative inline-flex items-center justify-center rounded-full transition-all duration-200 focus-ring cursor-pointer',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <>
      {Icon && <Icon size={size === 'sm' ? 18 : 20} strokeWidth={2} />}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full brand-gradient text-white text-[11px] font-bold flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button aria-label={label} className={classes} {...props}>
      {content}
    </button>
  );
}
