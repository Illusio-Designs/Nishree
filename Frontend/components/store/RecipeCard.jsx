import Link from 'next/link';
import { Clock01Icon, ArrowRight01Icon } from 'hugeicons-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { mediaUrl } from '@/lib/api';

export default function RecipeCard({ post }) {
  const img = mediaUrl(post.image);
  const href = `/recipes/${post.slug || post.id}`;
  return (
    <Card interactive className="group flex flex-col overflow-hidden">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-surface-soft">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        ) : null}
        {post.category && <span className="absolute left-3 top-3"><Badge tone="brand">{post.category}</Badge></span>}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-3 text-xs text-muted">
          {post.read_time && (
            <span className="inline-flex items-center gap-1">
              <Clock01Icon size={13} strokeWidth={2} /> {post.read_time}
            </span>
          )}
          {post.author && <span>· {post.author}</span>}
        </div>
        <Link href={href}>
          <h3 className="clamp-2 text-lg font-bold text-ink transition-colors hover:text-brand-600">{post.title}</h3>
        </Link>
        {post.excerpt && <p className="clamp-2 text-sm text-body">{post.excerpt}</p>}
        <Link href={href} className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
          Read more <ArrowRight01Icon size={15} strokeWidth={2} />
        </Link>
      </div>
    </Card>
  );
}
