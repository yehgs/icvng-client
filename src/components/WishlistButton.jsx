import React, { useState, useEffect, useCallback } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { updateWishlistCount } from '../utils/eventUtils';

// Module-level cache so each productId is only checked once per page load,
// even when multiple WishlistButton instances mount simultaneously.
const statusCache = new Map();

const WishlistButton = ({ product, className = '', iconOnly = false }) => {
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?._id);

  // Derive initial state from localStorage immediately (no flicker for guests)
  useEffect(() => {
    if (!product?._id) return;

    if (!isLoggedIn) {
      try {
        const local = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsFavorite(local.some((item) => item._id === product._id));
      } catch {
        setIsFavorite(false);
      }
      return;
    }

    // Logged-in: check server once, using cache to avoid duplicate requests
    const pid = product._id;

    if (statusCache.has(pid)) {
      setIsFavorite(statusCache.get(pid));
      return;
    }

    // Mark as pending to prevent concurrent duplicate requests
    statusCache.set(pid, false);

    Axios({ ...SummaryApi.checkWishlist(pid) })
      .then((res) => {
        const val = Boolean(res.data?.isInWishlist);
        statusCache.set(pid, val);
        setIsFavorite(val);
      })
      .catch(() => {
        // Silently swallow — don't show toast or console error on page load
        statusCache.delete(pid);
      });
  }, [isLoggedIn, product?._id]); // eslint-disable-line

  const handleToggleWishlist = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      setLoading(true);
      try {
        if (isLoggedIn) {
          const res = await Axios({
            ...SummaryApi.toggleWishlist,
            data: { productId: product._id },
          });

          if (res.data?.success) {
            const added = res.data.action === 'added';
            setIsFavorite(added);
            statusCache.set(product._id, added);
            toast.success(
              added
                ? `${product.name} added to wishlist`
                : `${product.name} removed from wishlist`
            );
            updateWishlistCount();
          }
        } else {
          // Guest — localStorage only
          const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
          const already = wishlist.some((i) => i._id === product._id);

          if (already) {
            localStorage.setItem(
              'wishlist',
              JSON.stringify(wishlist.filter((i) => i._id !== product._id))
            );
            setIsFavorite(false);
            toast.success(`${product.name} removed from wishlist`);
          } else {
            localStorage.setItem('wishlist', JSON.stringify([...wishlist, product]));
            setIsFavorite(true);
            toast.success(`${product.name} added to wishlist`);
          }
          updateWishlistCount();
        }
      } catch (error) {
        const msg = error?.response?.data?.message || 'Failed to update wishlist';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [isLoggedIn, product]
  );

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
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-700" />
        ) : isFavorite ? (
          <FaHeart className="text-red-500" />
        ) : (
          <FaRegHeart className="text-gray-500 hover:text-red-500 transition-colors" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleWishlist}
      className={`flex items-center justify-center gap-2 ${className}`}
      disabled={loading}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-700" />
      ) : isFavorite ? (
        <>
          <FaHeart className="text-red-500" />
          <span>Remove from Wishlist</span>
        </>
      ) : (
        <>
          <FaRegHeart className="text-gray-500 hover:text-red-500 transition-colors" />
          <span>Add to Wishlist</span>
        </>
      )}
    </button>
  );
};

export default WishlistButton;
