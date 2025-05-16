import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import "../Styles/Productinner.css";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import offer from "../assets/offer.png";
import truck from "../assets/truck.png";
import returnimg from "../assets/return.png";
import secure from "../assets/secure.png";
import div1 from "../assets/div (4).png";
import div2 from "../assets/div (5).png";
import div3 from "../assets/div (6).png";
import div4 from "../assets/div (7).png";
import div5 from "../assets/div (8).png";
import div6 from "../assets/div (9).png";
import div7 from "../assets/div (10).png";
import div8 from "../assets/div (11).png";
import { getPublicProductById } from "../services/publicindex";
import { useParams } from "react-router-dom";

// Base URL for API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Placeholder image URLs
const PLACEHOLDER_IMAGES = {
  main: 'https://placehold.co/450x450/e2e8f0/1e293b?text=Product+Image',
  thumb: 'https://placehold.co/100x100/e2e8f0/1e293b?text=Thumb',
  about: 'https://placehold.co/400x300/e2e8f0/1e293b?text=About+Image'
};

const Productinner = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState('');

  // Function to construct full image URL
  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGES.main;
    if (imagePath.startsWith('http')) return imagePath;
    // Remove any leading slashes to prevent double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
  }, []);

  const fetchProduct = useCallback(async () => {
    try {
      console.log('Fetching product with ID:', id);
      const response = await getPublicProductById(id);
      console.log('API Response:', response);
      
      if (!response.data) {
        console.error('No data received from API');
        throw new Error('No data received from API');
      }

      // Log image URLs for debugging
      if (response.data.ProductImages?.length > 0) {
        console.log('Product Images:', response.data.ProductImages.map(img => ({
          ...img,
          fullUrl: getImageUrl(img.image_url)
        })));
      }

      setProduct(response.data);
      console.log('Product data set:', response.data);

      if (response.data.ProductImages?.length > 0) {
        setSelectedImage(response.data.ProductImages[0]);
        console.log('Selected image set:', response.data.ProductImages[0]);
      }

      if (response.data.ProductVariations?.length > 0) {
        setSelectedVariation(response.data.ProductVariations[0]);
        console.log('Selected variation set:', response.data.ProductVariations[0]);
      } else {
        console.warn('No product variations found');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [id, getImageUrl]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    const sections = document.querySelectorAll(".section");
    console.log('Found sections:', sections.length);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            console.log('Section became visible:', entry.target);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
      // Force initial visibility check
      if (section.getBoundingClientRect().top < window.innerHeight) {
        section.classList.add("visible");
      }
    });

    return () => observer.disconnect();
  }, [product]);

  const handleVariationChange = useCallback((e) => {
    const variation = product.ProductVariations.find(
      v => v.id === parseInt(e.target.value)
    );
    console.log('Selected variation changed:', variation);
    setSelectedVariation(variation);
  }, [product]);

  const handleImageClick = useCallback((image) => {
    console.log('Image clicked:', image);
    setSelectedImage(image);
  }, []);

  const handleImageError = useCallback((e, type) => {
    console.error(`Error loading ${type} image:`, e);
    e.target.src = PLACEHOLDER_IMAGES[type];
    e.target.onerror = null; // Prevent infinite loop
  }, []);

  // Add loading state for images
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    if (product?.ProductImages?.length > 0) {
      const imagePromises = product.ProductImages.map(img => {
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.src = getImageUrl(img.image_url);
          image.onload = resolve;
          image.onerror = reject;
        });
      });

      Promise.all(imagePromises)
        .then(() => {
          console.log('All images loaded successfully');
          setImagesLoaded(true);
        })
        .catch((error) => {
          console.error('Error loading images:', error);
          setImagesLoaded(true); // Still set to true to show placeholders
        });
    }
  }, [product, getImageUrl]);

  if (loading || !imagesLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Product</h2>
        <p>{error}</p>
        <button onClick={fetchProduct}>Retry</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>Product Not Found</h2>
        <p>The requested product could not be found.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  console.log('Rendering product:', product);

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

  return (
    <>
      <Header />
      <div className="background product-inner section">
        <div className="products-info">
          <div className="product-left">
            {product.ProductImages && product.ProductImages.length > 0 ? (
              <>
                <img 
                  src={getImageUrl(selectedImage?.image_url)} 
                  alt={product.name} 
                  className="main-image" 
                  onError={(e) => handleImageError(e, 'main')}
                />
                <div className="thumbnail-list">
                  {product.ProductImages.map((image, i) => (
                    <img 
                      key={i} 
                      src={getImageUrl(image.image_url)} 
                      alt={`${product.name} thumbnail ${i + 1}`} 
                      className={`thumb ${selectedImage?.id === image.id ? 'selected' : ''}`}
                      onClick={() => handleImageClick(image)}
                      onError={(e) => handleImageError(e, 'thumb')}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="no-images">
                <img 
                  src={PLACEHOLDER_IMAGES.main} 
                  alt="No product images available" 
                  className="main-image"
                />
              </div>
            )}
          </div>

          <div className="product-right">
            <div className="badge">Best Seller</div>
            <h1>{product.name || 'Product Name'}</h1>
            <p className="desc">{product.description || 'No description available'}</p>

            {product.ProductVariations && product.ProductVariations.length > 0 ? (
              <select 
                className="weight-select"
                value={selectedVariation?.id}
                onChange={handleVariationChange}
              >
                {product.ProductVariations.map((variation) => (
                  <option key={variation.id} value={variation.id}>
                    {variation.weight}{variation.weightUnit}
                  </option>
                ))}
              </select>
            ) : (
              <div className="no-variations">No variations available</div>
            )}

            {selectedVariation && (
              <>
                <p className="price">₹{selectedVariation.price}</p>
                {selectedVariation.comparePrice && (
                  <p className="compare-price">₹{selectedVariation.comparePrice}</p>
                )}
              </>
            )}

            <div className="actions">
              <button className="btn-red">Add to Cart</button>
              <button className="buy-btn">Buy Now</button>
            </div>

            <div className="offers-section">
              <h3><img src={offer} alt="offer" height="20px"/> Offers</h3>
              <div className="offer-list">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="offer-box">
                    <h4>Cashback</h4>
                    <p>
                      Upto ₹12.09 cashback as Amazon Pay Balance when you pay
                      with…
                    </p>
                    <span>1 offer ▸</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="icons-section">
              <div className="icon-box">
                <img src={truck} alt="truck" className="icon" />
                <p>Free Delivery</p>
              </div>
              <div className="icon-box">
                <img src={returnimg} alt="return" className="icon" />
                <p>Non-Returnable</p>
              </div>
              <div className="icon-box">
                <img src={secure} alt="secure" className="icon" />
                <p>Secure transaction</p>
              </div>
            </div>
          </div>
        </div>

        <div className="productinner section">
          <h1 className="text-center">
            <span>About </span>This product
          </h1>
          <div className="about">
            <div className="about-text">
              <p>{product.description}</p>
              <div>
                <p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#DC2626"
                    className="bi bi-check2"
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
                    className="bi bi-check2"
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
                    className="bi bi-check2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                  </svg>{" "}
                  Versatile and easy to use in various recipes
                </p>
              </div>
            </div>
            <div className="about-img">
              <img 
                src={getImageUrl(selectedImage?.image_url)} 
                className="img-fluid" 
                alt={product.name}
                onError={(e) => handleImageError(e, 'about')}
              />
            </div>
          </div>
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

        <div className="legacy section">
          <section className="testimonials">
            <h1 className="text-center">
              <span>How</span> to Use
            </h1>
            <div className="testimonials-container">
              {legacy.map((legacy) => (
                <div key={legacy.id} className="testimonial-card">
                  <span>
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

        <div className="Facts section">
          <h1>
            <span>Product</span> Details
          </h1>
          <div className="fact-content">
            {selectedVariation && (
              <>
                <div className="weight">
                  <p>Weight</p>
                  <p>{selectedVariation.weight}{selectedVariation.weightUnit}</p>
                </div>
                <div className="weight">
                  <p>Dimensions</p>
                  <p>{selectedVariation.dimensions}</p>
                </div>
                <div className="weight">
                  <p>Stock</p>
                  <p>{selectedVariation.stock} units</p>
                </div>
                <div className="weight">
                  <p>SKU</p>
                  <p>{selectedVariation.sku}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Testimonials />

      <div className="background section">
        <div className="review-section section">
          <h2 className="text-center">Write a Review</h2>
          <div className="review-form-container">
            <form className="review-form">
              <div className="star-rating">
                <label>Rating:</label>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="star"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {star <= (hoverRating || rating) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="review-message">Your Review:</label>
                <textarea
                  id="review-message"
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows="4"
                />
              </div>
              <button type="submit" className="submit-review">Submit Review</button>
            </form>
          </div>
        </div>
      </div>
      <Newsletter />
      <Footer />
    </>
  );
};

export default Productinner;
