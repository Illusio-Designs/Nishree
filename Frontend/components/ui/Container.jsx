import { cn } from '@/lib/format';

// Page width constraint + responsive gutters, shared by every section.
export default function Container({ children, className, ...props }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8', className)} {...props}>
      {children}
    </div>
  );
}
