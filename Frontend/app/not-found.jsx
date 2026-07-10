import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-7xl font-black text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 max-w-sm text-body">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Button href="/" className="mt-6">Back to Home</Button>
    </Container>
  );
}
