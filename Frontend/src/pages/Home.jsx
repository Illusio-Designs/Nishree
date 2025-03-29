import React from "react";
import Header from "../Componets/Header";
import "../Styles/Home.css";
import hero from "../assets/aromatic-spice-collection-adds-flavor-cooking-generated-by-ai 1.png";
import about from "../assets/img.png";
import product from "../assets/4 (1) 2.png";
import bg from "../assets/Vector 1.png";

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
      <div className="about">
        <div className="about-img">
          <img src={about} className="img-fluid" alt="about" />
        </div>
        <div className="about-text">
          <h1>
            <span>About</span> Nishree
          </h1>
          <p>
            At Nishree, we take pride in crafting premium-quality products that
            are inspired by the flavors and traditions of India. Every blend of
            spice, every buttermilk masala, and every crispy papad is a tribute
            to the rich culinary heritage of our country. With a perfect balance
            of authenticity and innovation, Nishree ensures that every meal
            becomes a celebration of taste.
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
        <div className="products-card">
          <div className="card">
            <div className="heart">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                class="bi bi-heart"
                viewBox="0 0 16 16"
              >
                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
              </svg>
            </div>
            <div className="product-img">
              <img src={product} classname="img-fluid" alt="products-card" />
            </div>
          </div>
          <div className="card">
            <div className="heart">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                class="bi bi-heart"
                viewBox="0 0 16 16"
              >
                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
              </svg>
            </div>
            <div className="product-img">
              <img src={product} classname="img-fluid" alt="products-card" />
            </div>
          </div>
          <div className="card">
            <div className="heart">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                class="bi bi-heart"
                viewBox="0 0 16 16"
              >
                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
              </svg>
            </div>
            <div className="product-img">
              <img src={product} classname="img-fluid" alt="products-card" />
            </div>
            <div>
              <img src={bg} classname="img-fluid" alt="bg" />
            </div>
            <div>
              <p>Sambhar Masala</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
