import React, { useState } from "react";
import logo from "../assets/RTHSRT.webp";
import "../Styles/components/Header.css";
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import CartPopup from "./CartPopup";
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FaShoppingCart, FaHeart, FaUser, FaSearch } from 'react-icons/fa';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname.startsWith('/product');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
    setIsMenuOpen(false);
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const goToLogin = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className={`overlay ${isCartOpen || isMenuOpen ? 'active' : ''}`} onClick={() => {
        setIsCartOpen(false);
        setIsMenuOpen(false);
      }}></div>
      <div className="header">
        <div className="back"></div>
        <div className="container">
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>

          <div className="burger-menu" onClick={toggleMenu}>
            <div className={`bar ${isMenuOpen ? 'active' : ''}`}></div>
            <div className={`bar ${isMenuOpen ? 'active' : ''}`}></div>
            <div className={`bar ${isMenuOpen ? 'active' : ''}`}></div>
          </div>

          <div className={`nav ${isMenuOpen ? 'active' : ''}`}>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsMenuOpen(false)}>About us</NavLink>
            <NavLink to="/collection" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsMenuOpen(false)}>Collection</NavLink>
            <NavLink to="/product" className={isActive ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
              Product
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
          </div>

          <div className="icon">
            <div className="user" onClick={goToLogin}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                className="bi bi-person-circle"
                viewBox="0 0 16 16"
              >
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                <path
                  fillRule="evenodd"
                  d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                />
              </svg>
            </div>
            <div className="cart" onClick={toggleCart}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                className="bi bi-cart2"
                viewBox="0 0 16 16"
              >
                <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l1.25 5h8.22l1.25-5zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {isCartOpen && <CartPopup onClose={() => setIsCartOpen(false)} />}
    </>
  );
};

export default Header;
