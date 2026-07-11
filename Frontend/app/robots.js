const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://nishree.com';

// Keep private/authenticated areas out of the index; allow the public storefront.
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/portal', '/checkout', '/login', '/register', '/order-success'],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
