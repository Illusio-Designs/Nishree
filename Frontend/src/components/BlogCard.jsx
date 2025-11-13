import React from "react";
import card1 from "../assets/card1.webp";
import card2 from "../assets/card2.webp";
import card3 from "../assets/card3.webp";

const BlogCard = () => {
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

  return (
    <div className="blog-section">
      <h1 className="text-center">
        Discover the <span>World of Spices</span>
      </h1>
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
  );
};

export default BlogCard;
