import ProductDetail from '@/components/store/ProductDetail';

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
