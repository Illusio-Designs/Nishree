import React from "react";
import Header from "../components/Header";
import "../Styles/Home.css";
import hero from "../assets/aromatic-spice-collection-adds-flavor-cooking-generated-by-ai 1.png";
import about from "../assets/img.png";
import ProductCard from "../components/Productcard";
import vector1 from "../assets/Vector (17).png"

const Home = () => {
  return (
    <>
      <Header />
      <div className="hero-section">
        <div className="hero-img">
          <img src={hero} className="img-fluid" alt="hero-img" />
        </div>
        <div className="hero-text">
          <h1>
            Flavors That Inspire, <br />
            Traditions That Unite.
          </h1>
          <button className="btn">Shop Now</button>
        </div>
      </div>
      <div className="background">
      <div className="about">
        <div className="about-img">
          <img src={about} className="img-fluid" alt="about" />
        </div>
        <div className="about-text">
          <h1>
            <span>About</span> Nishree
          </h1>
          <p>
            At Nishree, we take pride in crafting premium-quality products that
            are inspired by the flavors and traditions of India. Every blend of
            spice, every buttermilk masala, and every crispy papad is a tribute
            to the rich culinary heritage of our country. With a perfect balance
            of authenticity and innovation, Nishree ensures that every meal
            becomes a celebration of taste.
          </p>
          <button className="btn-red">Learn More</button>
        </div>
      </div>
      <div className="products">
        <div className="products-heading">
          <h1>
            <span>Our</span> products
          </h1>
        </div>
        <ProductCard />
      </div>
      </div>
      <div className="whychooseus">
      <div className="products-heading">
          <h1>
            <span>Why</span> Chhose Us
          </h1>
        </div>
        <div className="features">
          <div className="feature">
            <div className="feature-icon">
              <img src={vector1} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Quality Ingredients</h4>
              <p>
              Sourced from the finest farms across India
              </p>
            </div>
            </div>
      </div>
      </div>
    </>
  );
};

export default Home;
