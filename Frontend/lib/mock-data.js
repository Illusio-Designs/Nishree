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

const p = (id, name, slug, categoryId, categoryName, glyph, from, to, price, mrp, rating, reviews, unit, description) => ({
  id,
  name,
  slug,
  categoryId,
  category: { id: categoryId, name: categoryName },
  status: 'active',
  unit,
  description,
  avg_rating: rating,
  review_count: reviews,
  image: spiceImage(glyph, from, to, name.split(' ')[0]),
  ProductImages: [{ url: spiceImage(glyph, from, to, name.split(' ')[0]) }],
  ProductVariations: [{ id: `${id}-v1`, sku: `${slug}-100g`, price, comparePrice: mrp, stock: 50, attributes: { weight: '100g' } }],
});

export const MOCK_PRODUCTS = [
  p('p1', 'Turmeric Powder', 'turmeric-powder', 'c2', 'Ground Spices', '🟡', '#d97706', '#b45309', 89, 120, 4.8, 214, '100 g', 'Bright, earthy single-origin turmeric with high curcumin content. Freshly ground and sealed for aroma.'),
  p('p2', 'Kashmiri Red Chilli', 'kashmiri-red-chilli', 'c2', 'Ground Spices', '🌶️', '#dc2626', '#7f1a17', 149, 199, 4.9, 388, '100 g', 'Deep red colour with mild heat — the classic Kashmiri chilli for rich, vibrant curries.'),
  p('p3', 'Garam Masala', 'garam-masala', 'c3', 'Blends & Masalas', '🍛', '#c2410c', '#7c2d12', 129, 160, 4.7, 176, '100 g', 'A warming house blend of cardamom, clove, cinnamon and pepper — hand-roasted and stone-ground.'),
  p('p4', 'Cumin Seeds', 'cumin-seeds', 'c4', 'Seeds', '🌰', '#a16207', '#713f12', 79, 99, 4.6, 142, '100 g', 'Aromatic whole cumin (jeera) with a nutty, peppery note. Perfect for tempering.'),
  p('p5', 'Coriander Powder', 'coriander-powder', 'c2', 'Ground Spices', '🟤', '#ca8a04', '#854d0e', 69, 90, 4.5, 98, '100 g', 'Freshly milled coriander with a citrusy, sweet aroma — a base for everyday cooking.'),
  p('p6', 'Black Pepper', 'black-pepper', 'c1', 'Whole Spices', '⚫', '#44403c', '#1c1917', 199, 249, 4.9, 265, '100 g', 'Bold, pungent Malabar black peppercorns. Grind fresh for maximum punch.'),
  p('p7', 'Green Cardamom', 'green-cardamom', 'c5', 'Premium & Exotic', '💚', '#15803d', '#14532d', 349, 420, 4.9, 190, '50 g', 'Plump, fragrant green cardamom pods — sweet and floral, ideal for chai and desserts.'),
  p('p8', 'Cinnamon Sticks', 'cinnamon-sticks', 'c1', 'Whole Spices', '🟫', '#b45309', '#78350f', 119, 150, 4.7, 121, '100 g', 'True cinnamon quills with a warm, sweet aroma. Great for both sweet and savoury dishes.'),
  p('p9', 'Mustard Seeds', 'mustard-seeds', 'c4', 'Seeds', '🟠', '#ca8a04', '#713f12', 59, 75, 4.4, 84, '100 g', 'Sharp, tangy black mustard seeds that pop beautifully in hot oil.'),
  p('p10', 'Cloves', 'cloves', 'c1', 'Whole Spices', '🟤', '#78350f', '#451a03', 179, 220, 4.8, 133, '50 g', 'Hand-picked whole cloves with an intense, sweet-spicy warmth.'),
  p('p11', 'Chaat Masala', 'chaat-masala', 'c3', 'Blends & Masalas', '🍋', '#ca8a04', '#854d0e', 99, 130, 4.6, 209, '100 g', 'Tangy, zesty street-food blend with amchur and black salt. Sprinkle on everything.'),
  p('p12', 'Saffron', 'saffron', 'c5', 'Premium & Exotic', '🌸', '#b91c1c', '#7f1a17', 599, 750, 5.0, 88, '2 g', 'Premium hand-harvested saffron threads — a little goes a long way for colour and aroma.'),
];

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
