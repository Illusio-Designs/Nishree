/**
 * Seed the database with sample SPICE data for testing (D2C + B2B).
 *
 * Run:  npm run seed        (from Backend/)
 *
 * Idempotent: re-running will not duplicate rows (find-or-create by a natural key).
 * Requires the same DB env vars the server uses (.env).
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import slugify from 'slugify';
import { setupDatabase } from './setupDatabase.js';

import { Category } from '../model/categoryModel.js';
import { Product } from '../model/productModel.js';
import { ProductVariation } from '../model/productVariationModel.js';
import { ProductImage } from '../model/productImageModel.js';
import { Coupon } from '../model/couponModel.js';
import { User } from '../model/userModel.js';
import { Zone } from '../model/zoneModel.js';
import { Party } from '../model/partyModel.js';
import { Distributor } from '../model/distributorModel.js';
import { Salesman } from '../model/salesmanModel.js';
import { Offer } from '../model/offerModel.js';
import { Event } from '../model/eventModel.js';
import { Blog } from '../model/blogModel.js';
import { WholesaleEnquiry } from '../model/wholesaleEnquiryModel.js';

// Small inline SVG image so seeded products have a picture out of the box.
const img = (glyph, from, to, label) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/></linearGradient></defs><rect width='400' height='400' fill='url(#g)'/><text x='200' y='215' font-size='150' text-anchor='middle'>${glyph}</text><text x='200' y='340' font-size='26' fill='rgba(255,255,255,.9)' font-family='sans-serif' font-weight='700' text-anchor='middle'>${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const CATEGORIES = [
  { name: 'Whole Spices', description: 'Whole seeds, pods and bark.' },
  { name: 'Ground Spices', description: 'Freshly milled powders.' },
  { name: 'Blends & Masalas', description: 'House-roasted spice blends.' },
  { name: 'Seeds', description: 'Aromatic tempering seeds.' },
  { name: 'Premium & Exotic', description: 'Rare and premium spices.' },
  { name: 'Herbs', description: 'Dried culinary herbs.' },
];

// [name, categoryName, price, comparePrice(MRP), wholesalePrice, stock, glyph, from, to, rating, reviews, unit]
const PRODUCTS = [
  ['Turmeric Powder', 'Ground Spices', 89, 120, 70, 200, '🟡', '#d97706', '#b45309', 4.8, 214, '100g'],
  ['Kashmiri Red Chilli', 'Ground Spices', 149, 199, 120, 180, '🌶️', '#dc2626', '#7f1a17', 4.9, 388, '100g'],
  ['Garam Masala', 'Blends & Masalas', 129, 160, 100, 150, '🍛', '#c2410c', '#7c2d12', 4.7, 176, '100g'],
  ['Cumin Seeds', 'Seeds', 79, 99, 62, 220, '🌰', '#a16207', '#713f12', 4.6, 142, '100g'],
  ['Coriander Powder', 'Ground Spices', 69, 90, 54, 240, '🟤', '#ca8a04', '#854d0e', 4.5, 98, '100g'],
  ['Black Pepper', 'Whole Spices', 199, 249, 160, 120, '⚫', '#44403c', '#1c1917', 4.9, 265, '100g'],
  ['Green Cardamom', 'Premium & Exotic', 349, 420, 290, 80, '💚', '#15803d', '#14532d', 4.9, 190, '50g'],
  ['Cinnamon Sticks', 'Whole Spices', 119, 150, 95, 160, '🟫', '#b45309', '#78350f', 4.7, 121, '100g'],
  ['Mustard Seeds', 'Seeds', 59, 75, 46, 260, '🟠', '#ca8a04', '#713f12', 4.4, 84, '100g'],
  ['Cloves', 'Whole Spices', 179, 220, 145, 90, '🟤', '#78350f', '#451a03', 4.8, 133, '50g'],
  ['Chaat Masala', 'Blends & Masalas', 99, 130, 78, 170, '🍋', '#ca8a04', '#854d0e', 4.6, 209, '100g'],
  ['Saffron', 'Premium & Exotic', 599, 750, 510, 40, '🌸', '#b91c1c', '#7f1a17', 5.0, 88, '2g'],
];

const now = new Date();
const plusDays = (d) => new Date(now.getTime() + d * 86400000);

async function seed() {
  console.log('Setting up database…');
  await setupDatabase();

  console.log('Seeding categories…');
  const categoryByName = {};
  for (const c of CATEGORIES) {
    const [row] = await Category.findOrCreate({
      where: { name: c.name },
      defaults: { name: c.name, slug: slugify(c.name, { lower: true }), description: c.description, status: 'active' },
    });
    categoryByName[c.name] = row;
  }

  console.log('Seeding products…');
  for (const [name, catName, price, mrp, whp, stock, glyph, from, to, rating, reviews, unit] of PRODUCTS) {
    const slug = slugify(name, { lower: true });
    const [product] = await Product.findOrCreate({
      where: { slug },
      defaults: {
        name,
        slug,
        description: `${name} — pure, freshly-ground and sealed for aroma. Net weight ${unit}.`,
        status: 'active',
        categoryId: categoryByName[catName].id,
        avg_rating: rating,
        review_count: reviews,
      },
    });

    const sku = `${slug}-${unit}`.toUpperCase();
    await ProductVariation.findOrCreate({
      where: { sku },
      defaults: {
        productId: product.id,
        sku,
        price,
        comparePrice: mrp,
        wholesalePrice: whp,
        priceTiers: [
          { minQty: 10, price: Math.round(whp * 0.95) },
          { minQty: 50, price: Math.round(whp * 0.9) },
        ],
        stock,
        attributes: { weight: unit },
        status: 'active',
      },
    });

    await ProductImage.findOrCreate({
      where: { product_id: product.id, is_primary: true },
      defaults: { product_id: product.id, image_url: img(glyph, from, to, name.split(' ')[0]), alt_text: name, display_order: 0, is_primary: true, status: 'active' },
    });
  }

  console.log('Seeding coupons…');
  await Coupon.findOrCreate({
    where: { code: 'SPICE10' },
    defaults: { code: 'SPICE10', type: 'percentage', value: 10, minPurchase: 299, maxDiscount: 150, startDate: now, endDate: plusDays(90), status: 'active', description: '10% off orders above ₹299' },
  });
  await Coupon.findOrCreate({
    where: { code: 'FREESHIP' },
    defaults: { code: 'FREESHIP', type: 'fixed', value: 49, minPurchase: 499, startDate: now, endDate: plusDays(90), status: 'active', description: 'Free shipping over ₹499' },
  });

  console.log('Seeding admin user…');
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@nishree.com';
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  await User.findOrCreate({
    where: { email: adminEmail },
    defaults: { username: 'Nishree Admin', email: adminEmail, password: await bcrypt.hash(adminPass, 10), role: 'admin', phone: '9999999999' },
  });

  console.log('Seeding B2B data…');
  const [zoneW] = await Zone.findOrCreate({ where: { name: 'West Zone' }, defaults: { name: 'West Zone', code: 'WZ', status: 'active' } });
  await Zone.findOrCreate({ where: { name: 'North Zone' }, defaults: { name: 'North Zone', code: 'NZ', status: 'active' } });

  const [dist] = await Distributor.findOrCreate({
    where: { name: 'Gujarat Spice Distributors' },
    defaults: { name: 'Gujarat Spice Distributors', company_name: 'GSD Pvt Ltd', contact_person: 'Amit Shah', phone: '9820011111', email: 'gsd@example.com', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001', credit_limit: 200000, status: 'active' },
  });

  await Party.findOrCreate({
    where: { shop_name: 'Krishna Kirana Store' },
    defaults: { shop_name: 'Krishna Kirana Store', contact_person: 'Ramesh Patel', phone: '9825022222', email: 'krishna@example.com', address: 'Relief Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001', zone_id: zoneW.id, distributor_id: dist.id, credit_limit: 50000, credit_days: 30, status: 'active' },
  });
  await Party.findOrCreate({
    where: { shop_name: 'Spice Bazaar' },
    defaults: { shop_name: 'Spice Bazaar', contact_person: 'Meena Joshi', phone: '9825033333', address: 'Ring Road', city: 'Surat', state: 'Gujarat', pincode: '395002', zone_id: zoneW.id, status: 'active' },
  });

  await Salesman.findOrCreate({
    where: { name: 'Suresh Field Rep' },
    defaults: { name: 'Suresh Field Rep', phone: '9825044444', email: 'suresh@example.com', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', status: 'active' },
  });

  await Offer.findOrCreate({
    where: { name: 'Bulk Wholesale 12%' },
    defaults: { name: 'Bulk Wholesale 12%', code: 'BULK12', type: 'percentage', value: 12, min_order_amount: 5000, status: 'active', description: '12% off wholesale orders above ₹5000' },
  });

  await Event.findOrCreate({
    where: { name: 'Ahmedabad Spice Expo 2026' },
    defaults: { name: 'Ahmedabad Spice Expo 2026', location: 'Ahmedabad', start_date: plusDays(20), end_date: plusDays(22), status: 'upcoming', description: 'Annual spice trade exhibition.' },
  });

  console.log('Seeding recipes / blog…');
  const RECIPES = [
    { title: 'Classic Chicken Curry', type: 'recipe', category: 'Recipes', read_time: '30 min', excerpt: 'A rich, home-style chicken curry built on freshly-ground garam masala.', content: '<p>Marinate, sauté onions, add spices and simmer to perfection.</p>' },
    { title: 'Everyday Dal Tadka', type: 'recipe', category: 'Recipes', read_time: '25 min', excerpt: 'Comforting yellow dal finished with a cumin-and-chilli tempering.', content: '<p>Boil dal, prepare a ghee tadka with cumin and dried chilli, combine.</p>' },
    { title: 'How to Store Spices for Maximum Freshness', type: 'article', category: 'Tips', read_time: '4 min', excerpt: 'Simple habits that keep your spices aromatic for months.', content: '<p>Keep spices airtight, away from heat and light, and buy whole where you can.</p>' },
  ];
  for (const r of RECIPES) {
    await Blog.findOrCreate({
      where: { slug: slugify(r.title, { lower: true, strict: true }) },
      defaults: { ...r, slug: slugify(r.title, { lower: true, strict: true }), author: 'Nishree Kitchen', status: 'published', published_at: now },
    });
  }

  console.log('Seeding a sample wholesale enquiry…');
  await WholesaleEnquiry.findOrCreate({
    where: { business_name: 'Annapurna Restaurant' },
    defaults: { business_name: 'Annapurna Restaurant', contact_person: 'Neha Rao', phone: '9825055555', email: 'annapurna@example.com', city: 'Vadodara', state: 'Gujarat', product_interest: 'Garam Masala, Turmeric', quantity_estimate: '50 kg / month', message: 'Looking for monthly bulk supply for our kitchen.', status: 'new' },
  });

  console.log('\n✅ Seed complete.');
  console.log(`   Admin login → ${adminEmail} / ${adminPass}`);
  console.log(`   ${CATEGORIES.length} categories, ${PRODUCTS.length} products, 2 coupons, plus B2B sample data.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
