import Link from 'next/link';
import { cn } from '@/lib/format';

// Brand button. Variants map to the Nishree red system; sizes share a rounded,
// pill-ish silhouette to match the storefront. Renders a <Link> when `href` is
// given, otherwise a <button>.
const VARIANTS = {
  primary:
    'brand-gradient text-white shadow-soft hover:brightness-[1.05] active:brightness-95',
  secondary:
    'bg-white text-ink border border-line hover:border-brand-300 hover:text-brand-600',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost: 'bg-transparent text-ink hover:bg-surface-soft',
  danger: 'bg-danger text-white hover:brightness-95',
};

const SIZES = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  icon: Icon,
  iconRight: IconRight,
  className,
  fullWidth,
  type = 'button',
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus-ring disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  );

  const inner = (
    <>
      {Icon && <Icon size={size === 'lg' ? 20 : 18} strokeWidth={2} />}
      {children}
      {IconRight && <IconRight size={size === 'lg' ? 20 : 18} strokeWidth={2} />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {inner}
    </button>
  );
}
