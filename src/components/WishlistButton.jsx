import React, { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '../provider/GlobalProvider'; // Updated import path
import toast from 'react-hot-toast';

const WishlistButton = ({ product, className = '', iconOnly = false }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [loading, setLoading] = useState(false);

  const isFavorite = isInWishlist(product._id);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      const added = toggleWishlist(product);
      toast.success(
        added
          ? `${product.name} added to wishlist`
          : `${product.name} removed from wishlist`
      );
    } catch (error) {
      console.error('Error toggling wishlist item:', error);
      toast.error("Couldn't update wishlist");
    } finally {
      setLoading(false);
    }
  };

  // If iconOnly is true, render just the icon button
  if (iconOnly) {
    return (
      <button
        onClick={handleToggleWishlist}
        className={`flex items-center justify-center ${className}`}
        title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-700"></div>
        ) : isFavorite ? (
          <FaHeart className="text-red-500" />
        ) : (
          <FaRegHeart className="text-gray-500 hover:text-red-500 transition-colors" />
        )}
      </button>
    );
  }

  // Default button with text and icon
  return (
    <button
      onClick={handleToggleWishlist}
      className={`flex items-center justify-center gap-2 ${className}`}
      disabled={loading}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-700"></div>
      ) : isFavorite ? (
        <>
          <FaHeart className="text-red-500" />
          <span>{iconOnly ? '' : 'Remove from Wishlist'}</span>
        </>
      ) : (
        <>
          <FaRegHeart className="text-gray-500 hover:text-red-500 transition-colors" />
          <span>{iconOnly ? '' : 'Add to Wishlist'}</span>
        </>
      )}
    </button>
  );
};

export default WishlistButton;
