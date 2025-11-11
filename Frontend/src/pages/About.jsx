import React, { useEffect } from "react";
import "../Styles/About.css";
import Header from "../components/Header";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import hero from "../assets/aboutbg.png";
import about from "../assets/we.png";
import vector2 from "../assets/Vector (22).png";
import vector3 from "../assets/Vector (18).png";
import vector4 from "../assets/Vector (24).png";
import div1 from "../assets/div.png";
import div2 from "../assets/div (1).png";
import div3 from "../assets/div (2).png";
import img1 from "../assets/img (1).png";
import img2 from "../assets/img (3).png";
import img3 from "../assets/men.png";

const About = () => {
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

  const legacy = [
    {
      id: 1,
      title: "2024",
      name: "Foundation",
      text: 'Nishree was founded with a focus on premium spice blends.',
    },
    {
      id: 2,
      title: "2025",
      name: "Expansion",
      text: 'Expanded product line to include buttermilk masalas and papads.',
    },
    {
      id: 3,
      title: "Today",
      name: "Achievement",
      text: 'A trusted name for authentic Indian flavors.',
    },
  ];

  return (
    <>
      <Header />
      <div className="main-section section">
        <div className="hero-img-section">
          <img src={hero} className="img-fluid" alt="hero-img" />
        </div>
        <div className="hero-product-text">
          <h1>
            Our Journey,
            <br />
            Your Flavors
          </h1>
          <p>
            At Nishree, we bring India's rich culinary heritage to
            <br /> your table with premium spices, buttermilk masalas,
            <br /> and authentic papads.
          </p>
        </div>
      </div>

      <div className="about section">
        <div className="about-text">
          <h1>
            <span>Who </span>We Are
          </h1>
          <p>
            Nishree is a proud Indian brand dedicated to delivering the finest
            blend spice masalas, flavorful buttermilk masalas, and crispy
            papads. We combine tradition with innovation, ensuring every product
            is a perfect balance of taste and quality.
          </p>
          <div>
            <h4>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#DC2626"
                className="bi bi-bullseye"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M8 13A5 5 0 1 1 8 3a5 5 0 0 1 0 10m0 1A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
                <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
                <path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
              </svg>{" "}
              Our Mission
            </h4>
            <p style={{ color: "#9CA3AF", paddingLeft: "20px"}}>
              To bring the authentic taste of India to every kitchen.
            </p>
          </div>
          <div>
            <h4>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#DC2626"
                className="bi bi-eye-fill"
                viewBox="0 0 16 16"
              >
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
              </svg>{" "}
              Our Vision
            </h4>
            <p style={{ color: "#9CA3AF", paddingLeft: "20px" }}>
              To be the preferred choice for culinary excellence worldwide.
            </p>
          </div>
        </div>
        <div className="about-img">
          <img src={about} className="img-fluid" alt="about" />
        </div>
      </div>

      <div className="legacy section">
      <section className="testimonials">
      <h1 className="text-center">
        <span>Our Legacy</span> of Taste
      </h1>
      <div className="testimonials-container">
        {legacy.map((legacy) => (
          <div key={legacy.id} className="testimonial-card">
           <span> <h2>{legacy.title}</h2></span>
            <div className="user-info">
              <h3>{legacy.name}</h3>
            </div>
            <p className="testimonial-text">{legacy.text}</p>
          </div>
        ))}
      </div>
    </section>
      </div>

      <div className="whychooseus section">
        <div className="products-heading">
          <h1>
            <span>Why Choose</span> Nishree?
          </h1>
        </div>
        <div className="features">
          <div className="feature">
            <div className="feature-icon">
              <img src={vector2} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Quality Assurance</h4>
              <p>
                We source the finest ingredients to ensure every product exceeds
                expectations.
              </p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={vector3} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Authentic Recipes</h4>
              <p>Our blends are inspired by traditional Indian kitchens.</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={vector4} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Commitment to Health</h4>
              <p>
                All products are made without artificial colors or
                preservatives.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="legacy section">
      <div className="whychooseus">
        <div className="products-heading">
          <h1>
            <span>The Faces</span> Behind Nishree
          </h1>
        </div>
        <div className="features faces">
          <div className="feature">
            <div className="feature-icon">
              <img src={img1} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Rajesh Kumar</h4>
              <p>
              Founder & CEO
              </p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={img2} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Amit Patel</h4>
              <p>Quality Manager</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={img3} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Meera Singh</h4>
              <p>
              Recipe Expert
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="whychooseus section">
        <div className="products-heading">
          <h2 style={{ fontFamily: "inter" }}>From Farm to Kitchen</h2>
        </div>
        <div className="features">
          <div className="feature">
            <div className="feature-icon">
              <img src={div1} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Sourcing</h4>
              <p>Carefully selected ingredients from trusted farms.</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={div2} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Blending</h4>
              <p>Perfectly balanced recipes crafted with precision.</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={div3} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Packaging</h4>
              <p>Sealed for freshness and hygiene.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="legacy section">
      <Testimonials />
      </div>
      
      <Newsletter />
      <Footer />
    </>
  );
};

export default About;
