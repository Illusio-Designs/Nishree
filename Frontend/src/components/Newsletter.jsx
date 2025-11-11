import React, { useState } from "react";
import Newsletterimg from "../Assets/Newsletter.png";
import "../Styles/components/Newsletter.css";

const Newsletter = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="newsletter-section">
      <div className="newsletter-bg">
        <img src={Newsletterimg} alt="Newsletter" className="img-fluid" />
        <div className="black-overlay"></div>
      </div>

      <div className="newsletter-content">
        <h1>
          <span>Join the</span> Nishree Family
        </h1>
        <p>
          Subscribe to our newsletter for exclusive recipes, discounts, and
          updates.
        </p>
        <form onSubmit={handleSubmit} className="newsletter-form">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-red subscribe">
            Subscribe Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;
