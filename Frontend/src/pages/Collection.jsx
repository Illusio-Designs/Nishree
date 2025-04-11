import React from "react";
import Header from "../components/Header";
import Testimonials from "../components/Teastimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import hero from "../assets/collectionbg.png";
import vector2 from "../assets/Vector (18).png";
import vector3 from "../assets/Vector (22).png";
import vector4 from "../assets/Vector (23).png";
import vector5 from "../assets/Vector (24).png";
import img1 from "../assets/p-01.jpg.png";
import img2 from "../assets/Link.png";
import "../Styles/Collection.css";

// New product data
const products = [
  { name: "Blend Spices", image: img1 },
  { name: "Papad", image: img2 },
  { name: "Masala", image: img1 },
  { name: "Premix Masala", image: img2 },
];

const Collection = () => {
  return (
    <>
      <Header />
      <div className="background">
        <div className="hero-section">
          <div className="hero-img">
            <img src={hero} className="img-fluid" alt="hero-img" />
          </div>
          <div className="hero-product-text">
            <h1>
              Explore Our <br />
              Collections
            </h1>
            <p>
              Find the perfect spice, masala, or papad to elevate <br />
              your culinary creations.
            </p>
          </div>
        </div>

        <div className="category">
          <h1 className="text-center">
            <span>Shop by</span> Category
          </h1>
          <div className="nishree">
            <div className="border">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                fill="currentColor"
                class="bi bi-mouse"
                viewBox="0 0 16 16"
              >
                <path d="M8 3a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 3m4 8a4 4 0 0 1-8 0V5a4 4 0 1 1 8 0zM8 0a5 5 0 0 0-5 5v6a5 5 0 0 0 10 0V5a5 5 0 0 0-5-5" />
              </svg>
            </div>
            <div className="blog-cards">
              {products.map((product, index) => (
                <div className="blog-card" key={index}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="blog-image"
                  />
                  <h3>{product.name}</h3>
                  <hr className="hr" />
                  <p>EXPLORE PRODUCTS</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="whychooseus">
          <div className="products-heading">
            <h1>
              <span>Why Choose</span> Nishree Products?
            </h1>
          </div>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">
                <img src={vector2} alt="icon" />
              </div>
              <div className="feature-text">
                <h4>Authentic Flavors</h4>
                <p>Inspired by traditional Indian recipes</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <img src={vector3} alt="icon" />
              </div>
              <div className="feature-text">
                <h4>Premium Quality</h4>
                <p>No artificial colors or preservatives</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <img src={vector4} alt="icon" />
              </div>
              <div className="feature-text">
                <h4>Versatile Usage</h4>
                <p>Perfect for traditional and modern recipes</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <img src={vector5} alt="icon" />
              </div>
              <div className="feature-text">
                <h4>Health Benefits</h4>
                <p>Rich in antioxidants, aids digestion</p>
              </div>
            </div>
          </div>
        </div>
        <div className="nishree">
          <Testimonials />
        </div>
      </div>
      <Newsletter />
      <Footer />
    </>
  );
};

export default Collection;
