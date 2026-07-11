const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://nishree.com';

// Public, indexable routes. Product/recipe detail pages are best added from the
// backend catalogue at build time; the core storefront pages are listed here.
export default function sitemap() {
  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/products', priority: 0.9, changeFrequency: 'daily' },
    { path: '/recipes', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/wholesale', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/policies', priority: 0.3, changeFrequency: 'yearly' },
  ];
  return routes.map((r) => ({
    url: `${site}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
