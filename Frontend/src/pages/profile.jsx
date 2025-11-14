import { useState, useEffect } from 'react';
import { Helmet } from "react-helmet-async";
import { FaUser, FaEdit, FaBox, FaMapMarkerAlt, FaSignOutAlt, FaTrash, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Header from "../components/Header";
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { orderService, shippingAddressService } from '../services';
import "../Styles/Profile.css";
import "../Styles/common/Form.css";
import { useSEO } from "../hooks/useSEO";

const ProfilePage = () => {
  const { seoData } = useSEO('account');
  const [activeTab, setActiveTab] = useState('profile');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [modalImagePreview, setModalImagePreview] = useState(null);
  
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log('User data updated:', user);
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      // Set profile image if exists
      if (user.profileImageUrl) {
        // Add timestamp to prevent caching
        const imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profileImageUrl}?t=${Date.now()}`;
        console.log('Setting profile image:', imageUrl);
        setImagePreview(imageUrl);
      } else {
        console.log('No profile image URL found');
        setImagePreview(null);
      }
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setModalImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'address') {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getMyOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const addresses = await shippingAddressService.getUserShippingAddresses();
      setAddresses(addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create FormData if there's an image
      let dataToSend;
      if (profileImage) {
        dataToSend = new FormData();
        dataToSend.append('username', profileData.username);
        dataToSend.append('email', profileData.email);
        dataToSend.append('phone', profileData.phone);
        dataToSend.append('profilePic', profileImage); // Backend expects 'profilePic'
      } else {
        dataToSend = profileData;
      }
      
      console.log('Updating profile...');
      await updateProfile(dataToSend);
      
      toast.success('Profile updated successfully');
      setShowEditModal(false);
      setProfileImage(null);
      setModalImagePreview(null);
      
      // The AuthContext will automatically refresh the user data
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const rawData = Object.fromEntries(formData);
      
      // Map frontend field names to backend field names
      const addressData = {
        address: rawData.address,
        city: rawData.city,
        state: rawData.state,
        postal_code: rawData.pincode,
        country: rawData.country || 'India', // Default to India if not provided
        phone_number: rawData.phone,
        is_default: rawData.is_default === 'true' || false
      };
      
      if (editingAddress) {
        await shippingAddressService.updateShippingAddress(editingAddress.id, addressData);
        toast.success('Address updated successfully');
      } else {
        await shippingAddressService.createShippingAddress(addressData);
        toast.success('Address added successfully');
      }
      
      setShowModal(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    setLoading(true);
    try {
      await shippingAddressService.deleteShippingAddress(addressId);
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error(error.message || 'Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{seoData?.meta_title || 'My Account - Nishree'}</title>
        <meta name="description" content={seoData?.meta_description || 'Manage your account, orders, and addresses.'} />
        {seoData?.meta_keywords && <meta name="keywords" content={seoData.meta_keywords} />}
        {seoData?.canonical_url && <link rel="canonical" href={seoData.canonical_url} />}
      </Helmet>
      <Header />
      <div className="background section">
        <div className="profile-page">
          <div className="profile-container">
            {/* Sidebar */}
            <div className="profile-sidebar">
              <div className="profile-user-card">
                <div className="user-avatar">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" />
                  ) : (
                    <FaUser size={50} />
                  )}
                </div>
                <h3>{user?.username || 'User'}</h3>
                <p className="user-email">{user?.email}</p>
              </div>

              <nav className="profile-nav">
                <button 
                  className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}>
                  <FaUser /> <span>Profile Information</span>
                </button>
                <button 
                  className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}>
                  <FaBox /> <span>My Orders</span>
                </button>
                <button 
                  className={`profile-nav-item ${activeTab === 'address' ? 'active' : ''}`}
                  onClick={() => setActiveTab('address')}>
                  <FaMapMarkerAlt /> <span>Address Book</span>
                </button>
                <button 
                  className="profile-nav-item logout"
                  onClick={handleLogout}>
                  <FaSignOutAlt /> <span>Logout</span>
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="profile-content">
              {activeTab === 'profile' && (
                <div className="content-card">
                  <div className="card-header">
                    <h2>Profile Information</h2>
                    <button className="btn-edit" onClick={() => setShowEditModal(true)}>
                      <FaEdit /> Edit Profile
                    </button>
                  </div>
                  <div className="profile-details">
                    <div className="detail-row">
                      <span className="detail-label">Full Name:</span>
                      <span className="detail-value">{user?.username}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email Address:</span>
                      <span className="detail-value">{user?.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phone Number:</span>
                      <span className="detail-value">{user?.phone || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Member Since:</span>
                      <span className="detail-value">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="content-card">
                  <div className="card-header">
                    <h2>My Orders</h2>
                  </div>
                  {loading ? (
                    <div className="loading-state">
                      <Loader size="medium" />
                      <p>Loading orders...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="orders-list-minimal">
                      {orders.map(order => (
                        <div key={order.id} className="order-card-minimal">
                          <div className="order-minimal-header">
                            <div>
                              <h4>Order #{order.order_number || order.id}</h4>
                              <p className="order-date-minimal">
                                {new Date(order.createdAt).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <span className={`status-badge ${order.payment_status?.toLowerCase()}`}>
                              {order.payment_status}
                            </span>
                          </div>
                          <div className="order-minimal-body">
                            <div className="order-info-row">
                              <span>Total Amount:</span>
                              <strong>₹{parseFloat(order.final_amount || 0).toFixed(2)}</strong>
                            </div>
                            <div className="order-info-row">
                              <span>Items:</span>
                              <span>{order.OrderItems?.length || 0} item(s)</span>
                            </div>
                            <div className="order-info-row">
                              <span>Status:</span>
                              <span className={`order-status-text ${order.status?.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <button 
                            className="btn-view-details"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FaBox size={60} color="#9CA3AF" />
                      <h3>No Orders Yet</h3>
                      <p>Start shopping to see your orders here</p>
                      <button className="btn-red" onClick={() => navigate('/products')}>
                        Browse Products
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'address' && (
                <div className="content-card">
                  <div className="card-header">
                    <h2>Address Book</h2>
                    <button className="btn-add" onClick={() => {
                      setEditingAddress(null);
                      setShowModal(true);
                    }}>
                      <FaPlus /> Add New Address
                    </button>
                  </div>
                  {loading ? (
                    <div className="loading-state">
                      <Loader size="medium" />
                      <p>Loading addresses...</p>
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="address-grid">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="address-card">
                          <div className="address-header">
                            <h4>
                              {addr.is_default && <span className="default-badge">★ Default</span>}
                              {!addr.is_default && 'Address'}
                            </h4>
                            <div className="address-actions">
                              <button className="icon-btn" onClick={() => {
                                setEditingAddress(addr);
                                setShowModal(true);
                              }}>
                                <FaEdit />
                              </button>
                              <button className="icon-btn delete" onClick={() => handleDeleteAddress(addr.id)}>
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          <div className="address-body">
                            <p>{addr.address}</p>
                            <p>{addr.city}, {addr.state} - {addr.postal_code}</p>
                            <p>{addr.country}</p>
                            <p className="phone">Phone: {addr.phone_number}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FaMapMarkerAlt size={60} color="#9CA3AF" />
                      <h3>No Addresses Saved</h3>
                      <p>Add an address for faster checkout</p>
                      <button className="btn-red" onClick={() => setShowModal(true)}>
                        Add Address
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile">
        <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label className="form-label">Profile Picture</label>
                <div className="image-upload-container">
                  <div className="image-preview-large">
                    {modalImagePreview || imagePreview ? (
                      <img src={modalImagePreview || imagePreview} alt="Profile Preview" />
                    ) : (
                      <FaUser size={60} color="#ffffff" />
                    )}
                  </div>
                  <div className="image-upload-actions">
                    <label htmlFor="profile-image-upload" className="btn-upload">
                      <FaEdit /> Choose Image
                      <input
                        type="file"
                        id="profile-image-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {(modalImagePreview || profileImage) && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => {
                          setProfileImage(null);
                          setModalImagePreview(null);
                        }}
                      >
                        <FaTrash /> Remove
                      </button>
                    )}
                    <p className="image-hint">Max size: 5MB. Formats: JPG, PNG, GIF</p>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.username}
                  onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                />
              </div>
          <div className="modal-actions">
            <Button type="submit" className="btn-red" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" className="btn-outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }}
        title={`Order #${selectedOrder?.order_number || selectedOrder?.id}`}
      >
        {selectedOrder && (
          <div className="order-modal-content">
            <div className="order-modal-header">
              <div className="order-modal-info">
                <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p><strong>Payment Status:</strong> <span className={`payment-status ${selectedOrder.payment_status?.toLowerCase()}`}>{selectedOrder.payment_status}</span></p>
                <p><strong>Order Status:</strong> <span className={`order-status ${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</span></p>
              </div>
            </div>

            <div className="order-modal-products">
              <h3>Order Items</h3>
              {selectedOrder.OrderItems && selectedOrder.OrderItems.length > 0 ? (
                <div className="order-products-list">
                  {selectedOrder.OrderItems.map((item, index) => {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    let imageUrl = 'https://placehold.co/120x120/e2e8f0/1e293b?text=Product';
                    
                    if (item.Product?.ProductImages?.[0]?.image_url) {
                      const imgPath = item.Product.ProductImages[0].image_url;
                      imageUrl = imgPath.startsWith('http') ? imgPath : `${API_URL}/${imgPath.replace(/^\//, '')}`;
                    }
                    
                    return (
                      <div key={index} className="order-product-item">
                        <div className="product-image-container">
                          <img 
                            src={imageUrl}
                            alt={item.Product?.name || 'Product'}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/120x120/e2e8f0/1e293b?text=Product';
                            }}
                          />
                        </div>
                        <div className="product-details-modal">
                          <h4>{item.Product?.name || 'Product'}</h4>
                          <p className="product-quantity">Quantity: {item.quantity}</p>
                          <p className="product-price">₹{parseFloat(item.price || 0).toFixed(2)} each</p>
                          <p className="product-subtotal">₹{parseFloat(item.subtotal || (item.price * item.quantity) || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No items found</p>
              )}
            </div>

            <div className="order-modal-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping Fee:</span>
                <span>₹{parseFloat(selectedOrder.shipping_fee || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row total-row">
                <strong>Total:</strong>
                <strong>₹{parseFloat(selectedOrder.final_amount || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Address Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          setEditingAddress(null);
        }} 
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleAddAddress}>
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone Number *</label>
                    <input type="tel" name="phone" id="phone" className="form-control" defaultValue={editingAddress?.phone_number} required />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="pincode">Pin Code *</label>
                    <input type="text" name="pincode" id="pincode" className="form-control" defaultValue={editingAddress?.postal_code} required />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="city">City *</label>
                    <input type="text" name="city" id="city" className="form-control" defaultValue={editingAddress?.city} required />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="state">State *</label>
                    <input type="text" name="state" id="state" className="form-control" defaultValue={editingAddress?.state} required />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="address">Address *</label>
                    <textarea name="address" id="address" className="form-control" rows="3" defaultValue={editingAddress?.address} required></textarea>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="country">Country *</label>
                    <input type="text" name="country" id="country" className="form-control" defaultValue={editingAddress?.country || 'India'} required />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="is_default">Set as Default</label>
                    <select name="is_default" id="is_default" className="form-control" defaultValue={editingAddress?.is_default ? 'true' : 'false'}>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

          <div className="modal-actions">
            <Button type="submit" className="btn-red" disabled={loading}>
              {loading ? 'Saving...' : 'Save Address'}
            </Button>
            <Button type="button" className="btn-outline" onClick={() => {
              setShowModal(false);
              setEditingAddress(null);
            }}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </>
  );
};

export default ProfilePage;
