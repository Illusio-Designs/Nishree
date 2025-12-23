import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import hero from "../assets/collectionbg.webp";
import vector2 from "../assets/Vector (18).webp";
import vector3 from "../assets/Vector (22).webp";
import vector4 from "../assets/Vector (23).webp";
import vector5 from "../assets/Vector (24).webp";
import { getPublicCategories } from "../services/publicindex";
import "../styles/Collection.css";
import Loader from "../components/Loader";
import CookingLoader from "../components/CookingLoader";
import { useSEO } from "../hooks/useSEO";

const Collection = () => {
  const { seoData } = useSEO('categories');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const startTime = Date.now();
      try {
        const data = await getPublicCategories();
        console.log('Fetched categories:', data);
        
        // Handle different response formats
        let categoriesData = [];
        if (Array.isArray(data)) {
          categoriesData = data;
        } else if (data.categories && Array.isArray(data.categories)) {
          categoriesData = data.categories;
        } else if (data.data && Array.isArray(data.data)) {
          categoriesData = data.data;
        }
        
        console.log('Processed categories:', categoriesData);
        setCategories(categoriesData);
        
        // Ensure loader shows for at least 3 seconds
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 3000 - elapsedTime);
        setTimeout(() => setLoading(false), remainingTime);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
        // Ensure loader shows for at least 3 seconds even on error
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 3000 - elapsedTime);
        setTimeout(() => setLoading(false), remainingTime);
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

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{seoData?.meta_title || 'Categories - Nishree'}</title>
          <meta name="description" content={seoData?.meta_description || 'Browse our spice categories and find your perfect blend.'} />
          {seoData?.meta_keywords && <meta name="keywords" content={seoData.meta_keywords} />}
          {seoData?.canonical_url && <link rel="canonical" href={seoData.canonical_url} />}
        </Helmet>
        <CookingLoader />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{seoData?.meta_title || 'Categories - Nishree'}</title>
        <meta name="description" content={seoData?.meta_description || 'Browse our spice categories and find your perfect blend.'} />
        {seoData?.meta_keywords && <meta name="keywords" content={seoData.meta_keywords} />}
        {seoData?.canonical_url && <link rel="canonical" href={seoData.canonical_url} />}
      </Helmet>
      <Header />
      <div className="collection background section">
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
              {error ? (
                <div>Error: {error}</div>
              ) : (
                categories.map((category) => {
                  // Construct image URL
                  let imageUrl = hero; // Default fallback
                  
                  if (category.image) {
                    // If image is already a full URL
                    if (category.image.startsWith('http')) {
                      imageUrl = category.image;
                    } else {
                      // Remove leading slash if present
                      const imagePath = category.image.replace(/^\//, '');
                      imageUrl = `${import.meta.env.VITE_API_URL}/${imagePath}`;
                    }
                  }
                  
                  console.log('Category:', category.name, 'Image URL:', imageUrl);
                  
                  return (
                    <div 
                      className="blog-card" 
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={imageUrl}
                        alt={category.name}
                        className="blog-image"
                        onError={(e) => {
                          console.error('Failed to load image:', imageUrl);
                          e.target.onerror = null;
                          e.target.src = hero;
                        }}
                      />
                      <h3>{category.name}</h3>
                      <hr className="hr" />
                      <p>EXPLORE PRODUCTS</p>
                    </div>
                  );
                })
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
              <div className="feature-icon premium-icon">
                <img src={vector3} alt="icon"/>
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
