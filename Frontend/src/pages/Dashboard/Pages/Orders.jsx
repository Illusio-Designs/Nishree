import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import { orderService } from '../../../services';
import { HiOutlineEye, HiOutlinePencil } from 'react-icons/hi2';
import { FaShoppingCart, FaMoneyBillWave, FaClock, FaCheckCircle } from 'react-icons/fa';
import '../../../Styles/dashboard/Category.css';
import '../../../Styles/dashboard/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });

  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const columns = [
    { 
      key: 'order_number',
      header: 'Order #', 
      render: (row) => row.order_number || `#${row.id}`
    },
    { 
      key: 'customer',
      header: 'Customer', 
      render: (row) => {
        if (row.User?.username) return row.User.username;
        if (row.User?.email) return row.User.email;
        return 'Guest User';
      }
    },
    { 
      key: 'createdAt',
      header: 'Date', 
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN')
    },
    { 
      key: 'final_amount',
      header: 'Total', 
      render: (row) => `₹${parseFloat(row.final_amount || 0).toFixed(2)}`
    },
    { 
      key: 'payment_status',
      header: 'Payment', 
      render: (row) => (
        <span className={`status-badge payment-${row.payment_status}`}>
          {row.payment_status}
        </span>
      )
    },
    { 
      key: 'status',
      header: 'Status', 
      render: (row) => (
        <span className={`status-badge order-${row.status}`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlineEye size={20} />}
            onClick={() => handleViewDetails(row)}
            variant="view"
            tooltip="View Details"
          />
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleOpenStatusModal(row)}
            variant="edit"
            tooltip="Update Status"
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders();
      console.log('Orders response:', response);
      
      // Filter only paid orders
      const paidOrders = (response.orders || []).filter(order => order.payment_status === 'paid');
      setOrders(paidOrders);
      
      // Calculate stats
      calculateStats(paidOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData) => {
    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, order) => sum + parseFloat(order.final_amount || 0), 0);
    const pendingOrders = ordersData.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const deliveredOrders = ordersData.filter(o => o.status === 'delivered').length;

    setStats({
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders
    });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === selectedOrder.status) {
      toast.info('Please select a different status');
      return;
    }

    setLoading(true);
    try {
      await orderService.updateOrderStatus(selectedOrder.id, { status: newStatus });
      toast.success('Order status updated successfully');
      setIsStatusModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSyncOrders = async () => {
    setSyncing(true);
    try {
      const response = await orderService.syncOrdersWithShiprocket();
      toast.success(response.message || 'Orders synced successfully with Shiprocket');
      fetchOrders();
    } catch (error) {
      console.error('Error syncing orders:', error);
      toast.error(error.message || 'Failed to sync orders with Shiprocket');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="category-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Order Management</h2>
        <Button onClick={handleSyncOrders} disabled={syncing} className="add-button">
          {syncing ? 'Syncing...' : 'Sync Orders'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <FaShoppingCart size={24} color="#2563eb" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Orders</p>
            <h3 className="stat-value">{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <FaMoneyBillWave size={24} color="#059669" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Revenue</p>
            <h3 className="stat-value">{formatCurrency(stats.totalRevenue)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <FaClock size={24} color="#d97706" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending Orders</p>
            <h3 className="stat-value">{stats.pendingOrders}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>
            <FaCheckCircle size={24} color="#16a34a" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Delivered</p>
            <h3 className="stat-value">{stats.deliveredOrders}</h3>
          </div>
        </div>
      </div>

      <TableWithControls
        columns={columns}
        data={orders}
        searchFields={['order_number', 'User.username', 'status']}
        filters={[
          {
            key: 'status',
            label: 'Order Status',
            options: orderStatuses.map(status => ({
              value: status,
              label: status.charAt(0).toUpperCase() + status.slice(1)
            }))
          }
        ]}
      />

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Order ${selectedOrder?.order_number || `#${selectedOrder?.id}`}`}
      >
        {selectedOrder && (
          <div className="order-details-modal">
            {/* Order Info */}
            <div className="order-info-grid">
              <div className="info-card">
                <h4>Order Information</h4>
                <div className="info-row">
                  <span>Order Date:</span>
                  <strong>{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</strong>
                </div>
                <div className="info-row">
                  <span>Order Status:</span>
                  <span className={`status-badge order-${selectedOrder.status}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="info-row">
                  <span>Payment Status:</span>
                  <span className={`status-badge payment-${selectedOrder.payment_status}`}>
                    {selectedOrder.payment_status}
                  </span>
                </div>
                <div className="info-row">
                  <span>Payment Type:</span>
                  <strong>{selectedOrder.payment_type || 'Online'}</strong>
                </div>
              </div>

              <div className="info-card">
                <h4>Customer Information</h4>
                <div className="info-row">
                  <span>Name:</span>
                  <strong>{selectedOrder.User?.username || 'N/A'}</strong>
                </div>
                <div className="info-row">
                  <span>Email:</span>
                  <strong>{selectedOrder.User?.email || 'N/A'}</strong>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="order-items-section">
              <h4>Order Items</h4>
              {selectedOrder.OrderItems && selectedOrder.OrderItems.length > 0 ? (
                <div className="order-items-list">
                  {selectedOrder.OrderItems.map((item, index) => {
                    let imageUrl = 'https://placehold.co/80x80/e2e8f0/1e293b?text=Product';
                    if (item.Product?.ProductImages?.[0]?.image_url) {
                      const imgPath = item.Product.ProductImages[0].image_url;
                      imageUrl = imgPath.startsWith('http') ? imgPath : `${API_URL}/${imgPath.replace(/^\//, '')}`;
                    }

                    return (
                      <div key={index} className="order-item-card">
                        <img 
                          src={imageUrl}
                          alt={item.Product?.name || 'Product'}
                          className="item-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/80x80/e2e8f0/1e293b?text=Product';
                          }}
                        />
                        <div className="item-details">
                          <h5>{item.Product?.name || 'Product'}</h5>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: {formatCurrency(item.price)} each</p>
                        </div>
                        <div className="item-total">
                          <strong>{formatCurrency(item.subtotal || (item.price * item.quantity))}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No items found</p>
              )}
            </div>

            {/* Order Summary */}
            <div className="order-summary-section">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping Fee:</span>
                <span>{formatCurrency(selectedOrder.shipping_fee)}</span>
              </div>
              <div className="summary-row total">
                <strong>Total:</strong>
                <strong>{formatCurrency(selectedOrder.final_amount)}</strong>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedOrder(null);
        }}
        title="Update Order Status"
      >
        {selectedOrder && (
          <div className="status-update-modal">
            <p>Update status for Order {selectedOrder.order_number || `#${selectedOrder.id}`}</p>
            
            <div className="form-group">
              <label>Current Status: <strong>{selectedOrder.status}</strong></label>
            </div>

            <div className="form-group">
              <label>New Status:</label>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                className="form-control"
              >
                {orderStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <Button
                onClick={handleUpdateStatus}
                disabled={loading}
                variant="primary"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </Button>
              <Button
                onClick={() => setIsStatusModalOpen(false)}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
