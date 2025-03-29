import React from "react";
import Header from "../Componets/Header";
import "../Styles/Home.css";
import hero from "../assets/aromatic-spice-collection-adds-flavor-cooking-generated-by-ai 1.png";
import about from "../assets/img.png";

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
        </div>
      </div>
    </>
  );
};

export default Home;
