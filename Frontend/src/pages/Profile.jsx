import React, { useState } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaEdit, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import '../Styles/Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY 10001',
    avatar: 'https://i.pravatar.cc/300',
  });

  const [orders] = useState([
    {
      id: 'ORD001',
      date: '2024-03-15',
      status: 'delivered',
      items: ['Product 1', 'Product 2'],
      total: '$299.99'
    },
    {
      id: 'ORD002',
      date: '2024-03-10',
      status: 'processing',
      items: ['Product 3'],
      total: '$149.99'
    }
  ]);

  const [addresses] = useState([
    {
      id: 1,
      type: 'Home',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      isDefault: true
    },
    {
      id: 2,
      type: 'Office',
      address: '456 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      isDefault: false
    }
  ]);

  const renderProfileInfo = () => (
    <div className="info-grid">
      <div className="info-card">
        <div className="info-label">Email</div>
        <div className="info-value">
          <FaEnvelope /> {userData.email}
        </div>
      </div>
      <div className="info-card">
        <div className="info-label">Phone</div>
        <div className="info-value">
          <FaPhone /> {userData.phone}
        </div>
      </div>
      <div className="info-card">
        <div className="info-label">Address</div>
        <div className="info-value">
          <FaMapMarkerAlt /> {userData.address}
        </div>
      </div>
    </div>
  );

  const renderEditProfile = () => (
    <form className="edit-profile-form">
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input
          type="text"
          className="form-input"
          value={userData.name}
          onChange={() => {}}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          value={userData.email}
          onChange={() => {}}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Phone</label>
        <input
          type="tel"
          className="form-input"
          value={userData.phone}
          onChange={() => {}}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Address</label>
        <textarea
          className="form-input"
          value={userData.address}
          onChange={() => {}}
          rows="3"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Save Changes
      </button>
    </form>
  );

  const renderOrders = () => (
    <div className="orders-list">
      {orders.map(order => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <span className="order-number">{order.id}</span>
            <span className="order-date">{order.date}</span>
          </div>
          <div className="order-items">
            {order.items.join(', ')}
          </div>
          <div className="order-footer">
            <span className={`order-status status-${order.status}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <span className="order-total">{order.total}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAddresses = () => (
    <div className="address-section">
      <button className="btn btn-primary" style={{ marginBottom: '1rem' }}>
        Add New Address
      </button>
      <div className="address-grid">
        {addresses.map(address => (
          <div key={address.id} className="address-card">
            <div className="address-type">{address.type}</div>
            <div className="address-details">
              <p>{address.address}</p>
              <p>{address.city}, {address.state} {address.zipCode}</p>
            </div>
            <div className="address-actions">
              <button className="btn btn-outline">Edit</button>
              <button className="btn btn-outline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileInfo();
      case 'edit':
        return renderEditProfile();
      case 'orders':
        return renderOrders();
      case 'addresses':
        return renderAddresses();
      default:
        return renderProfileInfo();
    }
  };

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-wrapper">
          <div className="profile-header">
            <img src={userData.avatar} alt="Profile" className="profile-avatar" />
            <h1 className="profile-name">{userData.name}</h1>
            <p className="profile-email">{userData.email}</p>
          </div>

          <div className="profile-tabs">
            <div
              className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </div>
            <div
              className={`profile-tab ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              Edit Profile
            </div>
            <div
              className={`profile-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </div>
            <div
              className={`profile-tab ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              Addresses
            </div>
          </div>

          <div className="profile-content">
            {renderContent()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile; 