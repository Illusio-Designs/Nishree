import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import "../Styles/Productinner.css";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import offer from "../assets/offer.webp";
import truck from "../assets/truck.webp";
import returnimg from "../assets/return.webp";
import secure from "../assets/secure.webp";
import div1 from "../assets/div (4).webp";
import div2 from "../assets/div (5).webp";
import div3 from "../assets/div (6).webp";
import div4 from "../assets/div (7).webp";
import div5 from "../assets/div (8).webp";
import div6 from "../assets/div (9).webp";
import div7 from "../assets/div (10).webp";
import div8 from "../assets/div (11).webp";
import { getPublicProductById, getPublicProductReviews, createPublicReview } from "../services/publicindex";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Loader from "../components/Loader";
import CookingLoader from "../components/CookingLoader";

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
  const { user } = useAuth();
  const { addToCart, setBuyNow } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewFiles, setReviewFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('about'); // 'about' or 'reviews'
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Helper function to get user initials
  const getUserInitials = (username) => {
    if (!username) return 'U';
    const names = username.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  // Helper function to get reviewer name (from User or guest name)
  const getReviewerName = (review) => {
    // Priority: User.username > guestName > 'Anonymous'
    return review.User?.username || review.guestName || 'Anonymous';
  };

  // Helper function to get reviewer profile image
  const getReviewerImage = (review) => {
    return review.User?.profileImage || null;
  };

  // Helper function to get avatar color based on username
  const getAvatarColor = (username) => {
    const colors = [
      { from: '#dc2626', to: '#b91c1c' }, // Red
      { from: '#2563eb', to: '#1e40af' }, // Blue
      { from: '#059669', to: '#047857' }, // Green
      { from: '#d97706', to: '#b45309' }, // Orange
      { from: '#7c3aed', to: '#6d28d9' }, // Purple
      { from: '#db2777', to: '#be185d' }, // Pink
      { from: '#0891b2', to: '#0e7490' }, // Cyan
      { from: '#ea580c', to: '#c2410c' }, // Orange-Red
    ];
    
    if (!username) return colors[0];
    
    // Use username length and first character to determine color
    const index = (username.length + username.charCodeAt(0)) % colors.length;
    return colors[index];
  };

  // Function to construct full image URL
  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGES.main;
    if (imagePath.startsWith('http')) return imagePath;
    // Remove any leading slashes to prevent double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
  }, []);

  // Add a new function for review images
  const getReviewImageUrl = useCallback((imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGES.main;
    if (imagePath.startsWith('http')) return imagePath;
    // Remove any leading slashes to prevent double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${API_BASE_URL}/uploads/reviews/${cleanPath}`;
  }, []);

  const fetchProduct = useCallback(async () => {
    const startTime = Date.now();
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

      // Ensure loader shows for at least 3 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsedTime);
      setTimeout(() => setLoading(false), remainingTime);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message);
      // Ensure loader shows for at least 3 seconds even on error
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsedTime);
      setTimeout(() => setLoading(false), remainingTime);
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
        rootMargin: '50px'
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
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



  // Quantity handlers with validation
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    
    // Allow empty string for user to type
    if (value === '') {
      setQuantity('');
      return;
    }
    
    const numValue = parseInt(value);
    const maxStock = selectedVariation?.stock || 999;
    
    // Validate: must be a number, >= 1, and <= available stock
    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxStock) {
      setQuantity(numValue);
    } else if (numValue > maxStock) {
      setQuantity(maxStock);
      toast.warning(`Only ${maxStock} items available in stock`);
    }
  };

  const incrementQuantity = () => {
    const maxStock = selectedVariation?.stock || 999;
    setQuantity(prev => {
      const current = prev === '' ? 1 : prev;
      if (current >= maxStock) {
        toast.warning(`Only ${maxStock} items available in stock`);
        return maxStock;
      }
      return current + 1;
    });
  };

  const decrementQuantity = () => {
    setQuantity(prev => {
      const current = prev === '' ? 1 : prev;
      return current > 1 ? current - 1 : 1;
    });
  };

  // Validate quantity on blur (when user leaves the input)
  const handleQuantityBlur = () => {
    if (quantity === '' || quantity < 1) {
      setQuantity(1);
    }
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product || !selectedVariation) {
      toast.error('Please select a product variation');
      return;
    }

    const cartProduct = {
      id: product.id,
      name: product.name,
      price: selectedVariation.price,
      comparePrice: selectedVariation.comparePrice,
      image: selectedImage?.image_url || product.ProductImages?.[0]?.image_url,
      variation: {
        id: selectedVariation.id,
        weight: selectedVariation.weight,
        weightUnit: selectedVariation.weightUnit,
        sku: selectedVariation.sku
      },
      ProductImages: product.ProductImages,
      ProductVariations: product.ProductVariations
    };

    addToCart(cartProduct, quantity);
    toast.success(`${quantity} item(s) added to cart!`);
  };

  // Buy now handler
  const handleBuyNow = () => {
    if (!product || !selectedVariation) {
      toast.error('Please select a product variation');
      return;
    }

    const buyNowProduct = {
      id: product.id,
      name: product.name,
      price: selectedVariation.price,
      comparePrice: selectedVariation.comparePrice,
      image: selectedImage?.image_url || product.ProductImages?.[0]?.image_url,
      variation: {
        id: selectedVariation.id,
        weight: selectedVariation.weight,
        weightUnit: selectedVariation.weightUnit,
        sku: selectedVariation.sku
      },
      ProductImages: product.ProductImages,
      ProductVariations: product.ProductVariations
    };

    setBuyNow(buyNowProduct, quantity);
    navigate('/checkout?buyNow=true');
  };

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setReviewLoading(true);
      const response = await getPublicProductReviews(id, {
        page: 1,
        limit: 5,
        sort: 'recent'
      });
      setReviews(response.reviews);
      setReviewStats(response.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
        // Validate required fields
        if (!product?.id && !id) {
            toast.error('Product information is missing. Please refresh the page and try again.');
            setSubmittingReview(false);
            return;
        }

        if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
            toast.error('Please provide a valid rating (1-5)');
            setSubmittingReview(false);
            return;
        }

        if (!reviewText?.trim()) {
            toast.error('Please provide your review text');
            setSubmittingReview(false);
            return;
        }

        const formData = new FormData();
        const productId = product?.id || id;
        
        formData.append('productId', productId);
        formData.append('rating', reviewRating);
        formData.append('comment', reviewText);
        
        // If user is logged in, use their info, otherwise submit as anonymous
        if (user) {
            formData.append('name', user.username);
            formData.append('email', user.email);
        } else {
            // For guest users, submit as anonymous
            formData.append('name', 'Anonymous');
            formData.append('email', 'anonymous@guest.com');
        }

        // Append files if any
        if (reviewFiles.length > 0) {
            reviewFiles.forEach(file => {
                formData.append('files', file);
            });
        }

        const response = await createPublicReview(formData);
        
        if (response.success) {
            toast.success('Review submitted successfully! It will be visible after approval.');
            setReviewRating(0);
            setReviewText('');
            setReviewFiles([]);
            setShowReviewForm(false);
            fetchReviews();
        } else {
            toast.error(response.message || 'Failed to submit review');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        
        // Handle different error scenarios
        if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else if (error.message) {
            toast.error(error.message);
        } else {
            toast.error('Failed to submit review. Please try again.');
        }
    } finally {
        setSubmittingReview(false);
    }
  };

  if (loading || !imagesLoaded) {
    return <CookingLoader />;
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
                <div className="price-section">
                  <p className="price">₹{selectedVariation.price}</p>
                  {selectedVariation.comparePrice && selectedVariation.comparePrice > selectedVariation.price && (
                    <p className="compare-price">₹{selectedVariation.comparePrice}</p>
                  )}
                </div>
              </>
            )}
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn" 
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    className="quantity-input" 
                    value={quantity}
                    onChange={handleQuantityChange}
                    onBlur={handleQuantityBlur}
                    min="1"
                    max={selectedVariation?.stock || 999}
                  />
                  <button 
                    className="quantity-btn" 
                    onClick={incrementQuantity}
                    disabled={quantity >= (selectedVariation?.stock || 999)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="actions">
                <button className="btn-red" onClick={handleAddToCart}>Add to Cart</button>
                <button className="buy-btn" onClick={handleBuyNow}>Buy Now</button>
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

        {/* Tabs Section */}
        <div className="product-tabs-section section">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              Product Description
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviewStats?.total || 0})
            </button>
          </div>

          <div className="tabs-content">
            {/* Product Description Tab */}
            {activeTab === 'about' && (
              <div className="tab-panel description-panel">
                <div className="description-content">
                  <p>{product.description}</p>
                  
                  {/* Product Details */}
                  {selectedVariation && (
                    <div className="product-details-inline">
                      <div className="detail-item">
                        <span className="detail-label">Weight:</span>
                        <span className="detail-value">{selectedVariation.weight}{selectedVariation.weightUnit}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Dimensions:</span>
                        <span className="detail-value">{selectedVariation.dimensions}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Stock:</span>
                        <span className="detail-value">{selectedVariation.stock} units</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">SKU:</span>
                        <span className="detail-value">{selectedVariation.sku}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="tab-panel reviews-panel">
                <div className="reviews-header">
                  <h2>Customer Reviews</h2>
                  <button 
                    className="add-review-btn"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    {showReviewForm ? 'Cancel' : 'Write a Review'}
                  </button>
                </div>

                {reviewStats && (
                  <div className="review-stats-compact">
                    <div className="average-rating-compact">
                      <h3>{reviewStats.average}</h3>
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="star">
                            {star <= Math.round(reviewStats.average) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <p>{reviewStats.total} reviews</p>
                    </div>
                    <div className="rating-breakdown-compact">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="rating-bar">
                          <span>{rating} ★</span>
                          <div className="bar-container">
                            <div 
                              className="bar" 
                              style={{ 
                                width: `${(reviewStats.ratings[rating] / reviewStats.total) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span>{reviewStats.ratings[rating]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Form */}
                {showReviewForm && (
                  <div className="review-form-container">
                    <h3>Write Your Review</h3>
                    <form className="review-form" onSubmit={handleReviewSubmit}>
                      <div className="star-rating">
                        <label>Rating:</label>
                        <div className="stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`star ${star <= (hoverRating || reviewRating) ? 'active' : ''}`}
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                            >
                              {star <= (hoverRating || reviewRating) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="review-message">Your Review:</label>
                        <textarea
                          id="review-message"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your experience with this product..."
                          rows="4"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="review-files">Add Images (optional):</label>
                        <input
                          type="file"
                          id="review-files"
                          multiple
                          accept="image/*"
                          onChange={(e) => setReviewFiles(Array.from(e.target.files))}
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="submit-review"
                        disabled={submittingReview}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Reviews List - Infinite Slider */}
                <div className="reviews-slider-wrapper">
                  {reviewLoading ? (
                    <div className="loading">
                      <Loader size="small" />
                      <p>Loading reviews...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="reviews-slider-track">
                      {/* Triple the reviews for infinite effect */}
                      {[...reviews, ...reviews, ...reviews].map((review, index) => (
                        <div key={`review-${index}`} className="review-card-slider">
                          <div className="review-header">
                            <div className="reviewer-info">
                              {getReviewerImage(review) ? (
                                <img 
                                  src={getReviewerImage(review)} 
                                  alt={getReviewerName(review)} 
                                  className="reviewer-avatar"
                                />
                              ) : (
                                <div 
                                  className="reviewer-avatar-initials"
                                  style={{
                                    background: `linear-gradient(135deg, ${getAvatarColor(getReviewerName(review)).from}, ${getAvatarColor(getReviewerName(review)).to})`
                                  }}
                                >
                                  {getUserInitials(getReviewerName(review))}
                                </div>
                              )}
                              <div>
                                <h4>{getReviewerName(review)}</h4>
                                <div className="stars">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className="star">
                                      {star <= review.rating ? '★' : '☆'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {review.verified_purchase && (
                              <span className="verified-badge">Verified Purchase</span>
                            )}
                          </div>
                          <p className="review-text">{review.review}</p>
                          <p className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
                  )}
                </div>
              </div>
            )}
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

      </div>
      <div className="background">
      <Testimonials />
      </div>
      <Newsletter />
      <Footer />
    </>
  );
};

export default Productinner;
