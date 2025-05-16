import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import "../Styles/Productinner.css";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { getPublicProductById } from "../services/publicindex";
import offer from "../assets/offer.png";
import truck from "../assets/truck.png";
import returnimg from "../assets/return.png";
import secure from "../assets/secure.png";
import about from "../assets/img (4).png";
import div1 from "../assets/div (4).png";
import div2 from "../assets/div (5).png";
import div3 from "../assets/div (6).png";
import div4 from "../assets/div (7).png";
import div5 from "../assets/div (8).png";
import div6 from "../assets/div (9).png";
import div7 from "../assets/div (10).png";
import div8 from "../assets/div (11).png";
import card1 from "../assets/img (5).png";
import card2 from "../assets/img (6).png";
import card3 from "../assets/img (7).png";

const DUMMY_PRODUCT = {
  name: "Sample Product",
  description: "This is a sample product description. It highlights the features and benefits of the product in a concise way.",
  category: { name: "Sample Category" },
  ProductVariations: [
    { id: 1, weight: "100", weightUnit: "g", price: "99.00", comparePrice: "120.00" },
    { id: 2, weight: "200", weightUnit: "g", price: "179.00", comparePrice: "220.00" },
  ],
  ProductImages: [
    { id: 1, image_url: "/dummy1.png", alt_text: "Sample Image 1", display_order: 0 },
    { id: 2, image_url: "/dummy2.png", alt_text: "Sample Image 2", display_order: 1 },
  ],
};

const legacy = [
  { id: 1, image: div6, name: "For Curries", text: "Add 1-2 teaspoons to curries for a rich flavor" },
  { id: 2, image: div7, name: "For Vegetables", text: "Sprinkle over roasted vegetables for a spicy kick" },
  { id: 3, image: div8, name: "For Marinades", text: "Use as a marinade base for meats and paneer" },
];

const blogPosts = [
  { image: card1, title: "Authentic Garam Masala Curry" },
  { image: card2, title: "Spiced Roasted Vegetables" },
  { image: card3, title: "Masala Marinade Grilled Chicken" },
];

