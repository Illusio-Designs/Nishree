import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import hero from "../assets/collectionbg.png";
import vector2 from "../assets/Vector (18).png";
import vector3 from "../assets/Vector (22).png";
import vector4 from "../assets/Vector (23).png";
import vector5 from "../assets/Vector (24).png";
import { getPublicCategories } from "../services/publicindex";
import "../Styles/Collection.css";
import Loader from "../components/Loader";

const Collection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getPublicCategories();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  useEffect(() => {
    const sections = document.querySelectorAll(".section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />
      <div className="background section">
        <div className="hero-section">
          <div className="hero-img-section">
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

        <div className="category section">
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
                className="bi bi-mouse"
                viewBox="0 0 16 16"
              >
                <path d="M8 3a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 3m4 8a4 4 0 0 1-8 0V5a4 4 0 1 1 8 0zM8 0a5 5 0 0 0-5 5v6a5 5 0 0 0 10 0V5a5 5 0 0 0-5-5" />
              </svg>
            </div>
            <div className="blog-cards">
              {loading ? (
                <div className="loading">
                  <Loader size="large" />
                  <p>Loading categories...</p>
                </div>
              ) : error ? (
                <div>Error: {error}</div>
              ) : (
                categories.map((category) => (
                  <div 
                    className="blog-card" 
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={category.image ? `${import.meta.env.VITE_API_URL}/uploads/categories/${category.image}` : hero}
                      alt={category.name}
                      className="blog-image"
                    />
                    <h3>{category.name}</h3>
                    <hr className="hr" />
                    <p>EXPLORE PRODUCTS</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="whychooseus section">
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
        <div className="nishree section">
          <Testimonials />
        </div>
      </div>
      <Newsletter />
      <Footer />
    </>
  );
};

export default Collection;
