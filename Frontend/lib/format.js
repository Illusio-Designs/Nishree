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
    return f?.url || f?.image || f?.path || '';
  }
  return '';
};

// Human label for a variation (e.g. its weight/size), tolerant of JSON-string
// attributes and falling back to the SKU suffix.
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
  if (v.sku) {
    const parts = String(v.sku).split('-');
    const last = parts[parts.length - 1];
    if (last && /\d/.test(last)) return last.toLowerCase();
  }
  return v.name || 'Default';
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
