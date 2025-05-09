import React, { useState } from 'react';
import { FaUser, FaEdit, FaBox, FaMapMarkerAlt } from 'react-icons/fa';
import Header from "../components/Header";
import Footer from '../components/Footer';
import "../Styles/Profile.css";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showModal, setShowModal] = useState(false);

  const user = {
    name: 'Jyoti',
    email: 'jyoti@gmail.com',
    phone: '+91 7493658737',
  };

  const orders = [
    {
      id: '00000',
      status: 'PENDING',
      items: [
        {
          image: 'https://bootdey.com/img/Content/avatar/avatar6.png',
          description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolorem, facilis.',
          quantity: '₹100 X 2',
          amount: '₹200',
          status: 'PENDING'
        }
      ],
      totalPrice: '₹200',
      totalPaid: '₹200',
      timeline: [
        { status: 'PICKED', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque Lorem ipsum dolor', date: '21 March, 2014' },
        { status: 'PICKED', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque', date: '21 March, 2014' },
        { status: 'PICKED', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque', date: '21 March, 2014' },
        { status: 'PICKED', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque', date: '21 March, 2014' },
        { status: 'PICKED', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque', date: '21 March, 2014' }
      ]
    }
  ];

  const addresses = [
    {
      name: 'Home',
      address: '123, Green Street, New York, USA',
      phone: '+91 7493658737'
    },
    {
      name: 'Office',
      address: '456, Blue Avenue, Los Angeles, USA',
      phone: '+91 7493658737'
    }
  ];

  const handleAddAddress = (e) => {
    e.preventDefault();
    // Handle address addition logic here
    setShowModal(false);
  };

  return (
    <div className="profile-container">
      <Header />
      <div className="main-body">
        <div className="profile-cards">
          <div className="profile-card-left">
            <div className="profile-card">
              <div className="card-body">
                <div className="profile-header">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtbEsykx-0fhTred6UwHDYtMFd2UgTJCG4gaklT1dx4suRO4_n5LJr4Gg28kquSX5fpNo&usqp=CAU" 
                       alt="Admin" 
                       className="profile-image" />
                  <h4 className="profile-name">{user.name}</h4>
                </div>
                <div className="profile-nav">
                  <button 
                    className={`nav-item profile ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}>
                    <FaUser /> Profile Information
                  </button>
                  <button 
                    className={`nav-item profile ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}>
                    <FaBox /> Orders
                  </button>
                  <button 
                    className={`nav-item profile ${activeTab === 'address' ? 'active' : ''}`}
                    onClick={() => setActiveTab('address')}>
                    <FaMapMarkerAlt /> Address Book
                  </button>
                  <button className="nav-item profile">Logout</button>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card-right">
            {activeTab === 'profile' && (
              <div className="profile-card">
                <div className="card-body">
                  <div className="profile-info">
                    <h5>Profile Information</h5>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email Address:</strong> {user.email}</p>
                    <p><strong>Contact:</strong> {user.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="order-card">
                {orders.map(order => (
                  <div key={order.id}>
                    <div className="card">
                      <div className="card-body">
                        <div className="order-header">
                          <h5>ORDER# {order.id}</h5>
                        </div>
                        <div className="order-status">
                          {[1, 2, 3, 4, 5].map((_, index) => (
                            <div key={index} className={`status-item ${index === 0 ? 'active' : ''}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="50" height="50">
                                {/* SVG path data */}
                              </svg>
                              <span>Pending</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'address' && (
              <div className="card">
                <div className="card-body">
                  <h5>Address Book</h5>
                  <button className="add-address-btn" onClick={() => setShowModal(true)}>
                    Add Address
                  </button>
                  <div className="address-grid">
                    {addresses.map((addr, index) => (
                      <div key={index} className="address-card">
                        <div className="address-type">{addr.name}</div>
                        <div className="info-value">{addr.address}</div>
                        <div className="address-actions">
                          <button className="btn btn-outline">Edit</button>
                          <button className="btn btn-primary">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
            <h2 className="modal-title">Add Address</h2>
            <form onSubmit={handleAddAddress}>
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Name:</label>
                    <input type="text" id="name" className="form-control" required />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="mobile">Mobile No.:</label>
                    <input type="tel" id="mobile" className="form-control" required pattern="[0-9]{10}" />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="pincode">Pin code:</label>
                    <input type="text" id="pincode" className="form-control" required />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="locality">Locality:</label>
                    <input type="text" id="locality" className="form-control" required />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="city">City/District/Town:</label>
                    <input type="text" id="city" className="form-control" required />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="state">State:</label>
                    <select id="state" className="form-control" required>
                      <option value="">Select a state</option>
                      <option value="State 1">State 1</option>
                      <option value="State 2">State 2</option>
                      <option value="State 3">State 3</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="address">Address:</label>
                    <textarea id="address" className="form-control" required></textarea>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="landmark">Landmark (Optional):</label>
                    <input type="text" id="landmark" className="form-control" />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="alternatePhone">Alternate Phone (Optional):</label>
                    <input type="tel" id="alternatePhone" className="form-control" pattern="[0-9]{10}" />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfilePage;
