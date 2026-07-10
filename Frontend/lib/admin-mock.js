// Demo datasets for the dashboard so every admin page shows realistic data when
// the backend is empty/unreachable. Real API data always takes precedence.
import { MOCK_RECIPES } from '@/lib/mock-data';

const d = (s) => `2026-01-${s}T10:00:00`;

export const ORDERS = [
  { id: 9001, order_number: 'ORD-20260118-4821', channel: 'd2c', final_amount: 388, payment_status: 'paid', status: 'delivered', created_at: d('18'), User: { username: 'Priya Sharma' } },
  { id: 9002, order_number: 'ORD-20260118-4822', channel: 'd2c', final_amount: 149, payment_status: 'pending', status: 'processing', created_at: d('18'), guest_name: 'Guest' },
  { id: 9003, order_number: 'B2B-20260117-1190', channel: 'b2b', order_type: 'party_order', final_amount: 5240, payment_status: 'pending', status: 'pending', created_at: d('17'), Party: { shop_name: 'Krishna Kirana Store' } },
  { id: 9004, order_number: 'ORD-20260117-4790', channel: 'd2c', final_amount: 268, payment_status: 'paid', status: 'shipped', created_at: d('17'), User: { username: 'Rahul Mehta' } },
  { id: 9005, order_number: 'ORD-20260116-4712', channel: 'd2c', final_amount: 599, payment_status: 'paid', status: 'delivered', created_at: d('16'), User: { username: 'Anjali Kapoor' } },
  { id: 9006, order_number: 'ORD-20260116-4701', channel: 'd2c', final_amount: 119, payment_status: 'failed', status: 'cancelled', created_at: d('16'), guest_name: 'Guest' },
];

export const USERS = [
  { id: 1, username: 'Nishree Admin', email: 'admin@nishree.com', phone: '9999999999', role: 'admin', createdAt: d('01') },
  { id: 2, username: 'Priya Sharma', email: 'priya@example.com', phone: '9820011111', role: 'consumer', createdAt: d('05') },
  { id: 3, username: 'Rahul Mehta', email: 'rahul@example.com', phone: '9820022222', role: 'consumer', createdAt: d('07') },
  { id: 4, username: 'Anjali Kapoor', email: 'anjali@example.com', phone: '9820033333', role: 'consumer', createdAt: d('09') },
  { id: 5, username: 'Suresh Field Rep', email: 'suresh@example.com', phone: '9825044444', role: 'salesman', createdAt: d('03') },
];

export const PARTIES = [
  { id: 1, shop_name: 'Krishna Kirana Store', contact_person: 'Ramesh Patel', phone: '9825022222', city: 'Ahmedabad', status: 'active' },
  { id: 2, shop_name: 'Spice Bazaar', contact_person: 'Meena Joshi', phone: '9825033333', city: 'Surat', status: 'active' },
  { id: 3, shop_name: 'Gupta General Store', contact_person: 'Sanjay Gupta', phone: '9825066666', city: 'Rajkot', status: 'inactive' },
];

export const DISTRIBUTORS = [
  { id: 1, name: 'Gujarat Spice Distributors', company_name: 'GSD Pvt Ltd', phone: '9820011111', state: 'Gujarat', status: 'active' },
  { id: 2, name: 'Western Masala Traders', company_name: 'WMT LLP', phone: '9820044444', state: 'Maharashtra', status: 'active' },
];

export const SALESMEN = [
  { id: 1, name: 'Suresh Field Rep', phone: '9825044444', email: 'suresh@example.com', state: 'Gujarat', status: 'active' },
  { id: 2, name: 'Kiran Sales', phone: '9825077777', email: 'kiran@example.com', state: 'Gujarat', status: 'active' },
  { id: 3, name: 'Deepak Verma', phone: '9825088888', email: 'deepak@example.com', state: 'Maharashtra', status: 'inactive' },
];

export const JOURNEYS = [
  { id: 1, Salesman: { name: 'Suresh Field Rep' }, journey_date: '2026-01-18', start_time: d('18'), end_time: '2026-01-18T17:30:00', total_distance_m: 42350, status: 'completed' },
  { id: 2, Salesman: { name: 'Kiran Sales' }, journey_date: '2026-01-18', start_time: d('18'), end_time: null, total_distance_m: 18900, status: 'active' },
  { id: 3, Salesman: { name: 'Suresh Field Rep' }, journey_date: '2026-01-17', start_time: d('17'), end_time: '2026-01-17T18:00:00', total_distance_m: 51200, status: 'completed' },
];

