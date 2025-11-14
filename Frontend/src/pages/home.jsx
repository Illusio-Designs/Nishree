import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Header from "../components/Header";
import "../Styles/Home.css";
import about from "../assets/img.webp";
import ProductCard from "../components/Productcard";
import vector1 from "../assets/Vector (17).webp";
import vector2 from "../assets/Vector (18).webp";
import vector3 from "../assets/Vector (19).webp";
import vector4 from "../assets/Vector (20).webp";
import vector5 from "../assets/Vector (21).webp";
import Testimonials from "../components/Testimonials";
import BlogCard from "../components/BlogCard";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { getPublicSliders, getAllPublicProducts } from '../services/publicindex';
import Loader from "../components/Loader";
import { useSEO } from "../hooks/useSEO";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [showProductsArrows, setShowProductsArrows] = useState(false);
  const backgroundRef = useRef(null);
  const wrapperRef = useRef(null);
  const titleRef = useRef(null);
  const productsSliderRef = useRef(null);
  const { seoData } = useSEO('home');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch sliders
        const data = await getPublicSliders();
        console.log('Fetched sliders data:', data);
        
        // Handle different response formats
        let sliderData = [];
        if (Array.isArray(data)) {
          sliderData = data;
        } else if (data.sliders && Array.isArray(data.sliders)) {
          sliderData = data.sliders;
        } else if (data.data && Array.isArray(data.data)) {
          sliderData = data.data;
        }
        
        console.log('Processed slider data:', sliderData);
        
        // Construct full image URLs
        const slidersWithFullUrls = sliderData.map(slider => {
          let imageUrl = slider.image || slider.image_url || '';
          
          // If image is already a full URL, use it
          if (imageUrl.startsWith('http')) {
            return { ...slider, image: imageUrl };
          }
          
          // Remove leading slash if present
          imageUrl = imageUrl.replace(/^\//, '');
          
          // Construct full URL
          const fullUrl = `${API_URL}/${imageUrl}`;
          console.log('Slider image URL:', fullUrl);
          
          return {
            ...slider,
            image: fullUrl
          };
        });
        
        console.log('Sliders with full URLs:', slidersWithFullUrls);
        setSliders(slidersWithFullUrls);
        
        // Fetch products (first 10)
        const productsResponse = await getAllPublicProducts({ limit: 10 });
        if (productsResponse.success && productsResponse.data?.products) {
          setProducts(productsResponse.data.products);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (sliders.length > 0) {
      updateSlider();
    }
  }, [currentIndex, sliders]);

  const updateBackground = () => {
    if (backgroundRef.current && sliders[currentIndex]) {
      backgroundRef.current.style.backgroundImage = `url(${sliders[currentIndex].image})`;
    }
  };

  const updateTitle = () => {
    if (titleRef.current) {
      const items = sliders.map((slider) => slider.title);
      titleRef.current.innerHTML = "";
      
      items.forEach((item) => {
        const span = document.createElement("span");
        span.textContent = item;
        titleRef.current.appendChild(span);
      });
      
      titleRef.current.style.transform = `translateY(-${currentIndex * 52}px)`;
    }
  };

  const updateSlider = () => {
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `translateX(-${currentIndex * 270}px)`;
    }
    updateBackground();
    updateTitle();
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < sliders.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
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

  useEffect(() => {
    const checkOverflow = () => {
      if (productsSliderRef.current) {
        const hasOverflow = productsSliderRef.current.scrollWidth > productsSliderRef.current.clientWidth;
        setShowProductsArrows(hasOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [products]);

  return (
    <>
      <Helmet>
        <title>{seoData?.metaTitle || 'Nishree - Premium Spices & Masalas'}</title>
        <meta name="description" content={seoData?.metaDescription || 'Discover authentic Indian spices and masalas at Nishree. Premium quality products for your kitchen.'} />
        {seoData?.metaKeywords && <meta name="keywords" content={seoData.metaKeywords} />}
        {seoData?.ogTitle && <meta property="og:title" content={seoData.ogTitle} />}
        {seoData?.ogDescription && <meta property="og:description" content={seoData.ogDescription} />}
        {seoData?.ogImage && <meta property="og:image" content={seoData.ogImage} />}
      </Helmet>
      <Header />
      <div className="hero-section section">
        {loading ? (
          <div className="loading">
            <Loader size="large" />
            <p>Loading sliders...</p>
          </div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : sliders.length > 0 ? (
          <div className="rotating-slider">
            <div className="rotating-slider__content">
              <div className="rotating-slider__background" ref={backgroundRef} />
              <div className="rotating-slider__wrapper" ref={wrapperRef}>
                {sliders.map((slider, index) => (
                  <div
                    key={slider.id || slider._id || index}
                    className={`rotating-slider__slide ${index === currentIndex ? 'active' : ''}`}
                    data-title={slider.title}
                  >
                    <img
                      src={slider.image}
                      alt={slider.title}
                      className="rotating-slider__image"
                      onError={(e) => {
                        console.error('Image failed to load:', slider.image);
                        e.target.onerror = null;
                        e.target.src = about;
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="rotating-slider__list" ref={titleRef} />
              <div className="slider-content">
                <h2>{sliders[currentIndex]?.title}</h2>
                {sliders[currentIndex]?.description && <p>{sliders[currentIndex].description}</p>}
                {sliders[currentIndex]?.buttonText && (
                  <button className="btn-red">{sliders[currentIndex].buttonText}</button>
                )}
              </div>
              <div className="rotating-slider__navigation">
                <button
                  className="rotating-slider__prev"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  aria-label="Previous slide"
                />
                <button
                  className="rotating-slider__next"
                  onClick={handleNext}
                  disabled={currentIndex === sliders.length - 1}
                  aria-label="Next slide"
                />
              </div>
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
          <div className="product-slider-wrapper">
            {showProductsArrows && (
              <button 
                className="slider-arrow slider-arrow-left" 
                onClick={() => {
                  if (productsSliderRef.current) {
                    productsSliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                  }
                }}
              >
                <FaChevronLeft />
              </button>
            )}
            <div className="product-slider" ref={productsSliderRef}>
              {products.map((product) => (
                <div key={product.id} className="product-slider-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            {showProductsArrows && (
              <button 
                className="slider-arrow slider-arrow-right" 
                onClick={() => {
                  if (productsSliderRef.current) {
                    productsSliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                  }
                }}
              >
                <FaChevronRight />
              </button>
            )}
          </div>
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
