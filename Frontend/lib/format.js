// Small presentation helpers shared across pages.

export const formatPrice = (value) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
};

// Percentage discount between an original (compare) price and the selling price.
export const discountPercent = (price, compareAt) => {
  const p = Number(price);
  const c = Number(compareAt);
  if (!c || !p || c <= p) return 0;
  return Math.round(((c - p) / c) * 100);
};

export const cn = (...parts) => parts.filter(Boolean).join(' ');

// Pull a usable image path from the various product/category shapes.
export const firstImage = (entity) => {
  if (!entity) return '';
  if (typeof entity.image === 'string') return entity.image;
  if (typeof entity.thumbnail === 'string') return entity.thumbnail;
  const imgs = entity.ProductImages || entity.images || entity.product_images;
  if (Array.isArray(imgs) && imgs.length) {
    const f = imgs[0];
    if (typeof f === 'string') return f;
    return f?.url || f?.image_url || f?.image || f?.path || '';
  }
  return '';
};

// Human label for a variation (e.g. its weight/size). Prefers a real
// weight/size, never the random SKU suffix. Returns '' when there's nothing
// meaningful to show, so callers can hide an unlabelled chip.
export const variationLabel = (v) => {
  if (!v) return '';
  let attrs = v.attributes;
  if (typeof attrs === 'string') {
    try { attrs = JSON.parse(attrs); } catch { attrs = null; }
  }
  if (attrs && typeof attrs === 'object') {
    const val = attrs.weight || attrs.size || attrs.pack || attrs.title || Object.values(attrs)[0];
    if (val && String(val).toLowerCase() !== 'default') return String(val);
  }
  // Real weight column, e.g. 50 + "g" -> "50g", 1 + "kg" -> "1kg".
  if (v.weight != null && v.weight !== '') {
    const n = Number(v.weight);
    const num = Number.isFinite(n) ? (Number.isInteger(n) ? n : n) : v.weight;
    return `${num}${v.weightUnit || 'g'}`;
  }
  const name = v.name && String(v.name).toLowerCase() !== 'default' ? String(v.name) : '';
  return name;
};

// A product's selling price + compare-at, tolerant of variation shapes.
export const productPricing = (product) => {
  if (!product) return { price: 0, compareAt: null };
  const variations = product.ProductVariations || product.variations || [];
  const v = Array.isArray(variations) && variations.length ? variations[0] : null;
  const price = Number(v?.price ?? product.price ?? 0);
  const compareAt = Number(v?.comparePrice ?? product.comparePrice ?? 0) || null;
  return { price, compareAt };
};
