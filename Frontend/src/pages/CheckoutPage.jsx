import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Header from "../components/Header";
import ProductCard from "../components/Productcard";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import CookingLoader from "../components/CookingLoader";
import "../Styles/CheckoutPage.css";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api, { guestService } from "../services";
import { getAllPublicProducts } from '../services/publicindex';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CheckoutPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [shippingFee, setShippingFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [showBestSellersArrows, setShowBestSellersArrows] = useState(false);
  const bestSellersSliderRef = useRef(null);
  
  // Guest checkout state
  const [isGuest, setIsGuest] = useState(!user);
  const [guestDetails, setGuestDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India'
  });

  useEffect(() => {
    const initializePage = async () => {
      const startTime = Date.now();
      setPageLoading(true);
      
      await fetchShippingFee();
      
      if (user) {
        setIsGuest(false);
        await fetchAddresses();
      } else {
        setIsGuest(true);
      }
      
      await fetchBestSellers();
      
      // Ensure loader shows for at least 3 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsedTime);
      setTimeout(() => setPageLoading(false), remainingTime);
    };

    initializePage();
  }, [user]); // Removed cartItems dependency to prevent reload on quantity change

  useEffect(() => {
    const checkOverflow = () => {
      if (bestSellersSliderRef.current) {
        const hasOverflow = bestSellersSliderRef.current.scrollWidth > bestSellersSliderRef.current.clientWidth;
        setShowBestSellersArrows(hasOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [bestSellers]);

  const fetchShippingFee = async () => {
    // No shipping fee for prepaid orders
    setShippingFee(0);
  };

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/api/shipping-addresses');
      const addressList = response.data.shippingAddresses || [];
      setAddresses(addressList);
      
      const defaultAddr = addressList.find(addr => addr.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id);
      } else if (addressList.length > 0) {
        setSelectedAddress(addressList[0].id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchBestSellers = async () => {
    try {
      const allProductsResponse = await getAllPublicProducts({ limit: 50 });
      if (allProductsResponse.success && allProductsResponse.data?.products) {
        const productsWithReviews = allProductsResponse.data.products
          .filter(p => p.review_count > 0)
          .sort((a, b) => b.review_count - a.review_count)
          .slice(0, 10);
        
        setBestSellers(productsWithReviews.length > 0 ? productsWithReviews : allProductsResponse.data.products.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching best sellers:', error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate guest details if guest checkout
    if (isGuest) {
      if (!guestDetails.name || !guestDetails.email || !guestDetails.phone || 
          !guestDetails.address || !guestDetails.city || !guestDetails.state || 
          !guestDetails.postal_code) {
        toast.error('Please fill in all shipping details');
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestDetails.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
      
      // Validate phone format (basic validation)
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(guestDetails.phone)) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
    } else {
      // Logged in user validation
      if (!selectedAddress && addresses.length === 0) {
        toast.error('Please add a shipping address in your profile');
        navigate('/profile');
        return;
      }

      if (!selectedAddress) {
        toast.error('Please select a shipping address');
        return;
      }
    }

    setLoading(true);

    try {
      // Prepare order items
      const items = cartItems.map(item => ({
        product_id: item.id,
        variation_id: item.variation?.id || null,
        quantity: item.quantity
      }));

      console.log('Order items being sent:', items);

      // Calculate order total for payment
      const orderTotal = subtotal + deliveryFee;

      // Show payment gateway message for both guest and logged-in users
      toast.info('Payment gateway integration in progress. Order will be created after successful payment.');
      setLoading(false);
      return;

      // TODO: Uncomment below when Razorpay is configured
      /*
      // Create Razorpay payment first
      const paymentResponse = await api.post('/api/payments/create-razorpay-order', {
        amount: orderTotal,
        items: items,
        shipping_address_id: selectedAddress
      });

      const { razorpay_order_id, amount, currency, key_id } = paymentResponse.data;

      // Razorpay options
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'Nishree',
        description: 'Order Payment',
        order_id: razorpay_order_id,
        handler: async function (response) {
          try {
            // Verify payment and CREATE order only after successful payment
            const verifyResponse = await api.post('/api/payments/verify-razorpay-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: orderTotal,
              items: items,
              shipping_address_id: selectedAddress
            });

            if (verifyResponse.data.success) {
              clearCart();
              toast.success('Order placed successfully!');
              navigate(`/order-success/${verifyResponse.data.order.id}`);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
            console.error('Payment verification error:', error);
          }
        },
        prefill: {
          name: user.username,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#dc2626'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
      */

    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error(error.response?.data?.message || 'Failed to process checkout');
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/100x100/e2e8f0/1e293b?text=Product';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const handleQuantityChange = (uniqueKey, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(uniqueKey, newQuantity);
    }
  };

  const handleRemove = (uniqueKey) => {
    removeFromCart(uniqueKey);
  };

  const subtotal = getCartTotal();
  const deliveryFee = shippingFee;
  const total = subtotal + deliveryFee;

  if (pageLoading) {
    return <CookingLoader />;
  }

  return (
    <>
      <Header />
      <div className="background">
        <div className="checkout-page">
          <div className="checkout">
            {/* Left - Cart Items & Address Selection */}
            <div className="checkout-left-section">
              <h2 className="checkout-section-title">My Bag</h2>
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <p>Your cart is empty</p>
                  <button className="back-btn" onClick={() => navigate('/products')}>
                    CONTINUE SHOPPING
                  </button>
                </div>
              ) : (
                <>
                  <div className="cart-items-container">
                    {cartItems.map((item) => (
                    <div className="cart-item" key={item.uniqueKey}>
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="cart-item-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/100x100/e2e8f0/1e293b?text=Product';
                        }}
                      />
                      <div className="cart-item-details">
                        <p className="item-title">{item.name}</p>
                        <p className="item-weight">
                          {item.variation?.weight}{item.variation?.weightUnit}
                        </p>
                        <button 
                          className="remove-btn"
                          onClick={() => handleRemove(item.uniqueKey)}
                        >
                          REMOVE
                        </button>
                      </div>
                      <div>
                        <div className="cart-item-quantity">
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.uniqueKey, item.quantity - 1)}
                          >
                            −
                          </button>
                          <div className="quantity-value">{item.quantity}</div>
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.uniqueKey, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="cart-item-price">
                          ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                  <div className="subtotal">
                    <p>Subtotal</p>
                    <p>₹{subtotal}</p>
                  </div>
                  <button className="back-btn" onClick={() => navigate('/products')}>
                    BACK TO PURCHASE
                  </button>
                </>
              )}

              {/* Shipping Address Section */}
              {cartItems.length > 0 && (
                <div className="shipping-address-section">
                  <h2 className="checkout-section-title">Shipping Address</h2>
                  {!isGuest ? (
                    <>
                      {addresses.length > 0 ? (
                        <div className="address-list">
                          {addresses.map(address => (
                            <div 
                              key={address.id} 
                              className={`address-card ${selectedAddress === address.id ? 'selected' : ''}`}
                              onClick={() => setSelectedAddress(address.id)}
                            >
                              <input 
                                type="radio" 
                                name="address" 
                                checked={selectedAddress === address.id}
                                onChange={() => setSelectedAddress(address.id)}
                              />
                              <div className="address-details">
                                <h4>Shipping Address</h4>
                                <p>{address.address}</p>
                                <p>{address.city}, {address.state} - {address.postal_code}</p>
                                <p>{address.country}</p>
                                <p>Phone: {address.phone_number}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-address">
                          <p>No shipping address found. Please add one to continue.</p>
                        </div>
                      )}
                      
                      <button 
                        className="add-address-btn"
                        onClick={() => navigate('/profile')}
                      >
                        + Add New Address
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="guest-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Full Name *</label>
                            <input
                              type="text"
                              value={guestDetails.name}
                              onChange={(e) => setGuestDetails({...guestDetails, name: e.target.value})}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Email *</label>
                            <input
                              type="email"
                              value={guestDetails.email}
                              onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                              placeholder="Enter your email"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Phone Number *</label>
                          <input
                            type="tel"
                            value={guestDetails.phone}
                            onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                            placeholder="Enter 10-digit phone number"
                            maxLength="10"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Address *</label>
                          <input
                            type="text"
                            value={guestDetails.address}
                            onChange={(e) => setGuestDetails({...guestDetails, address: e.target.value})}
                            placeholder="Street address, apartment, suite, etc."
                            required
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>City *</label>
                            <input
                              type="text"
                              value={guestDetails.city}
                              onChange={(e) => setGuestDetails({...guestDetails, city: e.target.value})}
                              placeholder="City"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>State *</label>
                            <input
                              type="text"
                              value={guestDetails.state}
                              onChange={(e) => setGuestDetails({...guestDetails, state: e.target.value})}
                              placeholder="State"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Postal Code *</label>
                            <input
                              type="text"
                              value={guestDetails.postal_code}
                              onChange={(e) => setGuestDetails({...guestDetails, postal_code: e.target.value})}
                              placeholder="Postal Code"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Country *</label>
                            <input
                              type="text"
                              value={guestDetails.country}
                              onChange={(e) => setGuestDetails({...guestDetails, country: e.target.value})}
                              placeholder="Country"
                              required
                            />
                          </div>
                        </div>
                        <div className="guest-login-prompt">
                          <p>Already have an account? <button onClick={() => navigate('/login')} className="login-link">Login here</button></p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right - Order Summary */}
            <div className="order-summary">
              <div className="summary-box">
                <div className="summary-title">Order summary</div>
                <div className="summary-row">
                  <p>Subtotal</p>
                  <p>₹{subtotal}</p>
                </div>

                <div className="summary-row total">
                  <p>Total</p>
                  <p>
                    <strong>₹{total}</strong>
                  </p>
                </div>
                <div className="shipping-info">
                  <p>
                    Payment: Prepaid (Online Payment Only)
                  </p>
                </div>
                <button 
                  className="checkout-btn"
                  disabled={cartItems.length === 0 || loading}
                  onClick={handleCheckout}
                >
                  {loading ? 'PROCESSING...' : 'CHECK OUT'}
                </button>
              </div>
              <div className="payment-types">
                <div className="payment-title">Payment type</div>
                <div className="payment-icons">
                  <img
                    src="https://img.icons8.com/color/48/000000/visa.png"
                    alt="Visa"
                  />
                  <img
                    src="https://img.icons8.com/color/48/000000/mastercard.png"
                    alt="MasterCard"
                  />
                  <img
                    src="https://img.icons8.com/color/48/000000/amex.png"
                    alt="Amex"
                  />
                  <img
                    src="https://img.icons8.com/color/48/000000/paytm.png"
                    alt="UPI"
                  />
                </div>
              </div>

              <div className="delivery-info">
                <div className="delivery-title">Delivery and retour</div>
                <ul className="delivery-list">
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="#282828"
                      stroke="#282828"
                      strokeWidth="2"
                      className="bi bi-chevron-right"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
                      />
                    </svg>{" "}
                    Order before 12:00 and we will ship the same day.
                  </li>
                  <li>
                    {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="#282828"
                      stroke="#282828"
                      strokeWidth="2"
                      className="bi bi-chevron-right"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
                      />
                    </svg>
                    Orders made after Friday 12:00 are processed on Monday.
                  </li>
                  <li>
                    {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="#282828"
                      stroke="#282828"
                      strokeWidth="2"
                      className="bi bi-chevron-right"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
                      />
                    </svg>
                    To return your articles, please contact us first.
                  </li>
                  <li>
                    {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="#282828"
                      stroke="#282828"
                      strokeWidth="2"
                      className="bi bi-chevron-right"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
                      />
                    </svg>{" "}
                    Postal charges for return are not reimbursed.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {bestSellers.length > 0 && (
          <div className="products">
            <div className="products-heading">
              <h1>
                <span>Our</span> Best Seller
              </h1>
            </div>
            <div className="product-slider-wrapper">
              {showBestSellersArrows && (
                <button 
                  className="slider-arrow slider-arrow-left" 
                  onClick={() => {
                    if (bestSellersSliderRef.current) {
                      bestSellersSliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                    }
                  }}
                >
                  <FaChevronLeft />
                </button>
              )}
              <div className="product-slider" ref={bestSellersSliderRef}>
                {bestSellers.map((product) => (
                  <div key={product.id} className="product-slider-item">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {showBestSellersArrows && (
                <button 
                  className="slider-arrow slider-arrow-right" 
                  onClick={() => {
                    if (bestSellersSliderRef.current) {
                      bestSellersSliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                    }
                  }}
                >
                  <FaChevronRight />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <Newsletter />
      <Footer />
    </>
  );
};

export default CheckoutPage;
