import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import card1 from "../assets/card1.webp";
import card2 from "../assets/card2.webp";
import card3 from "../assets/card3.webp";

const BlogCard = () => {
  const blogSliderRef = useRef(null);
  const [showBlogArrows, setShowBlogArrows] = useState(false);

  const blogPosts = [
    {
      image: card1,
      title: "5 Tips for Perfectly Spiced Curries",
      description:
        "Master the art of creating perfectly balanced curry dishes...",
    },
    {
      image: card2,
      title: "The Story of Papads in Indian Cuisine",
      description: "Discover the rich history and cultural significance...",
    },
    {
      image: card3,
      title: "Health Benefits of Buttermilk Masalas",
      description: "Learn about the amazing health benefits of our...",
    },
  ];

  useEffect(() => {
    const checkOverflow = () => {
      if (blogSliderRef.current) {
        const hasOverflow = blogSliderRef.current.scrollWidth > blogSliderRef.current.clientWidth;
        setShowBlogArrows(hasOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [blogPosts]);

  const scrollLeft = () => {
    if (blogSliderRef.current) {
      blogSliderRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (blogSliderRef.current) {
      blogSliderRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  return (
    <div className="blog-section">
      <h1 className="text-center">
        Discover the <span>World of Spices</span>
      </h1>
      <div className="blog-slider-wrapper">
        {showBlogArrows && (
          <button 
            className="blog-slider-arrow blog-slider-arrow-left" 
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <FaChevronLeft />
          </button>
        )}
        <div className="blog-cards" ref={blogSliderRef}>
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
        {showBlogArrows && (
          <button 
            className="blog-slider-arrow blog-slider-arrow-right" 
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default BlogCard;
