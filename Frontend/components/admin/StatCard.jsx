import Card from '@/components/ui/Card';

// Metric tile for the dashboard overview.
export default function StatCard({ icon: Icon, label, value, hint, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    success: 'bg-[color:var(--color-success)]/12 text-[color:var(--color-success)]',
    warning: 'bg-[color:var(--color-warning)]/15 text-[color:var(--color-warning)]',
    ink: 'bg-surface-soft text-ink',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        {Icon && (
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
            <Icon size={22} strokeWidth={2} />
          </span>
        )}
      </div>
    </Card>
  );
}
