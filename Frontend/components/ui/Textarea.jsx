import { cn } from '@/lib/format';

export default function Textarea({ label, error, className, id, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block mb-1.5 text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full min-h-28 rounded-2xl border border-line bg-white text-ink placeholder:text-muted p-4 transition-all focus-ring resize-y',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
