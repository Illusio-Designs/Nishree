import React from "react";
import Header from "../components/Header";
import "../Styles/Home.css";
import hero from "../assets/aromatic-spice-collection-adds-flavor-cooking-generated-by-ai 1.png";
import about from "../assets/img.png";
import ProductCard from "../components/Productcard";
import vector1 from "../assets/Vector (17).png";
import vector2 from "../assets/Vector (18).png";
import vector3 from "../assets/Vector (19).png";
import vector4 from "../assets/Vector (20).png";
import vector5 from "../assets/Vector (21).png";
import Testimonials from "../components/Teastimonials";
import BlogCard from "../components/BlogCard";
import Newsletter from "../components/Newsletter";

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
              At Nishree, we take pride in crafting premium-quality products
              that are inspired by the flavors and traditions of India. Every
              blend of spice, every buttermilk masala, and every crispy papad is
              a tribute to the rich culinary heritage of our country. With a
              perfect balance of authenticity and innovation, Nishree ensures
              that every meal becomes a celebration of taste.
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
              <p>Sourced from the finest farms across India</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={vector2} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Authentic Taste</h4>
              <p>Traditional recipes passed down generations</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={vector3} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Wide Variety</h4>
              <p>Extensive range of products for every need</p>
            </div>
          </div>
        </div>
      </div>
      <div className="background">
        <Testimonials />
      </div>
      <div className="whychooseus">
        <div className="products-heading">
          <h1>
            <span>Good Taste,</span> Great Health
          </h1>
        </div>
        <div className="features">
          <div className="feature">
            <div className="feature-icon">
              <img src={vector4} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Boosts Immunity</h4>
              <p>Finest ingredients from trusted farms</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={vector5} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Aids Digestion</h4>
              <p>Traditional recipes with modern techniques</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={vector1} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Natural Ingredients</h4>
              <p>Sealed for freshness and flavor</p>
            </div>
          </div>
        </div>
      </div>
      <div className="background">
        <BlogCard />
      </div>
      <Newsletter />
      
    </>
  );
};

export default Home;