export const B2B_ORDERS = [
  { id: 9003, order_number: 'B2B-20260117-1190', order_type: 'party_order', final_amount: 5240, status: 'pending', created_at: d('17'), Party: { shop_name: 'Krishna Kirana Store' }, Salesman: { name: 'Suresh Field Rep' } },
  { id: 9007, order_number: 'B2B-20260116-1183', order_type: 'distributor_order', final_amount: 18600, status: 'processing', created_at: d('16'), Distributor: { name: 'Gujarat Spice Distributors' }, Salesman: { name: 'Kiran Sales' } },
  { id: 9008, order_number: 'B2B-20260115-1170', order_type: 'visit_order', final_amount: 3120, status: 'delivered', created_at: d('15'), Party: { shop_name: 'Spice Bazaar' }, Salesman: { name: 'Suresh Field Rep' } },
];

export const OFFERS = [
  { id: 1, name: 'Bulk Wholesale 12%', code: 'BULK12', type: 'percentage', value: 12, status: 'active' },
  { id: 2, name: 'Festive Flat ₹500', code: 'FEST500', type: 'fixed', value: 500, status: 'active' },
];

export const EVENTS = [
  { id: 1, name: 'Ahmedabad Spice Expo 2026', location: 'Ahmedabad', start_date: '2026-02-05', status: 'upcoming' },
  { id: 2, name: 'Surat Food Fair', location: 'Surat', start_date: '2025-12-10', status: 'past' },
];

export const BLOGS = MOCK_RECIPES.map((r) => ({
  id: r.id, title: r.title, type: r.type, category: r.category, status: 'published', image: r.image,
  excerpt: r.excerpt, content: r.content, author: r.author, read_time: r.read_time,
}));

// Build a demo journey detail (route breadcrumbs + timeline) for the View modal.
const BASE = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad
export const journeyDetail = (id) => {
  const journey = JOURNEYS.find((j) => String(j.id) === String(id)) || JOURNEYS[0];
  const steps = 14;
  const points = Array.from({ length: steps }, (_, i) => ({
    latitude: BASE.lat + i * 0.0045 + (i % 2 ? 0.0018 : -0.0016),
    longitude: BASE.lng + i * 0.0052 + (i % 3 ? 0.0012 : -0.0011),
    event_type: i === 0 ? 'start' : i === steps - 1 ? 'end' : 'track',
  }));
  const timeline = {
    checkins: [
      { id: 1, created_at: journey.start_time, reason: 'Sales visit', distance_m: 45, Party: { shop_name: 'Krishna Kirana Store', latitude: BASE.lat + 0.021, longitude: BASE.lng + 0.026 } },
      { id: 2, created_at: journey.start_time, reason: 'Follow-up', distance_m: 80, Party: { shop_name: 'Spice Bazaar', latitude: BASE.lat + 0.045, longitude: BASE.lng + 0.05 } },
    ],
    orders: [
      { id: 9008, order_number: 'B2B-20260115-1170', order_type: 'visit_order', party: 'Spice Bazaar', latitude: BASE.lat + 0.045, longitude: BASE.lng + 0.05, qty: 24, amount: 3120, created_at: journey.start_time },
    ],
  };
  const summary = {
    total_distance_m: journey.total_distance_m,
    total_distance_km: Math.round((journey.total_distance_m / 1000) * 100) / 100,
    points: points.length,
    checkins: timeline.checkins.length,
    orders: timeline.orders.length,
  };
  return { journey, points, timeline, summary };
};

export const ENQUIRIES = [
  { id: 1, business_name: 'Annapurna Restaurant', contact_person: 'Neha Rao', phone: '9825055555', city: 'Vadodara', state: 'Gujarat', product_interest: 'Garam Masala, Turmeric', quantity_estimate: '50 kg / month', status: 'new', created_at: d('18') },
  { id: 2, business_name: 'Hotel Riverside', contact_person: 'Imran Shaikh', phone: '9825099999', city: 'Ahmedabad', state: 'Gujarat', product_interest: 'Whole spices bulk', quantity_estimate: '120 kg / month', status: 'contacted', created_at: d('16') },
  { id: 3, business_name: 'FreshMart Chain', contact_person: 'Divya Nair', phone: '9820066666', city: 'Mumbai', state: 'Maharashtra', product_interest: 'Retail packs', quantity_estimate: '500 units / month', status: 'converted', created_at: d('14') },
];
