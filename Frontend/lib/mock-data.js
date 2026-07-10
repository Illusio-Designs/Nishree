// Demo spice catalogue used as a fallback when the backend returns no data, so
// the storefront is fully browsable/testable without a running API. Real API
// data always takes precedence (see lib/api.js).

// Build a self-contained SVG data-URI image with a warm spice gradient + glyph.
const spiceImage = (glyph, from, to, label) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/>
    </linearGradient></defs>
    <rect width='400' height='400' fill='url(#g)'/>
    <text x='200' y='210' font-size='150' text-anchor='middle' dominant-baseline='middle'>${glyph}</text>
    <text x='200' y='340' font-size='26' fill='rgba(255,255,255,.9)' font-family='sans-serif' font-weight='700' text-anchor='middle'>${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const MOCK_CATEGORIES = [
  { id: 'c1', name: 'Whole Spices', slug: 'whole-spices', product_count: 24, image: spiceImage('🫚', '#b45309', '#78350f', 'Whole') },
  { id: 'c2', name: 'Ground Spices', slug: 'ground-spices', product_count: 32, image: spiceImage('🌶️', '#b72d24', '#7f1a17', 'Ground') },
  { id: 'c3', name: 'Blends & Masalas', slug: 'blends-masalas', product_count: 18, image: spiceImage('🍛', '#c2410c', '#7c2d12', 'Blends') },
  { id: 'c4', name: 'Seeds', slug: 'seeds', product_count: 15, image: spiceImage('🌰', '#a16207', '#713f12', 'Seeds') },
  { id: 'c5', name: 'Premium & Exotic', slug: 'premium-exotic', product_count: 9, image: spiceImage('✨', '#9a3412', '#7c2d12', 'Premium') },
  { id: 'c6', name: 'Herbs', slug: 'herbs', product_count: 12, image: spiceImage('🌿', '#4d7c0f', '#365314', 'Herbs') },
];

// Weight sets: [label, price multiplier vs. the base unit].
const STD = [['100g', 1], ['500g', 4.6], ['1kg', 9], ['5kg', 42], ['20kg', 160]];
const SMALL = [['50g', 1], ['100g', 1.9], ['250g', 4.6], ['500g', 9], ['1kg', 17]];
const MICRO = [['2g', 1], ['5g', 2.4], ['10g', 4.7], ['25g', 11], ['50g', 21]];

const buildVariations = (id, slug, base, mrp, set) =>
  set.map(([weight, m], i) => ({
    id: `${id}-v${i + 1}`,
    sku: `${slug}-${weight}`.toUpperCase(),
    price: Math.round(base * m),
    comparePrice: Math.round(mrp * m),
    wholesalePrice: Math.round(base * m * 0.8),
    stock: 60 - i * 6,
    attributes: { weight },
    status: 'active',
  }));

// [id, name, slug, catId, catName, glyph, from, to, rating, reviews, base, mrp, set]
const RAW = [
  ['p1', 'Turmeric Powder', 'turmeric-powder', 'c2', 'Ground Spices', '🟡', '#d97706', '#b45309', 4.8, 214, 89, 120, STD],
  ['p2', 'Kashmiri Red Chilli', 'kashmiri-red-chilli', 'c2', 'Ground Spices', '🌶️', '#dc2626', '#7f1a17', 4.9, 388, 149, 199, STD],
  ['p3', 'Garam Masala', 'garam-masala', 'c3', 'Blends & Masalas', '🍛', '#c2410c', '#7c2d12', 4.7, 176, 129, 160, STD],
  ['p4', 'Cumin Seeds', 'cumin-seeds', 'c4', 'Seeds', '🌰', '#a16207', '#713f12', 4.6, 142, 79, 99, STD],
  ['p5', 'Coriander Powder', 'coriander-powder', 'c2', 'Ground Spices', '🟤', '#ca8a04', '#854d0e', 4.5, 98, 69, 90, STD],
  ['p6', 'Black Pepper', 'black-pepper', 'c1', 'Whole Spices', '⚫', '#44403c', '#1c1917', 4.9, 265, 199, 249, STD],
  ['p7', 'Green Cardamom', 'green-cardamom', 'c5', 'Premium & Exotic', '💚', '#15803d', '#14532d', 4.9, 190, 349, 420, SMALL],
  ['p8', 'Cinnamon Sticks', 'cinnamon-sticks', 'c1', 'Whole Spices', '🟫', '#b45309', '#78350f', 4.7, 121, 119, 150, STD],
  ['p9', 'Mustard Seeds', 'mustard-seeds', 'c4', 'Seeds', '🟠', '#ca8a04', '#713f12', 4.4, 84, 59, 75, STD],
  ['p10', 'Cloves', 'cloves', 'c1', 'Whole Spices', '🟤', '#78350f', '#451a03', 4.8, 133, 179, 220, SMALL],
  ['p11', 'Chaat Masala', 'chaat-masala', 'c3', 'Blends & Masalas', '🍋', '#ca8a04', '#854d0e', 4.6, 209, 99, 130, STD],
  ['p12', 'Saffron', 'saffron', 'c5', 'Premium & Exotic', '🌸', '#b91c1c', '#7f1a17', 5.0, 88, 599, 750, MICRO],
];

export const MOCK_PRODUCTS = RAW.map(
  ([id, name, slug, catId, catName, glyph, from, to, rating, reviews, base, mrp, set]) => {
    const image = spiceImage(glyph, from, to, name.split(' ')[0]);
    return {
      id,
      name,
      slug,
      categoryId: catId,
      category: { id: catId, name: catName },
      status: 'active',
      description: `${name} — pure, freshly-ground and sealed for aroma. Available in multiple pack sizes.`,
      avg_rating: rating,
      review_count: reviews,
      image,
      ProductImages: [{ url: image }],
      ProductVariations: buildVariations(id, slug, base, mrp, set),
    };
  },
);

// Demo recipes / blog posts.
const recipe = (id, title, slug, type, category, readTime, excerpt, glyph, from, to) => ({
  id,
  title,
  slug,
  type,
  category,
  read_time: readTime,
  excerpt,
  author: 'Nishree Kitchen',
  status: 'published',
  published_at: '2026-01-15',
  image: spiceImage(glyph, from, to, category),
  content:
    `<p>${excerpt}</p><h3>Ingredients</h3><ul><li>Fresh Nishree spices</li><li>Everyday pantry staples</li></ul>` +
    `<h3>Method</h3><p>Bloom the spices in hot oil, build the base, and simmer until the flavours come together. ` +
    `Finish with a final pinch of freshly-ground masala for aroma.</p>`,
});

export const MOCK_RECIPES = [
  recipe('r1', 'Classic Chicken Curry', 'classic-chicken-curry', 'recipe', 'Recipes', '30 min', 'A rich, home-style chicken curry built on freshly-ground garam masala.', '🍛', '#c2410c', '#7c2d12'),
  recipe('r2', 'Everyday Dal Tadka', 'everyday-dal-tadka', 'recipe', 'Recipes', '25 min', 'Comforting yellow dal finished with a cumin-and-chilli tempering.', '🥘', '#ca8a04', '#854d0e'),
  recipe('r3', 'Paneer Butter Masala', 'paneer-butter-masala', 'recipe', 'Recipes', '35 min', 'Creamy, mildly spiced paneer in a tomato-butter gravy.', '🧈', '#dc2626', '#7f1a17'),
  recipe('r4', 'How to Store Spices for Freshness', 'store-spices-freshness', 'article', 'Tips', '4 min', 'Simple habits that keep your spices aromatic for months.', '📦', '#b45309', '#78350f'),
  recipe('r5', 'Whole vs Ground: When to Use Which', 'whole-vs-ground-spices', 'article', 'Tips', '5 min', 'Get more flavour by choosing the right form for each dish.', '🫙', '#a16207', '#713f12'),
  recipe('r6', 'Masala Chai from Scratch', 'masala-chai-from-scratch', 'recipe', 'Recipes', '15 min', 'A fragrant chai blend with cardamom, ginger and cinnamon.', '☕', '#78350f', '#451a03'),
];

export const findMockRecipe = (slug) =>
  MOCK_RECIPES.find((r) => r.slug === slug || String(r.id) === String(slug)) || null;

export const filterMockRecipes = ({ type } = {}) =>
  type ? MOCK_RECIPES.filter((r) => r.type === type) : MOCK_RECIPES;

export const findMockProduct = (idOrSlug) =>
  MOCK_PRODUCTS.find((x) => String(x.id) === String(idOrSlug) || x.slug === idOrSlug) || null;

export const filterMockProducts = ({ category, search } = {}) => {
  let list = [...MOCK_PRODUCTS];
  if (category) list = list.filter((x) => String(x.categoryId) === String(category) || x.category?.slug === category);
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((x) => x.name.toLowerCase().includes(q));
  }
  return list;
};