const Productinner = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDummy, setShowDummy] = useState(false);

  // Fallback to dummy content if API is slow (2s)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setShowDummy(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getPublicProductById(id);
        if (response.success && response.data) {
          let productData;
          if (Array.isArray(response.data.products)) {
            productData = response.data.products[0];
          } else if (response.data.products) {
            productData = response.data.products;
          } else {
            productData = response.data;
          }
          setProduct(productData);
          if (productData.ProductVariations?.length > 0) {
            setSelectedVariation(productData.ProductVariations[0]);
          }
          if (productData.ProductImages?.length > 0) {
            setSelectedImage(productData.ProductImages[0]);
          }
        } else {
          setError("Product data not found in response");
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch product");
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Use dummy if error or slow
  const displayProduct = (!loading && !error && product) ? product : DUMMY_PRODUCT;
  const displayVariation = (!loading && !error && selectedVariation) ? selectedVariation : DUMMY_PRODUCT.ProductVariations[0];
  const displayImage = (!loading && !error && selectedImage) ? selectedImage : DUMMY_PRODUCT.ProductImages[0];

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

  const handleVariationChange = (e) => {
    const variationId = parseInt(e.target.value);
    const variation = product.ProductVariations.find(v => v.id === variationId);
    setSelectedVariation(variation);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product || typeof product !== 'object') return <div>Product not found</div>;

  return (
    <>
      <Header />
      <div className="background product-inner section">
        <div className="product-detail-container" style={{display:'flex',flexWrap:'wrap',gap:'40px',justifyContent:'center',background:'#fff',borderRadius:'16px',boxShadow:'0 2px 16px #0001',padding:'32px 16px',margin:'32px auto',maxWidth:'1100px'}}>
          {/* Image Gallery */}
          <div className="product-gallery" style={{flex:'1 1 350px',minWidth:'320px',maxWidth:'420px',display:'flex',flexDirection:'column',alignItems:'center'}}>
            {displayImage && (
              <img
                src={displayImage.image_url.startsWith("/uploads") ? `${import.meta.env.VITE_API_URL}${displayImage.image_url}` : displayImage.image_url}
                alt={displayImage.alt_text || displayProduct.name}
                style={{width:'100%',maxWidth:'350px',height:'350px',objectFit:'contain',borderRadius:'12px',background:'#fafafa',boxShadow:'0 2px 8px #0001'}}
                onError={e => {e.target.onerror=null; e.target.src='https://via.placeholder.com/350x350?text=Image+Not+Found';}}
              />
            )}
            <div style={{display:'flex',gap:'10px',marginTop:'16px',flexWrap:'wrap',justifyContent:'center'}}>
              {displayProduct?.ProductImages?.map((image) => (
                <img
                  key={image.id}
                  src={image.image_url.startsWith("/uploads") ? `${import.meta.env.VITE_API_URL}${image.image_url}` : image.image_url}
                  alt={image.alt_text || `${displayProduct.name} - ${image.display_order + 1}`}
                  style={{width:'60px',height:'60px',objectFit:'contain',borderRadius:'6px',border:displayImage?.id===image.id?'2px solid #dc2626':'1px solid #eee',cursor:'pointer',background:'#fff'}}
                  onClick={() => { if (!loading && !error) setSelectedImage(image); }}
                  onError={e => {e.target.onerror=null; e.target.src='https://via.placeholder.com/60x60?text=Image+Not+Found';}}
                />
              ))}
            </div>
          </div>
          {/* Product Info */}
          <div className="product-info" style={{flex:'2 1 400px',minWidth:'320px',maxWidth:'600px',display:'flex',flexDirection:'column',gap:'18px',justifyContent:'flex-start'}}>
            {displayProduct?.category && (
              <div style={{background:'#dc2626',color:'#fff',display:'inline-block',padding:'6px 22px',borderRadius:'20px',fontWeight:'bold',fontSize:'1rem',marginBottom:'8px'}}>{displayProduct.category.name}</div>
            )}
            <h1 style={{fontSize:'2.2rem',fontWeight:700,margin:'0 0 8px'}}>{displayProduct?.name}</h1>
            <div style={{fontSize:'1.1rem',color:'#555',marginBottom:'8px'}}>{displayProduct?.description}</div>
            {/* Variations */}
            {displayProduct?.ProductVariations?.length > 0 && (
              <div style={{margin:'12px 0'}}>
                <label htmlFor="variation" style={{fontWeight:500,marginRight:'10px'}}>Select:</label>
                <select
                  id="variation"
                  className="weight-select"
                  value={displayVariation?.id}
                  onChange={e => { if (!loading && !error) setSelectedVariation(displayProduct.ProductVariations.find(v => v.id === parseInt(e.target.value))); }}
                  style={{padding:'8px 18px',fontSize:'1rem',borderRadius:'6px',border:'1px solid #ddd'}}
                  disabled={!!error || !!loading}
                >
                  {displayProduct.ProductVariations.map((variation) => (
                    <option key={variation.id} value={variation.id}>
                      {variation.weight}{variation.weightUnit} - ₹{variation.price}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Price */}
            {displayVariation && (
              <div style={{display:'flex',alignItems:'center',gap:'16px',margin:'8px 0'}}>
                <span style={{color:'#dc2626',fontSize:'2rem',fontWeight:700}}>₹{displayVariation.price}</span>
                {displayVariation.comparePrice && (
                  <span style={{color:'#888',fontSize:'1.1rem',textDecoration:'line-through'}}>₹{displayVariation.comparePrice}</span>
                )}
              </div>
            )}
            {/* Actions */}
            <div style={{display:'flex',gap:'18px',margin:'18px 0'}}>
              <button className="btn-red" style={{padding:'12px 32px',fontSize:'1.1rem',borderRadius:'999px',background:'#dc2626',color:'#fff',border:'none',fontWeight:600,cursor:'pointer'}} disabled={!!error || !!loading}>Add to Cart</button>
              <button className="buy-btn" style={{padding:'12px 32px',fontSize:'1.1rem',borderRadius:'999px',background:'#1f2937',color:'#fff',border:'none',fontWeight:600,cursor:'pointer'}} disabled={!!error || !!loading}>Buy Now</button>
            </div>
            {/* Offers */}
            <div style={{background:'#f9f9f9',padding:'18px',borderRadius:'10px',margin:'10px 0'}}>
              <h3 style={{margin:'0 0 10px',fontWeight:600,display:'flex',alignItems:'center',gap:'8px'}}><img src={offer} alt="offer" height="20px"/> Offers</h3>
              <ul style={{paddingLeft:'18px',margin:0}}>
                <li>Upto ₹12.09 cashback as Amazon Pay Balance when you pay with…</li>
                <li>Free delivery on your first order</li>
                <li>Secure transaction guaranteed</li>
              </ul>
            </div>
            {/* Icons */}
            <div style={{display:'flex',gap:'32px',marginTop:'18px',flexWrap:'wrap'}}>
              <div style={{textAlign:'center'}}>
                <img src={truck} alt="truck" style={{width:'40px',height:'40px'}} />
                <div style={{fontSize:'0.95rem',marginTop:'6px'}}>Free Delivery</div>
              </div>
              <div style={{textAlign:'center'}}>
                <img src={returnimg} alt="return" style={{width:'40px',height:'40px'}} />
                <div style={{fontSize:'0.95rem',marginTop:'6px'}}>Non-Returnable</div>
              </div>
              <div style={{textAlign:'center'}}>
                <img src={secure} alt="secure" style={{width:'40px',height:'40px'}} />
                <div style={{fontSize:'0.95rem',marginTop:'6px'}}>Secure transaction</div>
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
              <p>{displayProduct?.description}</p>
              <div>
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#DC2626" className="bi bi-check2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                  </svg> Made with premium quality ingredients
                </p>
              </div>
              <div>
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#DC2626" className="bi bi-check2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                  </svg> No artificial colors or preservatives
                </p>
              </div>
              <div>
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#DC2626" className="bi bi-check2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                  </svg> Versatile and easy to use in various recipes
                </p>
              </div>
            </div>
            <div className="about-img">
              <img src={about} className="img-fluid" alt="about" />
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
                    <img src={legacy.image} alt={legacy.name} className="user-avatar" />
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
            <span>Nutritional</span> Facts
          </h1>
          <div className="fact-content">
            <p className="serving-title">Per 10g Serving</p>
            <div className="weight">
              <p>Calories</p>
              <p>40</p>
            </div>
            <div className="weight">
              <p>Fats</p>
              <p>2g</p>
            </div>
            <div className="weight">
              <p>Carbohydrates</p>
              <p>5g</p>
            </div>
            <div className="weight">
              <p>Protein</p>
              <p>1g</p>
            </div>
          </div>
        </div>
      </div>
      <Testimonials />
      <div className="background section">
        <div className="blog-section">
          <h2 style={{fontFamily: "inter",textAlign: "center",fontSize: "30px",paddingBottom: "20px"}}>
            Try It With These Recipes
          </h2>
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
      </div>
      <Newsletter />
      <Footer />
    </>
  );
};

export default Productinner;
