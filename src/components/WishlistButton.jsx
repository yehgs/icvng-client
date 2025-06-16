import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { updateWishlistCount } from '../utils/eventUtils';

const WishlistButton = ({ product, className = '', iconOnly = false }) => {
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?._id);

  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (isLoggedIn && product?._id) {
      checkWishlistStatus();
    } else if (!isLoggedIn && product?._id) {
      // Check localStorage for non-logged-in users
      const localWishlist = JSON.parse(
        localStorage.getItem('wishlist') || '[]'
      );
      setIsFavorite(localWishlist.some((item) => item._id === product._id));
    }
  }, [isLoggedIn, product?._id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.checkWishlist(product._id),
      });

      const { data: responseData } = response;
      if (responseData.success) {
        setIsFavorite(responseData.isInWishlist);
      }
    } catch (error) {
      // Silently handle error - don't show toast for status check
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      if (isLoggedIn) {
        // Handle database wishlist for logged-in users
        const response = await Axios({
          ...SummaryApi.toggleWishlist,
          data: {
            productId: product._id,
          },
        });

        const { data: responseData } = response;

        if (responseData.success) {
          const added = responseData.action === 'added';
          setIsFavorite(added);

          toast.success(
            added
              ? `${product.name} added to wishlist`
              : `${product.name} removed from wishlist`
          );

          // Update header count using event utils
          updateWishlistCount();
        }
      } else {
        // Handle localStorage wishlist for non-logged-in users
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const isCurrentlyInWishlist = wishlist.some(
          (item) => item._id === product._id
        );

        if (isCurrentlyInWishlist) {
          // Remove from wishlist
          const updatedWishlist = wishlist.filter(
            (item) => item._id !== product._id
          );
          localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
          setIsFavorite(false);
          toast.success(`${product.name} removed from wishlist`);
        } else {
          // Add to wishlist
          const updatedWishlist = [...wishlist, product];
          localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
          setIsFavorite(true);
          toast.success(`${product.name} added to wishlist`);
        }

        // Update header count using event utils
        updateWishlistCount();
      }
    } catch (error) {
      AxiosToastError(error);
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
        disabled={loading}
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
