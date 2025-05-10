import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import "../Styles/Home.css";
import about from "../assets/img.png";
import ProductCard from "../components/Productcard";
import vector1 from "../assets/Vector (17).png";
import vector2 from "../assets/Vector (18).png";
import vector3 from "../assets/Vector (19).png";
import vector4 from "../assets/Vector (20).png";
import vector5 from "../assets/Vector (21).png";
import Testimonials from "../components/Testimonials";
import BlogCard from "../components/BlogCard";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { getPublicSliders } from '../services/publicindex';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const data = await getPublicSliders();
        console.log('Fetched sliders data:', data);
        
        // Handle both array and object with sliders property
        const sliderData = Array.isArray(data) ? data : (data.sliders || []);
        
        // Add full URL path to images with correct directory name
        const slidersWithFullUrls = sliderData.map(slider => ({
          ...slider,
          image: `${API_URL}/uploads/slider/${slider.image}`
        }));
        
        console.log('Slider images with full URLs:', slidersWithFullUrls.map(slider => ({
          title: slider.title,
          imageUrl: slider.image
        })));
        
        setSliders(slidersWithFullUrls);
      } catch (err) {
        console.error('Error fetching sliders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (sliders.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliders.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [sliders.length]);

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
        {loading ? (
          <div className="loading">Loading sliders...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : sliders.length > 0 ? (
          <div className="slider-container">
            {sliders.map((slider, index) => {
              const imageUrl = `${API_URL}/uploads/slider/${slider.image}`;
              console.log(`Slider ${index} image URL:`, imageUrl);
              return (
                <div
                  key={slider.id || slider._id || index}
                  className={`slider-item ${index === currentSlide ? 'active' : ''}`}
                  style={{ display: index === currentSlide ? 'block' : 'none' }}
                >
                  <img 
                    src={imageUrl} 
                    alt={slider.title} 
                    className="slider-image"
                    onError={(e) => {
                      console.error('Image failed to load:', imageUrl);
                      e.target.onerror = null;
                      e.target.src = about; // Use local fallback image
                    }}
                  />
                  <div className="slider-content">
                    <h2>{slider.title}</h2>
                    {slider.description && <p>{slider.description}</p>}
                    {slider.buttonText && (
                      <button className="btn-red">{slider.buttonText}</button>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="slider-dots">
              {sliders.map((_, index) => (
                <span
                  key={`dot-${index}`}
                  className={`dot ${index === currentSlide ? "active" : ""}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="no-sliders">No sliders available</div>
        )}
      </div>
      <div className="background section">
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
      <div className="whychooseus section">
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
      <div className="background section">
        <Testimonials />
      </div>
      <div className="whychooseus section">
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
      <div className="background section">
        <BlogCard />
      </div>

      <Newsletter />

      <Footer />
    </>
  );
};

export default Home;
