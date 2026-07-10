import { ArrowDown01Icon } from 'hugeicons-react';
import { cn } from '@/lib/format';

// Styled native <select> — keeps the custom brand look while staying accessible.
export default function Select({ label, error, className, id, children, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block mb-1.5 text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={cn(
            'w-full h-11 appearance-none rounded-full border border-line bg-white text-ink pl-4 pr-10 transition-all focus-ring cursor-pointer',
            error && 'border-danger',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          <ArrowDown01Icon size={18} strokeWidth={2} />
        </span>
      </div>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
