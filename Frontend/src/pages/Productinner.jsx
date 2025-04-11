import React from "react";
import Header from "../components/Header";
import "../Styles/Productinner.css";
import Testimonials from "../components/Teastimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import about from "../assets/img (4).png";
import div1 from "../assets/div (4).png";
import div2 from "../assets/div (5).png";
import div3 from "../assets/div (6).png";
import div4 from "../assets/div (7).png";
import div5 from "../assets/div (8).png";
import div6 from "../assets/div (9).png";
import div7 from "../assets/div (10).png";
import div8 from "../assets/div (11).png";
import card1 from "../assets/img (5).png";
import card2 from "../assets/img (6).png";
import card3 from "../assets/img (7).png";

const Productinner = () => {
  const legacy = [
    {
      id: 1,
      image: div6,
      name: "For Curries",
      text: "Add 1-2 teaspoons to curries for a rich flavor",
    },
    {
      id: 2,
      image: div7,
      name: "For Vegetables",
      text: "Sprinkle over roasted vegetables for a spicy kick",
    },
    {
      id: 3,
      image: div8,
      name: "For Marinades",
      text: "Use as a marinade base for meats and paneer",
    },
  ];

  const blogPosts = [
    {
      image: card1,
      title: "Authentic Garam Masala Curry",
    },
    {
      image: card2,
      title: "Spiced Roasted Vegetables",
    },
    {
      image: card3,
      title: "Masala Marinade Grilled Chicken",
    },
  ];

  return (
    <>
      <Header />
      <div className="background">
        <div className="productinner">
          <h1 className="text-center">
            <span>About </span>This product
          </h1>
          <div className="about">
            <div className="about-text">
              <p>
                Crafted with a unique blend of aromatic spices, this garam
                masala adds a burst of flavor to your dishes. Inspired by
                traditional recipes, it's perfect for curries, gravies, and
                marinades.
              </p>
              <div>
                <p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#DC2626"
                    class="bi bi-check2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                  </svg>{" "}
                  Made with premium quality ingredients
                </p>
              </div>
              <div>
                <p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#DC2626"
                    class="bi bi-check2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                  </svg>{" "}
                  No artificial colors or preservatives
                </p>
              </div>
              <div>
                <p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#DC2626"
                    class="bi bi-check2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                  </svg>{" "}
                  Versatile and easy to use in various recipes
                </p>
              </div>
            </div>
            <div className="about-img">
              <img src={about} className="img-fluid" alt="about" />
            </div>
          </div>
        </div>

        <div className="whychooseus">
          <div className="products-heading">
            <h1>
              <span>Why Choose</span> Nishree?
            </h1>
          </div>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">
                <img src={div1} alt="icon" />
              </div>
              <div className="feature-text">
                <h4>Coriander</h4>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <img src={div2} alt="icon" />
              </div>
              <div className="feature-text">
                <h4>Cumin</h4>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <img src={div3} alt="icon" />
              </div>
              <div className="feature-text">
                <h4>Cardamom</h4>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <img src={div4} alt="icon" />
              </div>
              <div className="feature-text">
                <h4>Cloves</h4>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <img src={div5} alt="icon" />
              </div>
              <div className="feature-text">
                <h4>Cinnamon</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="legacy">
          <section className="testimonials">
            <h1 className="text-center">
              <span>How</span> to Use
            </h1>
            <div className="testimonials-container">
              {legacy.map((legacy) => (
                <div key={legacy.id} className="testimonial-card">
                  <span>
                    {" "}
                    <img
                      src={legacy.image}
                      alt={legacy.name}
                      className="user-avatar"
                    />
                  </span>
                  <div className="user-info">
                    <h3>{legacy.name}</h3>
                  </div>
                  <p className="text">{legacy.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="blog-section">
          <h2
            style={{
              fontFamily: "inter",
              textAlign: "center",
              fontSize: "30px",
              paddingBottom: "20px",
            }}
          >
            Try It With These Recipes
          </h2>
          <div className="blog-cards">
            {blogPosts.map((post, index) => (
              <div className="blog-card" key={index}>
                <div className="blog-image">
                  <img src={post.image} alt={post.title} />
                </div>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <button className="read-more">Read More →</button>
              </div>
            ))}
          </div>
        </div>

        <div className="Facts">
          <h1>
            <span>Nutritional</span> Facts
          </h1>
          <div className="fact-content">
            <p>Per 10g Serving</p>
            <div className="weight">
              <p>Calories</p>
              <p>40</p>
            </div>
            <div className="weight">
              <p>Fats</p>
              <p>2g</p>
            </div>
            <div className="weight">
              <p>Carbohydrates</p>
              <p>5g</p>
            </div>
            <div className="weight">
              <p>Protein</p>
              <p>1g</p>
            </div>
          </div>
        </div>
      </div>
      <Testimonials />
      <Newsletter />
      <Footer />
    </>
  );
};

export default Productinner;
