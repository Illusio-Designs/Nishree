import React from 'react';
import '../Styles/Testimonials.css';
import img1 from "../assets/img (1).png";
import img2 from "../assets/img (2).png";
import img3 from "../assets/img (3).png";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      image: img1,
      text: "\"The spices are incredibly fresh and authentic. Love using them in my cooking!\""
    },
    {
      id: 2,
      name: "Michael Chen",
      image: img2,
      text: "\"Best buttermilk masala I've ever tried. Reminds me of homemade chaas!\""
    },
    {
      id: 3,
      name: "John Roi",
      image: img3,
      text: "\"The papads are perfectly crispy and full of flavor. A must-have!\""
    }
  ];

  return (
    <section className="testimonials">
         <h1 className='text-center'>
            <span>What Our</span> Customers Say
          </h1>
      <div className="testimonials-container">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <div className="user-info">
              <img src={testimonial.image} alt={testimonial.name} className="user-avatar" />
              <h3>{testimonial.name}</h3>
            </div>
            <p className="testimonial-text">{testimonial.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;