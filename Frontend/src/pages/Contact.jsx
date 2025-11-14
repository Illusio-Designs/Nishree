import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import "../Styles/Contact.css";
import { useSEO } from "../hooks/useSEO";

const Contact = () => {
  const { seoData } = useSEO('contact');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{seoData?.meta_title || 'Contact Us - Nishree'}</title>
        <meta name="description" content={seoData?.meta_description || 'Get in touch with Nishree for any queries or support.'} />
        {seoData?.meta_keywords && <meta name="keywords" content={seoData.meta_keywords} />}
        {seoData?.canonical_url && <link rel="canonical" href={seoData.canonical_url} />}
      </Helmet>
      <Header />
      <div className="contactpage section">
        <div className="contact-container">
          <h1 className="text-center">
            <span>Contact</span> Us
          </h1>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="Name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />

            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />

            <textarea 
              id="message" 
              name="message" 
              placeholder="Enter your message Here.." 
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
