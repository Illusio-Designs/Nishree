import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Header from "../components/Header";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from '../components/Footer';
import ProductCard from "../components/ProductCard";
import { getPublicCategoryById, getAllPublicProducts } from '../services/publicindex';
import hero from "../assets/productbj.webp";
import vector2 from "../assets/Vector (18).webp";
import vector3 from "../assets/Vector (22).webp";
import vector4 from "../assets/Vector (23).webp";
import vector5 from "../assets/Vector (24).webp";
import "../styles/Product.css";
import Loader from "../components/Loader";
import CookingLoader from "../components/CookingLoader";
import { useSEO } from "../hooks/useSEO";

const Product = () => {
  const { seoData } = useSEO('products');
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [showBestSellersArrows, setShowBestSellersArrows] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const categoryId = searchParams.get('category');
  const bestSellersSliderRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now();
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
        
        // Fetch best sellers (products with reviews, or first 3)
        if (!categoryId) {
          const allProductsResponse = await getAllPublicProducts({ limit: 50 });
          if (allProductsResponse.success && allProductsResponse.data?.products) {
            const productsWithReviews = allProductsResponse.data.products
              .filter(p => p.review_count > 0)
              .sort((a, b) => b.review_count - a.review_count)
              .slice(0, 10);
            
            setBestSellers(productsWithReviews.length > 0 ? productsWithReviews : allProductsResponse.data.products.slice(0, 3));
          }
        }
        
        // Ensure loader shows for at least 3 seconds
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 3000 - elapsedTime);
        setTimeout(() => setLoading(false), remainingTime);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        // Ensure loader shows for at least 3 seconds even on error
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 3000 - elapsedTime);
        setTimeout(() => setLoading(false), remainingTime);
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

  useEffect(() => {
    const checkOverflow = () => {
      if (bestSellersSliderRef.current) {
        const hasOverflow = bestSellersSliderRef.current.scrollWidth > bestSellersSliderRef.current.clientWidth;
        setShowBestSellersArrows(hasOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [bestSellers]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{seoData?.meta_title || 'Products - Nishree'}</title>
          <meta name="description" content={seoData?.meta_description || 'Browse our collection of premium spices and masalas.'} />
          {seoData?.meta_keywords && <meta name="keywords" content={seoData.meta_keywords} />}
          {seoData?.canonical_url && <link rel="canonical" href={seoData.canonical_url} />}
        </Helmet>
        <CookingLoader />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{seoData?.meta_title || 'Products - Nishree'}</title>
        <meta name="description" content={seoData?.meta_description || 'Browse our collection of premium spices and masalas.'} />
        {seoData?.meta_keywords && <meta name="keywords" content={seoData.meta_keywords} />}
        {seoData?.canonical_url && <link rel="canonical" href={seoData.canonical_url} />}
      </Helmet>
      <Header />
      <div className='collection'>
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
      </div>
      
      <div className="background section">
        <div className="products">
          <div className="products-heading">
            <h1>
              <span>{category ? category.name : 'Our'}</span> products
            </h1>
          </div>
          {error ? (
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
        {!category && bestSellers.length > 0 && (
          <div className="products">
            <div className="products-heading">
              <h1>
                <span>Our</span> Best Seller 
              </h1>
            </div>
            <div className="product-slider-wrapper">
              {showBestSellersArrows && (
                <button 
                  className="slider-arrow slider-arrow-left" 
                  onClick={() => {
                    if (bestSellersSliderRef.current) {
                      bestSellersSliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                    }
                  }}
                >
                  <FaChevronLeft />
                </button>
              )}
              <div className="product-slider" ref={bestSellersSliderRef}>
                {bestSellers.map((product) => (
                  <div key={product.id} className="product-slider-item">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {showBestSellersArrows && (
                <button 
                  className="slider-arrow slider-arrow-right" 
                  onClick={() => {
                    if (bestSellersSliderRef.current) {
                      bestSellersSliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                    }
                  }}
                >
                  <FaChevronRight />
                </button>
              )}
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
