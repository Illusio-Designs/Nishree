import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from "../components/Header";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from '../components/Footer';
import ProductCard from "../components/Productcard";
import { getPublicCategoryById } from '../services/publicindex';
import hero from "../assets/productbj.png";
import vector2 from "../assets/Vector (18).png";
import vector3 from "../assets/Vector (22).png";
import vector4 from "../assets/Vector (23).png";
import vector5 from "../assets/Vector (24).png";
import "../Styles/Product.css"

const Product = () => {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const categoryId = searchParams.get('category');

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getPublicCategoryById(categoryId);
        setCategory(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

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
      <div className="hero-section section">
        <div className="hero-img-section">
          <img src={hero} className="img-fluid" alt="hero" />
        </div>
        <div className="hero-product-text">
          <h1>
            {category ? category.name : 'Authenticity in Every Bite'}
          </h1>
          <p>
            {category ? category.description : 'Explore premium products made with the finest ingredients for authentic flavor.'}
          </p>
        </div>
      </div>
      
      <div className="background section">
        <div className="products">
          <div className="products-heading">
            <h1>
              <span>{category ? category.name : 'Our'}</span> products
            </h1>
          </div>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : error ? (
            <div className="error">Error: {error}</div>
          ) : category?.products?.length > 0 ? (
            <div className="products-grid">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="no-products">No products found in this category</div>
          )}
        </div>
        {!category && (
          <div className="products">
            <div className="products-heading">
              <h1>
                <span>Our</span> Best Seller 
              </h1>
            </div>
            <div className="products-grid">
              <ProductCard />
            </div>
          </div>
        )}
      </div>

      <div className="whychooseus section">
        <div className="products-heading">
          <h2>
            Why Choose Nishree Products?
          </h2>
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

      <div className="background section">
        <Testimonials />
      </div>
      <Newsletter />
      <Footer />
    </>
  );
}

export default Product;
