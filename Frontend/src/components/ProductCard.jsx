import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { getAllPublicProducts } from '../services/publicindex';
import bg from "../assets/Vector 1.webp";
import placeholderImage from "../assets/placeholder-image.webp";
import "../Styles/components/Productcard.css";

const ProductCard = ({ product: propProduct }) => {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, wishlistItems } = useWishlist();
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [product, setProduct] = useState(propProduct);
  const [loading, setLoading] = useState(!propProduct);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!propProduct) {
        try {
          const response = await getAllPublicProducts({ limit: 1 });
          if (response.success && response.data.products.length > 0) {
            setProduct(response.data.products[0]);
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          toast.error('Failed to load product');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [propProduct]);

  // Get primary image or first image from ProductImages array
  const getProductImage = (product) => {
    if (!product?.ProductImages?.length) {
      return null;
    }
    
    // Try to find primary image first
    const primaryImage = product.ProductImages.find(img => img.is_primary);
    if (primaryImage) {
      return primaryImage.image_url;
    }
    
    // If no primary image, return first image
    return product.ProductImages[0].image_url;
  };

  // Get price from first variation
  const getProductPrice = (product) => {
    if (!product?.ProductVariations?.length) return { price: 0, comparePrice: null };
    const variation = product.ProductVariations[0];
    const currentPrice = variation.price || 0;
    const originalPrice = variation.comparePrice || currentPrice;
    
    // Ensure original price is higher than current price
    const comparePrice = originalPrice > currentPrice ? originalPrice : currentPrice;
    const price = originalPrice > currentPrice ? currentPrice : originalPrice;
    
    return {
      price,
      comparePrice,
      discountAmount: comparePrice - price
    };
  };

  const isInWishlist = product ? wishlistItems.some(item => item.id === product.id) : false;

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!product) return;

    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!product) return;

    // Get the first variation for the product
    const variation = product.ProductVariations?.[0];
    if (!variation) {
      toast.error('Product variation not available');
      return;
    }

    // Get the image path - ensure we have a valid image
    const imagePath = getProductImage(product);
    
    console.log('=== PRODUCT CARD - ADD TO CART ===');
    console.log('Product:', product);
    console.log('Variation:', variation);
    console.log('Variation price:', variation.price, 'Type:', typeof variation.price);
    console.log('Image path:', imagePath);
    
    const cartProduct = {
      id: product.id,
      name: product.name || 'Unknown Product',
      price: Number(variation.price) || 0,
      comparePrice: Number(variation.comparePrice) || Number(variation.price) || 0,
      image: imagePath, // This is just the path, will be converted to full URL in display components
      variation: {
        id: variation.id,
        weight: variation.weight || 0,
        weightUnit: variation.weightUnit || 'g',
        sku: variation.sku || ''
      },
      ProductImages: product.ProductImages || [],
      ProductVariations: product.ProductVariations || []
    };

    console.log('Cart product being added:', cartProduct);
    addToCart(cartProduct, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // If loading or no product is provided, show a placeholder
  if (loading || !product) {
    return (
      <div className="products-card">
        <div className="card">
          <div className="heart">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              fill="currentColor"
              className="bi bi-heart"
              viewBox="0 0 16 16"
            >
              <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
            </svg>
          </div>
          <div className="product-img">
            <img src={placeholderImage} className="img-fluid" alt="placeholder" />
          </div>
          <div>
            <img src={bg} className="img-fluid" alt="bg" />
          </div>
          <div>
            <p className="product-name">{loading ? 'Loading...' : 'No product available'}</p>
            <p className="rating">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#FACC15"
                className="bi bi-star-fill"
                viewBox="0 0 16 16"
              >
                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
              </svg>
              <span>0.0</span>
            </p>
          </div>
          <div className="product-price">
            <div className="prices">
              <p className="discount-price">₹0.00</p>
              <p className="current-price">₹0.00</p>
            </div>
            <div className="product-cart">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-basket"
                viewBox="0 0 16 16"
              >
                <path d="M5.757 1.071a.5.5 0 0 1 .172.686L3.383 6h9.234L10.07 1.757a.5.5 0 1 1 .858-.514L13.783 6H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1v4.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 13.5V9a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.217L5.07 1.243a.5.5 0 0 1 .686-.172zM2 9v4.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V9zM1 7v1h14V7zm3 3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 4 10m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 6 10m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 10m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { price, comparePrice, discountAmount } = getProductPrice(product);
  const imageUrl = product ? `${import.meta.env.VITE_API_URL}${getProductImage(product)}` : '';

  return (
    <div className="products-card">
      <div className="card" onClick={() => navigate(`/productinner/${product.id}`)}>
        <div className="heart" onClick={handleWishlistToggle}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            fill={isInWishlist ? "#ff4d4d" : "currentColor"}
            className="bi bi-heart"
            viewBox="0 0 16 16"
          >
            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
          </svg>
        </div>
        <div className="product-img">
          <img 
            src={imageError ? placeholderImage : imageUrl}
            className="img-fluid" 
            alt={product.name}
            onError={handleImageError}
          />
        </div>
        <div>
          <img src={bg} className="img-fluid" alt="bg" />
        </div>
        <div>
          <p className="product-name">{product.name}</p>
          <p className="rating">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="#FACC15"
              className="bi bi-star-fill"
              viewBox="0 0 16 16"
            >
              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
            </svg>
            <span>{product.avg_rating || '0.0'}</span>
          </p>
        </div>
        <div className="product-price">
          <div className="prices">
            <p className="discount-price">₹{Number(price).toFixed(2)}</p>
            <p className="current-price">₹{Number(comparePrice).toFixed(2)}</p>
            
          </div>
          <div className="product-cart" onClick={handleAddToCart}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              className="bi bi-basket"
              viewBox="0 0 16 16"
            >
              <path d="M5.757 1.071a.5.5 0 0 1 .172.686L3.383 6h9.234L10.07 1.757a.5.5 0 1 1 .858-.514L13.783 6H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1v4.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 13.5V9a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.217L5.07 1.243a.5.5 0 0 1 .686-.172zM2 9v4.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V9zM1 7v1h14V7zm3 3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 4 10m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 6 10m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 10m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
