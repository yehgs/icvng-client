import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist from localStorage on initial render
  useEffect(() => {
    const loadWishlist = () => {
      try {
        const savedWishlist = localStorage.getItem('wishlist');
        const initialWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
        setWishlistItems(initialWishlist);
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, loading]);

  // Check if a product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  // Add product to wishlist
  const addToWishlist = (product) => {
    if (!isInWishlist(product._id)) {
      setWishlistItems((prev) => [...prev, product]);
      return true;
    }
    return false;
  };

  // Remove product from wishlist
  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    return true;
  };

  // Toggle product in wishlist
  const toggleWishlist = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      return false; // Removed from wishlist
    } else {
      addToWishlist(product);
      return true; // Added to wishlist
    }
  };

  // Clear all wishlist items
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  // Context value
  const value = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook for using the wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
