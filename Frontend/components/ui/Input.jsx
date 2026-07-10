import { cn } from '@/lib/format';

// Text input with an optional leading icon and label. Rounded, brand focus ring.
export default function Input({
  label,
  icon: Icon,
  error,
  className,
  containerClassName,
  id,
  ...props
}) {
  const inputId = id || props.name;
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block mb-1.5 text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full h-11 rounded-full border border-line bg-white text-ink placeholder:text-muted transition-all focus-ring',
            Icon ? 'pl-11 pr-4' : 'px-4',
            error && 'border-danger',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
