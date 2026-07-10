import { cn } from '@/lib/format';

// Generic surface card. `interactive` adds hover lift for clickable cards.
export default function Card({ children, className, interactive, as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={cn(
        'bg-white rounded-2xl border border-line',
        interactive &&
          'transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 hover:border-brand-200',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
