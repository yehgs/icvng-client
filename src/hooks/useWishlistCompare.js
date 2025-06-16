import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

export const useWishlistCompare = () => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [compareCount, setCompareCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?._id);

  // Fetch counts from database for logged-in users
  const fetchCounts = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch both counts in parallel
      const [wishlistResponse, compareResponse] = await Promise.all([
        Axios({ ...SummaryApi.getWishlist }),
        Axios({ ...SummaryApi.getCompareList }),
      ]);

      if (wishlistResponse.data.success) {
        setWishlistCount(wishlistResponse.data.data.length);
      }

      if (compareResponse.data.success) {
        setCompareCount(compareResponse.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Get counts from localStorage for non-logged-in users
  const getLocalStorageCounts = useCallback(() => {
    const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const localCompareList = JSON.parse(
      localStorage.getItem('compareList') || '[]'
    );

    setWishlistCount(localWishlist.length);
    setCompareCount(localCompareList.length);
    setLoading(false);
  }, []);

  // Initialize counts
  useEffect(() => {
    if (isLoggedIn) {
      fetchCounts();
    } else {
      getLocalStorageCounts();
    }
  }, [isLoggedIn, fetchCounts, getLocalStorageCounts]);

  // Listen for changes (both localStorage and database updates)
  useEffect(() => {
    const handleCountUpdate = () => {
      if (isLoggedIn) {
        // For logged-in users, refresh from database
        fetchCounts();
      } else {
        // For non-logged-in users, get from localStorage
        getLocalStorageCounts();
      }
    };

    // Listen for storage events and custom events
    window.addEventListener('storage', handleCountUpdate);
    window.addEventListener('wishlist-updated', handleCountUpdate);
    window.addEventListener('compare-updated', handleCountUpdate);

    return () => {
      window.removeEventListener('storage', handleCountUpdate);
      window.removeEventListener('wishlist-updated', handleCountUpdate);
      window.removeEventListener('compare-updated', handleCountUpdate);
    };
  }, [isLoggedIn, fetchCounts, getLocalStorageCounts]);

  // Refresh counts manually (useful after login/logout or for forcing updates)
  const refreshCounts = useCallback(() => {
    if (isLoggedIn) {
      fetchCounts();
    } else {
      getLocalStorageCounts();
    }
  }, [isLoggedIn, fetchCounts, getLocalStorageCounts]);

  return {
    wishlistCount,
    compareCount,
    loading,
    refreshCounts,
  };
};
