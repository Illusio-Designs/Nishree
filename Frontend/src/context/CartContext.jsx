import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [buyNowItems, setBuyNowItems] = useState(() => {
    const savedBuyNow = sessionStorage.getItem('buyNowItems');
    return savedBuyNow ? JSON.parse(savedBuyNow) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    console.log('=== ADD TO CART ===');
    console.log('Product received:', product);
    console.log('Product price:', product.price);
    console.log('Product name:', product.name);
    console.log('Product image:', product.image);
    console.log('Product variation:', product.variation);
    
    setCartItems(prev => {
      // Create a unique key based on product id and variation id
      const variationId = product.variation?.id;
      const uniqueKey = variationId ? `${product.id}-${variationId}` : product.id;
      
      const existingItem = prev.find(item => {
        const itemKey = item.variation?.id ? `${item.id}-${item.variation.id}` : item.id;
        return itemKey === uniqueKey;
      });
      
      if (existingItem) {
        return prev.map(item => {
          const itemKey = item.variation?.id ? `${item.id}-${item.variation.id}` : item.id;
          return itemKey === uniqueKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      }
      
      const newItem = { ...product, quantity, uniqueKey };
      console.log('New cart item:', newItem);
      return [...prev, newItem];
    });
  };

  const removeFromCart = (uniqueKey) => {
    setCartItems(prev => prev.filter(item => item.uniqueKey !== uniqueKey));
  };

  const updateQuantity = (uniqueKey, quantity) => {
    if (quantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.uniqueKey === uniqueKey ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const setBuyNow = (product, quantity = 1) => {
    setBuyNowItems(prev => {
      // Create a unique key based on product id and variation id
      const variationId = product.variation?.id;
      const uniqueKey = variationId ? `${product.id}-${variationId}` : product.id;
      
      const existingItem = prev.find(item => {
        const itemKey = item.variation?.id ? `${item.id}-${item.variation.id}` : item.id;
        return itemKey === uniqueKey;
      });
      
      if (existingItem) {
        // Update quantity if item already exists
        const updated = prev.map(item => {
          const itemKey = item.variation?.id ? `${item.id}-${item.variation.id}` : item.id;
          return itemKey === uniqueKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
        sessionStorage.setItem('buyNowItems', JSON.stringify(updated));
        return updated;
      }
      
      // Add new item
      const newItem = { ...product, quantity, uniqueKey };
      const updated = [...prev, newItem];
      sessionStorage.setItem('buyNowItems', JSON.stringify(updated));
      return updated;
    });
  };

  const clearBuyNow = () => {
    setBuyNowItems([]);
    sessionStorage.removeItem('buyNowItems');
  };

  const getBuyNowTotal = () => {
    return buyNowItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return total + (price * quantity);
    }, 0);
  };

  const updateBuyNowQuantity = (uniqueKey, quantity) => {
    if (quantity < 1) return;
    setBuyNowItems(prev => {
      const updated = prev.map(item =>
        item.uniqueKey === uniqueKey ? { ...item, quantity } : item
      );
      sessionStorage.setItem('buyNowItems', JSON.stringify(updated));
      return updated;
    });
  };

  const removeBuyNowItem = (uniqueKey) => {
    setBuyNowItems(prev => {
      const updated = prev.filter(item => item.uniqueKey !== uniqueKey);
      sessionStorage.setItem('buyNowItems', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    buyNowItems,
    setBuyNow,
    clearBuyNow,
    getBuyNowTotal,
    updateBuyNowQuantity,
    removeBuyNowItem
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 