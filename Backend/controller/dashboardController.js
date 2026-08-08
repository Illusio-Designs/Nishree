import { Order } from '../model/orderModel.js';
import { Product } from '../model/productModel.js';
import { User } from '../model/userModel.js';
import { Party } from '../model/partyModel.js';
import { Distributor } from '../model/distributorModel.js';
import { Salesman } from '../model/salesmanModel.js';

// Aggregate KPIs for the admin dashboard: totals, revenue split by channel,
// orders-by-status, and simple counts. One call powers the overview cards.
export const getAdvancedAnalytics = async (req, res) => {
    try {
        const [orders, productCount, userCount, partyCount, distributorCount, salesmanCount] = await Promise.all([
            Order.findAll({ attributes: ['id', 'final_amount', 'total_amount', 'channel', 'status', 'payment_status', 'created_at'] }),
            Product.count(),
            User.count(),
            Party.count(),
            Distributor.count(),
            Salesman.count(),
        ]);

        const amount = (o) => Number(o.final_amount ?? o.total_amount ?? 0);
        const revenue = orders.reduce((a, o) => a + amount(o), 0);
        const d2cRevenue = orders.filter((o) => o.channel !== 'b2b').reduce((a, o) => a + amount(o), 0);
        const b2bRevenue = orders.filter((o) => o.channel === 'b2b').reduce((a, o) => a + amount(o), 0);

        const byStatus = orders.reduce((acc, o) => {
            const k = o.status || 'pending';
            acc[k] = (acc[k] || 0) + 1;
            return acc;
        }, {});

        res.json({
            totals: {
                orders: orders.length,
                revenue,
                products: productCount,
                customers: userCount,
                parties: partyCount,
                distributors: distributorCount,
                salesmen: salesmanCount,
            },
            revenue_by_channel: { d2c: d2cRevenue, b2b: b2bRevenue },
            orders_by_status: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
        });
    } catch (error) {
        console.error('Advanced analytics error:', error);
        res.status(500).json({ message: 'Failed to load analytics', error: error.message });
    }
};
