import React from 'react';
import Header from "../components/Header";
import ProductCard from "../components/Productcard";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import product from "../assets/4 (1) 2.png";
import '../Styles/CheckoutPage.css'; // Import external CSS

const CheckoutPage = () => {
    const cartItems = [
        {
          id: 1,
          name: "Signature Garam Masala",
          size: "100 gm",
          price: 250,
          quantity: 1,
          image: product,
        },
        {
          id: 2,
          name: "Signature Garam Masala",
          size: "100 gm",
          price: 250,
          quantity: 1,
          image: product,
        },
        {
          id: 3,
          name: "Signature Garam Masala",
          size: "100 gm",
          price: 250,
          quantity: 1,
          image: product,
        },
      ];
    
      const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    

  return (
    <>
    <Header />
    <div className="background">
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Left - Cart Items */}
        <div>
          <h3 className="section-title">1. MY BAG</h3>
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-size">{item.size}</div>
                <button className="remove-btn">REMOVE</button>
              </div>
              <div className="cart-item-quantity">
                <button className="quantity-btn">−</button>
                <div className="quantity-value">{item.quantity}</div>
                <button className="quantity-btn">+</button>
              </div>
              <div className="cart-item-price">₹{item.price}</div>
            </div>
          ))}
          <div className="subtotal">Subtotal ₹{total}</div>
          <button className="back-btn">BACK TO PURCHASE</button>
        </div>

        {/* Right - Order Summary */}
        <div className="order-summary">
          <h3 className="section-title">2. DELIVERY</h3>
          <div className="summary-box">
            <div className="summary-title">Order summary</div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>₹250</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <div className="shipping-info">Estimated shipping time: 2 days</div>
            <button className="checkout-btn">CHECK OUT</button>
          </div>

          <div className="payment-types">
            <div className="payment-title">Payment type</div>
            <div className="payment-icons">
              <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" />
              <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="MasterCard" />
              <img src="https://img.icons8.com/color/48/000000/amex.png" alt="Amex" />
              <img src="https://img.icons8.com/color/48/000000/paytm.png" alt="UPI" />
            </div>
          </div>

          <div className="delivery-info">
            <div className="delivery-title">Delivery and retour</div>
            <ul className="delivery-list">
              <li>Order before 12:00 and we will ship the same day.</li>
              <li>Orders made after Friday 12:00 are processed on Monday.</li>
              <li>To return your articles, please contact us first.</li>
              <li>Postal charges for return are not reimbursed.</li>
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
