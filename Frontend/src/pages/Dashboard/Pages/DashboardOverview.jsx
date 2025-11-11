import { useEffect, useState } from 'react';
import { 
  productService, 
  orderService, 
  userService, 
  categoryService,
  reviewService,
  couponService 
} from '../../../services';
import { 
  HiOutlineShoppingCart, 
  HiOutlineUsers, 
  HiOutlineCube,
  HiOutlineCurrencyDollar,
  HiOutlineClipboardDocumentCheck,
  HiOutlineExclamationTriangle
} from 'react-icons/hi2';
import '../.././../Styles/dashboard/DashboardOverview.css';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [products, orders, users, categories, reviews, coupons] = await Promise.all([
        productService.getAllProducts().catch(() => ({ data: { products: [] } })),
        orderService.getAllOrders().catch(() => []),
        userService.getAllUsers().catch(() => ({ users: [] })),
        categoryService.getAllCategories().catch(() => []),
        reviewService.getAllReviews().catch(() => []),
        couponService.getAllCoupons().catch(() => ({ coupons: [] }))
      ]);

      // Process products
      const productList = Array.isArray(products) ? products : 
                         Array.isArray(products?.products) ? products.products :
                         Array.isArray(products?.data?.products) ? products.data.products : [];
      
      // Calculate low stock products
      const lowStock = productList.filter(p => {
        const totalStock = p.ProductVariations?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
        return totalStock < 10;
      }).length;

      // Process orders
      const orderList = Array.isArray(orders) ? orders : orders?.orders || [];
      const pendingOrders = orderList.filter(o => o.status === 'pending' || o.status === 'processing').length;
      
      // Calculate total revenue from completed orders
      const totalRevenue = orderList
        .filter(o => o.status === 'delivered' || o.status === 'completed')
        .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

      // Process users
      const userList = Array.isArray(users) ? users : users?.users || [];

      setStats({
        totalProducts: productList.length,
        totalOrders: orderList.length,
        totalUsers: userList.length,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders,
        lowStockProducts: lowStock
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <HiOutlineCube size={32} />,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      trend: null
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <HiOutlineShoppingCart size={32} />,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      trend: null
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: <HiOutlineCurrencyDollar size={32} />,
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.1)',
      trend: null
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <HiOutlineUsers size={32} />,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      trend: null
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <HiOutlineClipboardDocumentCheck size={32} />,
      color: '#F97316',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      alert: stats.pendingOrders > 0
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts,
      icon: <HiOutlineExclamationTriangle size={32} />,
      color: '#DC2626',
      bgColor: 'rgba(220, 38, 38, 0.1)',
      alert: stats.lowStockProducts > 0
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-overview">
        <h1 className="dashboard-title">Dashboard Overview</h1>
        <div className="loading-state">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      <h1 className="dashboard-title">Dashboard Overview</h1>
      
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className={`stat-card ${card.alert ? 'alert' : ''}`}
            style={{ borderLeftColor: card.color }}
          >
            <div className="stat-icon" style={{ backgroundColor: card.bgColor, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-content">
              <h3 className="stat-title">{card.title}</h3>
              <p className="stat-value">{card.value}</p>
              {card.subtext && <span className="stat-subtext">{card.subtext}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;