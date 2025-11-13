import React from "react";
import Header from "../components/Header";
import ProductCard from "../components/Productcard";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import "../Styles/CheckoutPage.css";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CheckoutPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

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
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  return (
    <>
      <Header />
      <div className="background">
        <div className="checkout-page">
          <div className="modes">
            <p className="section-title active">1. MY BAG</p>
            <p className="line"></p>
            <p className="section-title">2. DELIVERY</p>
            <p className="line"></p>
            <p className="section-title">3. REVIEW & PAYMENT</p>
          </div>
          <div className="checkout">
            {/* Left - Cart Items */}
            <div>
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <p>Your cart is empty</p>
                  <button className="back-btn" onClick={() => navigate('/products')}>
                    CONTINUE SHOPPING
                  </button>
                </div>
              ) : (
                <>
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
                  <div className="subtotal">
                    <p>Subtotal</p>
                    <p>₹{subtotal}</p>
                  </div>
                  <button className="back-btn" onClick={() => navigate('/products')}>
                    BACK TO PURCHASE
                  </button>
                </>
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
                <div className="summary-row">
                  <p>Delivery</p>
                  <p>₹{deliveryFee}</p>
                </div>
                <div className="summary-row total">
                  <p>Total</p>
                  <p>
                    <strong>₹{total}</strong>
                  </p>
                </div>
                <div className="shipping-info">
                  <p>Estimated shipping time: 2 days</p>
                </div>
                <button 
                  className="checkout-btn"
                  disabled={cartItems.length === 0}
                >
                  CHECK OUT
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

        <div className="products">
          <div className="products-heading">
            <h1>
              <span>Our</span> Best Seller
            </h1>
          </div>
          <ProductCard />
        </div>
      </div>
      <Newsletter />
      <Footer />
    </>
  );
};

export default CheckoutPage;
