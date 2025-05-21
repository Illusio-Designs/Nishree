import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from "../components/Header";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from '../components/Footer';
import ProductCard from "../components/Productcard";
import { getPublicCategoryById, getAllPublicProducts } from '../services/publicindex';
import hero from "../assets/productbj.png";
import vector2 from "../assets/Vector (18).png";
import vector3 from "../assets/Vector (22).png";
import vector4 from "../assets/Vector (23).png";
import vector5 from "../assets/Vector (24).png";
import "../Styles/Product.css"
import Loader from "../components/Loader";

const Product = () => {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const categoryId = searchParams.get('category');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch category if categoryId is present
        if (categoryId) {
          const categoryData = await getPublicCategoryById(categoryId);
          setCategory(categoryData);
        }

        // Fetch products with pagination and filters
        const params = {
          category: categoryId,
          page: searchParams.get('page') || 1,
          limit: searchParams.get('limit') || 10,
          sort: searchParams.get('sort'),
          search: searchParams.get('search')
        };

        const response = await getAllPublicProducts(params);
        
        if (response.success) {
          setProducts(response.data.products);
          setPagination({
            page: response.data.page,
            totalPages: response.data.totalPages,
            total: response.data.total
          });
        } else {
          throw new Error(response.message || 'Failed to fetch products');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, searchParams]);

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

  return (
    <>
      <Header />
      <div className="hero-section section">
        <div className="hero-img-section">
          <img src={hero} className="img-fluid" alt="hero" />
        </div>
        <div className="hero-product-text">
          <h1>
            {category ? category.name : 'Authenticity in Every Bite'}
          </h1>
          <p>
            {category ? category.description : 'Explore premium products made with the finest ingredients for authentic flavor.'}
          </p>
        </div>
      </div>
      
      <div className="background section">
        <div className="products">
          <div className="products-heading">
            <h1>
              <span>{category ? category.name : 'Our'}</span> products
            </h1>
          </div>
          {loading ? (
            <div className="loading">
              <Loader size="large" />
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="error">Error: {error}</div>
          ) : products.length > 0 ? (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => searchParams.set('page', pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                  <span>Page {pagination.page} of {pagination.totalPages}</span>
                  <button 
                    onClick={() => searchParams.set('page', pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-products">No products found</div>
          )}
        </div>
        {!category && (
          <div className="products">
            <div className="products-heading">
              <h1>
                <span>Our</span> Best Seller 
              </h1>
            </div>
            <div className="products-grid">
              <ProductCard />
            </div>
          </div>
        )}
      </div>

      <div className="whychooseus section">
        <div className="products-heading">
          <h2>
            Why Choose Nishree Products?
          </h2>
        </div>
        <div className="features">
          <div className="feature">
            <div className="feature-icon">
              <img src={vector2} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Authentic Flavors</h4>
              <p>Inspired by traditional Indian recipes</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon premium-icon">
              <img src={vector3} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Premium Quality</h4>
              <p>No artificial colors or preservatives</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={vector4} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Versatile Usage</h4>
              <p>Perfect for traditional and modern recipes</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={vector5} alt="icon" />
            </div>
            <div className="feature-text">
              <h4>Health Benefits</h4>
              <p>Rich in antioxidants, aids digestion</p>
            </div>
          </div>
        </div>
      </div>

      <div className="background section">
        <Testimonials />
      </div>
      <Newsletter />
      <Footer />
    </>
  );
}

export default Product;
