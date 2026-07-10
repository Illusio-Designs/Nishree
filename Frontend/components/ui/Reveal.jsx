'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/format';

// Wrap a section to fade/slide it in when it scrolls into view (once).
export default function Reveal({ children, className, delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} style={{ transitionDelay: `${delay}ms` }} className={cn('reveal', inView && 'reveal-in', className)}>
      {children}
    </Tag>
  );
}
