// Demo data for the self-scoped B2B portals (salesman / party / distributor),
// used when the backend is empty/unreachable. Real API data always wins.
import { journeyDetail } from '@/lib/admin-mock';

export const MY_SALESMAN = { id: 1, name: 'Suresh Field Rep', phone: '9825044444', email: 'suresh@example.com', city: 'Ahmedabad', state: 'Gujarat', status: 'active' };
export const MY_PARTY = { id: 1, shop_name: 'Krishna Kirana Store', contact_person: 'Ramesh Patel', phone: '9825022222', city: 'Ahmedabad', state: 'Gujarat', credit_limit: 50000, credit_days: 30, status: 'active' };
export const MY_DISTRIBUTOR = { id: 1, name: 'Gujarat Spice Distributors', company_name: 'GSD Pvt Ltd', phone: '9820011111', state: 'Gujarat', status: 'active' };

// Today's route (zone-based beat plan) for the salesman.
export const ROUTE = {
  date: new Date().toISOString().slice(0, 10),
  summary: { total: 5, visited: 2, skipped: 1, pending: 2 },
  stops: [
    { id: 1, sequence: 1, status: 'visited', visited_at: '2026-01-18T10:15:00', Party: { id: 1, shop_name: 'Krishna Kirana Store', address: 'Relief Road', city: 'Ahmedabad', phone: '9825022222', latitude: 23.028, longitude: 72.58 } },
    { id: 2, sequence: 2, status: 'visited', visited_at: '2026-01-18T11:30:00', Party: { id: 2, shop_name: 'Spice Bazaar', address: 'Ring Road', city: 'Ahmedabad', phone: '9825033333', latitude: 23.04, longitude: 72.6 } },
    { id: 3, sequence: 3, status: 'skipped', skip_reason: 'Shop closed', Party: { id: 3, shop_name: 'Gupta General Store', address: 'CG Road', city: 'Ahmedabad', phone: '9825066666', latitude: 23.03, longitude: 72.56 } },
    { id: 4, sequence: 4, status: 'pending', Party: { id: 4, shop_name: 'Sharma Provision', address: 'Naranpura', city: 'Ahmedabad', phone: '9825077777', latitude: 23.05, longitude: 72.55 } },
    { id: 5, sequence: 5, status: 'pending', Party: { id: 5, shop_name: 'Patel Kirana', address: 'Maninagar', city: 'Ahmedabad', phone: '9825088888', latitude: 23.0, longitude: 72.6 } },
  ],
};

export const MY_ORDERS = [
  { id: 9008, order_number: 'B2B-20260118-1201', order_type: 'visit_order', status: 'delivered', final_amount: 3120, created_at: '2026-01-18T11:35:00', Party: { shop_name: 'Spice Bazaar' } },
  { id: 9003, order_number: 'B2B-20260117-1190', order_type: 'party_order', status: 'pending', final_amount: 5240, created_at: '2026-01-17T10:00:00', Party: { shop_name: 'Krishna Kirana Store' } },
];

export const MY_TARGETS = [
  { id: 1, target_amount: 200000, achieved: 128400, start_date: '2026-01-01', end_date: '2026-01-31', order_type: null, description: 'January monthly target' },
  { id: 2, target_amount: 50000, achieved: 41200, start_date: '2026-01-01', end_date: '2026-01-31', order_type: 'visit_order', description: 'On-site visit orders' },
];

export const ACHIEVEMENT = {
  summary: { total_target: 250000, total_achieved: 169600, overall_percent: 68, count: 2 },
  rows: MY_TARGETS.map((t) => ({ target_id: t.id, target_amount: t.target_amount, achieved: t.achieved, percent: Math.round((t.achieved / t.target_amount) * 100), start_date: t.start_date, end_date: t.end_date, description: t.description })),
};

export const VISIT_REPORT = {
  count: 4,
  rows: [
    { type: 'Order', date: '2026-01-18T11:35:00', party: 'Spice Bazaar', qty: 24, amount: 3120, reason: null, distance_m: 45, match_percent: 92 },
    { type: 'Visit', date: '2026-01-18T10:15:00', party: 'Krishna Kirana Store', qty: null, amount: null, reason: 'Sales visit', distance_m: 30, match_percent: 96 },
    { type: 'Visit', date: '2026-01-17T15:20:00', party: 'Gupta General Store', qty: null, amount: null, reason: 'Follow-up', distance_m: 120, match_percent: 74 },
    { type: 'Order', date: '2026-01-17T10:00:00', party: 'Krishna Kirana Store', qty: 40, amount: 5240, reason: null, distance_m: 20, match_percent: 98 },
  ],
};

// Performance snapshot derived for the report page.
export const PERFORMANCE = {
  visits: 12,
  orders: 8,
  revenue: 42360,
  distance_km: 186.4,
  target_percent: ACHIEVEMENT.summary.overall_percent,
  new_parties: 3,
};

export const ACTIVE_JOURNEY = journeyDetail(1);
