import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import { orderService } from '../../../services';
import '../../../Styles/dashboard/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatuses] = useState([
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
  ]);

  const columns = [
    { header: 'Order ID', accessor: 'id' },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Date', accessor: 'orderDate' },
    { header: 'Total', accessor: 'total' },
    { header: 'Status', accessor: 'status' },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="action-buttons">
          <ActionButton
            onClick={() => handleViewDetails(row)}
            variant="view"
          >
            View
          </ActionButton>
          <ActionButton
            onClick={() => handleUpdateStatus(row)}
            variant="edit"
          >
            Update Status
          </ActionButton>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (order) => {
    const newStatus = window.prompt('Enter new status:', order.status);
    if (newStatus && orderStatuses.includes(newStatus)) {
      try {
        await orderService.updateOrderStatus(order.id, { status: newStatus });
        fetchOrders();
      } catch (error) {
        console.error('Error updating order status:', error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="orders-container">
      <div className="header-section">
        <h2 className="dashboard-title">Order Management</h2>
        <Button 
          className="add-button"
          onClick={fetchOrders}
        >
          Refresh Orders
        </Button>
      </div>

      <TableWithControls
        data={orders}
        columns={columns}
        searchPlaceholder="Search orders..."
        searchFields={['id', 'customerName', 'status']}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: orderStatuses.map(status => ({
              value: status,
              label: status
            }))
          }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="modal-content">
            <div className="grid-container">
              <div className="info-section">
                <h3>Order Information</h3>
                <p>Order ID: {selectedOrder.id}</p>
                <p>Date: {formatDate(selectedOrder.orderDate)}</p>
                <p>Status: {selectedOrder.status}</p>
                <p>Total: {formatCurrency(selectedOrder.total)}</p>
              </div>
              <div className="info-section">
                <h3>Customer Information</h3>
                <p>Name: {selectedOrder.customerName}</p>
                <p>Email: {selectedOrder.customerEmail}</p>
                <p>Phone: {selectedOrder.customerPhone}</p>
              </div>
            </div>
            
            <div>
              <h3>Order Items</h3>
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">{formatCurrency(item.price)}</td>
                      <td className="text-right">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3>Shipping Address</h3>
              <p>{selectedOrder.shippingAddress?.street}</p>
              <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
              <p>{selectedOrder.shippingAddress?.zipCode}</p>
              <p>{selectedOrder.shippingAddress?.country}</p>
            </div>

            <div className="modal-footer">
              <ActionButton
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
              >
                Close
              </ActionButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;