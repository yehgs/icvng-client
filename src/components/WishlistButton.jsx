import React, { useState, useEffect, useCallback } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { updateWishlistCount } from "../utils/eventUtils";
import {
  checkWishlistStatus,
  toggleWishlistOnServer,
  toggleWishlistGuest,
} from "@yehgs/icvng-core/wishlist";
import { useCountry } from '../context/CountryContext.jsx';

// Module-level cache so each productId is only checked once per page load,
// even when multiple WishlistButton instances mount simultaneously.
const statusCache = new Map();

const WishlistButton = ({ product, className = "", iconOnly = false }) => {
  const { t } = useCountry();
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?._id);

  // Derive initial state from localStorage immediately (no flicker for guests)
  useEffect(() => {
    if (!product?._id) return;

    if (!isLoggedIn) {
      try {
        const local = JSON.parse(localStorage.getItem("wishlist") || "[]");
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

    checkWishlistStatus({
      apiClient: Axios,
      endpoints: SummaryApi,
      productId: pid,
    }).then((result) => {
      if (result.success) {
        statusCache.set(pid, result.isInWishlist);
        setIsFavorite(result.isInWishlist);
      } else {
        // Silently swallow — don't show toast or console error on page load
        statusCache.delete(pid);
      }
    });
  }, [isLoggedIn, product?._id]); // eslint-disable-line

  const handleToggleWishlist = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      setLoading(true);
      try {
        if (isLoggedIn) {
          const result = await toggleWishlistOnServer({
            apiClient: Axios,
            endpoints: SummaryApi,
            productId: product._id,
          });

          if (result.success) {
            setIsFavorite(result.added);
            statusCache.set(product._id, result.added);
            toast.success(
              result.added
                ? t('wishlist.addedToWishlist', { name: product.name })
                : t('wishlist.removedFromWishlist', { name: product.name }),
            );
            updateWishlistCount();
          } else {
            toast.error(result.message);
          }
        } else {
          // Guest — localStorage only
          const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
          const { list, added } = toggleWishlistGuest(wishlist, product);
          localStorage.setItem("wishlist", JSON.stringify(list));
          setIsFavorite(added);
          toast.success(
            added
              ? t('wishlist.addedToWishlist', { name: product.name })
              : t('wishlist.removedFromWishlist', { name: product.name }),
          );
          updateWishlistCount();
        }
      } catch (error) {
        const msg =
          error?.response?.data?.message || t('wishlist.failedToUpdate');
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [isLoggedIn, product],
  );

  if (iconOnly) {
    return (
      <button
        onClick={handleToggleWishlist}
        className={`flex items-center justify-center ${className}`}
        title={isFavorite ? t("product.removeFromWishlist") : t("product.addToWishlist")}
        aria-label={isFavorite ? t("product.removeFromWishlist") : t("product.addToWishlist")}
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
          <span>{t('product.removeFromWishlist')}</span>
        </>
      ) : (
        <>
          <FaRegHeart className="text-gray-500 hover:text-red-500 transition-colors" />
          <span>{t('product.addToWishlist')}</span>
        </>
      )}
    </button>
  );
};

export default WishlistButton;
