import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../Styles/Contact.css";

const Contact = () => {
  return (
    <>
      <Header />
      <>
        <div className="contact">
          <div className="contact-container">
            <h1 className="text-center">
              <span>Contact</span> Us
            </h1>
            <form className="contact-form">
              <input type="text" id="name" name="name" placeholder="Name" required />

              <input type="email" id="email" name="email" placeholder="Email" required />

              <textarea id="message" name="message" placeholder="Enter your message Here.." required></textarea>

              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </>
      <Footer />
    </>
  );
};

export default Contact;
