import CollectionView from '@/components/store/CollectionView';

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  return <CollectionView slug={slug} />;
}
