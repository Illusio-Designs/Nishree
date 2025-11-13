import React from "react";
import "../Styles/components/Testimonials.css";
import img1 from "../assets/img (1).webp";
import img2 from "../assets/img (2).webp";
import img3 from "../assets/img (3).webp";

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-star-fill star"
    viewBox="0 0 16 16"
  >
    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
  </svg>
);

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      image: img1,
      text: '"The spices are incredibly fresh and authentic. Love using them in my cooking!"',
    },
    {
      id: 2,
      name: "Michael Chen",
      image: img2,
      text: '"Best buttermilk masala I\'ve ever tried. Reminds me of homemade chaas!"',
    },
    {
      id: 3,
      name: "John Roi",
      image: img3,
      text: '"The papads are perfectly crispy and full of flavor. A must-have!"',
    },
  ];

  return (
    <section className="testimonials">
      <h1 className="text-center">
        <span>What Our</span> Customers Say
      </h1>
      <div className="testimonials-container">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <div className="user-info">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="user-avatar"
              />
              <div className="name-stars">
                <h3>{testimonial.name}</h3>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
              </div>
            </div>
            <p className="testimonial-text">{testimonial.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
