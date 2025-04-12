import React, { useState } from "react";
import logo from "../assets/RTHSRT.png";
import "../Styles/components/Header.css";
import { NavLink, useLocation } from 'react-router-dom';
import CartPopup from "./CartPopup";

const Header = () => {
  const location = useLocation();
  const isActive = location.pathname.startsWith('/product');

  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <>
    <div className={`overlay ${isCartOpen ? 'active' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className="header">
        <div className="back"></div>
        <div className="container">
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>
         

<div className="nav">
  <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
  <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>About us</NavLink>
  <NavLink to="/collection" className={({ isActive }) => (isActive ? 'active' : '')}>Collection</NavLink>
  <NavLink to="/product" className={isActive ? 'active' : ''}>
      Product
    </NavLink>
  <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>Contact</NavLink>
</div>

          <div className="icon">
            <div className="user">
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
                  fill-rule="evenodd"
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
                class="bi bi-cart2"
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
