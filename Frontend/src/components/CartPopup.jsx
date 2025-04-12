import React from 'react';
import '../Styles/components/CartPopup.css';

const CartPopup = ({ onClose }) => {
  return (
    <div className="cart-popup">
      <h2>Cart</h2>
      <div className="cart-item">
        <img src="/path-to-image.jpg" alt="product" />
        <div>
          <p>Signature Garam Masala</p>
          <small>100 gm</small>
          <p>₹250</p>
        </div>
        <div className="qty">
          <button>-</button>
          <span>1</span>
          <button>+</button>
        </div>
      </div>

      <div className="summary">
        <div><span>Subtotal</span><span>₹250</span></div>
        <div><span>Delivery</span><span>₹0</span></div>
        <div className="total"><strong>Total</strong><strong>₹250</strong></div>
      </div>

      <button className="purchase-btn">PURCHASE</button>
    </div>
  );
};

export default CartPopup;
