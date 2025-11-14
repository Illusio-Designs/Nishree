import React, { useState, useEffect } from "react";
import "../Styles/components/Testimonials.css";
import { getPublicProductReviews } from "../services/publicindex";

const StarIcon = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className={`bi ${filled ? 'bi-star-fill' : 'bi-star'} star`}
    viewBox="0 0 16 16"
  >
    {filled ? (
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
    ) : (
      <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z" />
    )}
  </svg>
);

// Helper function to get user initials
const getUserInitials = (name) => {
  if (!name) return 'U';
  const names = name.trim().split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper function to get avatar color
const getAvatarColor = (name) => {
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
  
  if (!name) return colors[0];
  const index = (name.length + name.charCodeAt(0)) % colors.length;
  return colors[index];
};

const Testimonials = () => {
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all reviews from all products
  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        setLoading(true);
        
        // Fetch all products first
        const productsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/products/public?limit=100`);
        const productsData = await productsResponse.json();
        
        if (productsData.success && productsData.data?.products) {
          // Fetch reviews for each product
          const reviewPromises = productsData.data.products.map(async (product) => {
            try {
              const reviewsResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/api/reviews/public/${product.id}?limit=10`
              );
              const reviewsData = await reviewsResponse.json();
              return reviewsData.reviews || [];
            } catch (error) {
              console.error(`Error fetching reviews for product ${product.id}:`, error);
              return [];
            }
          });

          const reviewsArrays = await Promise.all(reviewPromises);
          // Flatten the array and filter approved reviews
          const allReviewsFlat = reviewsArrays
            .flat()
            .filter(review => review.status === 'approved')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first
          
          setAllReviews(allReviewsFlat);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReviews();
  }, []);

  // If no reviews or still loading, return null
  if (loading || !allReviews || allReviews.length === 0) {
    return null;
  }

  // Get reviewer name from User or guest review
  const getReviewerName = (review) => {
    // Priority: User.username > guestName > 'Anonymous'
    return review.User?.username || review.guestName || 'Anonymous';
  };

  // Get reviewer image
  const getReviewerImage = (review) => {
    const profileImage = review.User?.profileImage;
    if (!profileImage) return null;
    
    // If it's already a full URL, return as is
    if (profileImage.startsWith('http')) return profileImage;
    
    // Otherwise, construct the full URL
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const cleanPath = profileImage.startsWith('/') ? profileImage.slice(1) : profileImage;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  return (
    <section className="testimonials">
      <h1 className="text-center">
        <span>What Our</span> Customers Say
      </h1>
      <div className="testimonials-slider-wrapper">
        <div className="testimonials-slider">
          {/* Triple the reviews for infinite effect */}
          {[...allReviews, ...allReviews, ...allReviews].map((review, index) => {
            const reviewerName = getReviewerName(review);
            const reviewerImage = getReviewerImage(review);
            const avatarColor = getAvatarColor(reviewerName);

            return (
              <div key={`review-${index}`} className="testimonial-card">
                <div className="user-info">
                  {reviewerImage ? (
                    <img
                      src={reviewerImage}
                      alt={reviewerName}
                      className="user-avatar"
                      onError={(e) => {
                        // If image fails to load, replace with initials
                        const initialsDiv = document.createElement('div');
                        initialsDiv.className = 'user-avatar-initials';
                        initialsDiv.style.background = `linear-gradient(135deg, ${avatarColor.from}, ${avatarColor.to})`;
                        initialsDiv.textContent = getUserInitials(reviewerName);
                        e.target.parentNode.replaceChild(initialsDiv, e.target);
                      }}
                    />
                  ) : (
                    <div 
                      className="user-avatar-initials"
                      style={{
                        background: `linear-gradient(135deg, ${avatarColor.from}, ${avatarColor.to})`
                      }}
                    >
                      {getUserInitials(reviewerName)}
                    </div>
                  )}
                  <div className="name-stars">
                    <h3>{reviewerName}</h3>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} filled={star <= review.rating} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="testimonial-text">"{review.review}"</p>
                
                {review.verified_purchase && (
                  <span className="verified-badge-testimonial">✓ Verified Purchase</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
