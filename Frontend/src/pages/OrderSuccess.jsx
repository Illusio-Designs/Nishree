import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import '../Styles/OrderSuccess.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/80x80/e2e8f0/1e293b?text=Product';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-container">
          <p>Loading order details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="order-success-container">
          <div className="success-card">
            <h1>Order Not Found</h1>
            <p>Unable to load order details.</p>
            <button className="btn-primary" onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="order-success-container">
        <div className="success-card">
          <FaCheckCircle className="success-icon" />
          <h1>Order Placed Successfully!</h1>
          <p className="order-number">Order Number: {order?.order_number}</p>
          <p className="thank-you">Thank you for your purchase!</p>
          
          <div className="order-details">
            <h3>Order Summary</h3>
            <div className="detail-row">
              <span>Subtotal:</span>
              <span>₹{Number(order?.total_amount || 0).toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span>Shipping Fee:</span>
              <span>₹{Number(order?.shipping_fee || 0).toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span>Total Amount:</span>
              <span><strong>₹{Number(order?.final_amount || 0).toFixed(2)}</strong></span>
            </div>
            <div className="detail-row">
              <span>Payment Status:</span>
              <span className="status">{order?.payment_status}</span>
            </div>
            <div className="detail-row">
              <span>Order Status:</span>
              <span className="status">{order?.status}</span>
            </div>
          </div>

          {order?.OrderItems && order.OrderItems.length > 0 && (
            <div className="order-items">
              <h3>Order Items</h3>
              {order.OrderItems.map((item, index) => (
                <div key={index} className="order-item">
                  <img
                    src={getImageUrl(item.Product?.ProductImages?.[0]?.image_url)}
                    alt={item.Product?.name || 'Product'}
                    className="order-item-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/80x80/e2e8f0/1e293b?text=Product';
                    }}
                  />
                  <div className="order-item-details">
                    <div className="order-item-name">{item.Product?.name || 'Product'}</div>
                    {item.ProductVariation && (
                      <div className="order-item-variation">
                        {item.ProductVariation.weight}{item.ProductVariation.weightUnit}
                      </div>
                    )}
                    <div className="order-item-price">
                      <span className="order-item-quantity">Qty: {item.quantity}</span> × ₹{Number(item.price || 0).toFixed(2)} = ₹{Number(item.subtotal || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="action-buttons">
            <button className="btn-primary" onClick={() => navigate('/profile')}>
              View Orders
            </button>
            <button className="btn-secondary" onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderSuccess;
