import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/components/CartPopup.css";
import { useCart } from "../context/CartContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CartPopup = ({ onClose }) => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://placehold.co/80x80/e2e8f0/1e293b?text=Product';
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

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

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  const subtotal = getCartTotal();

  console.log('=== CART POPUP ===');
  console.log('Cart items:', cartItems);
  cartItems.forEach((item, index) => {
    console.log(`Item ${index}:`, {
      name: item.name,
      price: item.price,
      priceType: typeof item.price,
      image: item.image,
      variation: item.variation,
      quantity: item.quantity
    });
  });
  console.log('Subtotal:', subtotal);

  return (
    <div className="cart-popup">
      <h2 className="cart-title">Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</h2>

      {cartItems.length === 0 ? (
        <div className="empty-cart-popup">
          <p>Your cart is empty</p>
          <button className="continue-shopping-btn" onClick={onClose}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.uniqueKey}>
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/80x80/e2e8f0/1e293b?text=Product';
                  }}
                />
                <div className="item-details">
                  <p className="item-title">{item.name || 'Unknown Product'}</p>
                  <p className="item-weight">
                    {item.variation?.weight || 0}{item.variation?.weightUnit || 'g'}
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

          <div className="summary">
            <div className="summary-row total">
              <p>Subtotal</p>
              <strong style={{ fontFamily: "Montserrat", fontSize: "20px" }}>
                ₹{subtotal.toFixed(2)}
              </strong>
            </div>
          </div>

          <button className="purchase-btn" onClick={handleCheckout}>
            PURCHASE
          </button>
        </>
      )}
    </div>
  );
};

export default CartPopup;
