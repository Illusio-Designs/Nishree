import { QuoteDownIcon } from 'hugeicons-react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Rating from '@/components/ui/Rating';
import Card from '@/components/ui/Card';

const REVIEWS = [
  { name: 'Priya S.', city: 'Mumbai', rating: 5, text: 'The garam masala is unbelievably fresh — you can smell it the moment you open the pack. My curries have never tasted better.' },
  { name: 'Rahul M.', city: 'Ahmedabad', rating: 5, text: 'Switched from a supermarket brand and there is no going back. The Kashmiri chilli gives such a beautiful colour.' },
  { name: 'Anjali K.', city: 'Pune', rating: 4, text: 'Great quality and fast delivery. Love that I can buy small packs to try and bulk packs for regulars.' },
];

export default function Testimonials() {
  return (
    <Container className="py-14">
      <SectionHeading title="Loved by home cooks" subtitle="What our customers say about cooking with Nishree." center />
      <div className="grid gap-5 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <Card key={r.name} className="flex flex-col gap-4 p-6">
            <QuoteDownIcon size={28} strokeWidth={2} className="text-brand-200" />
            <p className="flex-1 text-body">{r.text}</p>
            <Rating value={r.rating} />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
                {r.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{r.name}</p>
                <p className="text-xs text-muted">{r.city}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
