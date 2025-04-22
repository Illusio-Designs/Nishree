import React, { useEffect, useState } from "react";
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
import Testimonials from "../components/Testimonials";
import BlogCard from "../components/BlogCard";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";

// Temporary test slider data
const testSliders = [
  {
    id: 1,
    title: "Flavors That Inspire, Traditions That Unite",
    image: hero,
  },
  {
    id: 2,
    title: "Discover Authentic Indian Spices",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Premium Quality Products for Your Kitchen",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=1974&auto=format&fit=crop",
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliders] = useState(testSliders);

  const getSlideClass = (index) => {
    if (index === currentSlide) return 'active';
    if (index === (currentSlide - 1 + sliders.length) % sliders.length) return 'prev';
    if (index === (currentSlide + 1) % sliders.length) return 'next';
    return '';
  };

  useEffect(() => {
    if (sliders.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliders.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [sliders]);

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
        {sliders.map((slider, index) => (
          <div key={slider.id} className={`hero-img ${getSlideClass(index)}`}>
            <img src={slider.image} className="img-fluid" alt={slider.title} />
            {index === currentSlide && (
              <div className="hero-text">
                <h1>{slider.title}</h1>
                <button className="btn">Shop Now</button>
              </div>
            )}
          </div>
        ))}
        <div className="slider-dots">
          {sliders.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
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
