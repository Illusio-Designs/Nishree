import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../Styles/components/CartPopup.css";
import product from "../assets/4 (1) 2.webp";

const CartPopup = ({ onClose }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <div className="cart-popup">
      <h2 className="cart-title">Cart</h2>

      <div className="cart-item">
        <img src={product} alt="product" />
        <div className="item-details">
          <p className="item-title">Signature Garam Masala</p>
          <p className="item-weight">100 gm</p>
          <button className="remove-btn">REMOVE</button>
        </div>
        <div>
          <div className="cart-item-quantity">
            <button className="quantity-btn">−</button>
            <div className="quantity-value">
              1<button className="quantity-btn">+</button>
            </div>
          </div>
          <div className="cart-item-price">₹250</div>
        </div>
      </div>
      <div className="cart-item">
        <img src={product} alt="product" />
        <div className="item-details">
          <p className="item-title">Signature Garam Masala</p>
          <p className="item-weight">100 gm</p>
          <button className="remove-btn">REMOVE</button>
        </div>
        <div>
          <div className="cart-item-quantity">
            <button className="quantity-btn">−</button>
            <div className="quantity-value">
              1<button className="quantity-btn">+</button>
            </div>
          </div>
          <div className="cart-item-price">₹250</div>
        </div>
      </div>
      <div className="cart-item">
        <img src={product} alt="product" />
        <div className="item-details">
          <p className="item-title">Signature Garam Masala</p>
          <p className="item-weight">100 gm</p>
          <button className="remove-btn">REMOVE</button>
        </div>
        <div>
          <div className="cart-item-quantity">
            <button className="quantity-btn">−</button>
            <div className="quantity-value">
              1<button className="quantity-btn">+</button>
            </div>
          </div>
          <div className="cart-item-price">₹250</div>
        </div>
      </div>

      <div className="summary">
        <div className="summary-row">
          <p>Subtotal</p>
          <p style={{ fontFamily: "Montserrat" }}>₹250</p>
        </div>
        <div className="summary-row">
          <p>Delivery</p>
          <p style={{ fontFamily: "Montserrat" }}>₹250</p>
        </div>
        <div className="summary-row total">
          <p>Total</p>
          <strong style={{ fontFamily: "Montserrat", fontSize: "20px" }}>
            ₹250
          </strong>
        </div>
      </div>

      <button
        className="purchase-btn"
        onClick={() => navigate("/checkout")} // Redirect to checkout page
      >
        PURCHASE
      </button>
    </div>
  );
};

export default CartPopup;
