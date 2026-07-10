import RecipeArticle from '@/components/store/RecipeArticle';

export default async function RecipePage({ params }) {
  const { slug } = await params;
  return <RecipeArticle slug={slug} />;
}
