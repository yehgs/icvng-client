import React, { useState, useEffect } from 'react';
import { VscGitCompare } from 'react-icons/vsc';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { updateCompareCount } from '../utils/eventUtils';

const CompareButton = ({ product, className = '', iconOnly = false }) => {
  const [loading, setLoading] = useState(false);
  const [isInCompare, setIsInCompare] = useState(false);
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?._id);

  // Check if product is in compare list on component mount
  useEffect(() => {
    if (isLoggedIn && product?._id) {
      checkCompareStatus();
    } else {
      // Check localStorage for non-logged-in users
      const localCompareList = JSON.parse(
        localStorage.getItem('compareList') || '[]'
      );
      setIsInCompare(localCompareList.some((item) => item._id === product._id));
    }
  }, [isLoggedIn, product?._id]);

  const checkCompareStatus = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.checkCompare(product._id),
      });

      const { data: responseData } = response;
      if (responseData.success) {
        setIsInCompare(responseData.isInCompare);
      }
    } catch (error) {
      // Silently handle error - don't show toast for status check
      console.error('Error checking compare status:', error);
    }
  };

  const handleToggleCompare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      if (isLoggedIn) {
        // Handle database compare for logged-in users
        const response = await Axios({
          ...SummaryApi.toggleCompare,
          data: {
            productId: product._id,
          },
        });

        const { data: responseData } = response;

        if (responseData.success) {
          const added = responseData.action === 'added';
          setIsInCompare(added);

          toast.success(
            added
              ? `${product.name} added to compare list`
              : `${product.name} removed from compare list`
          );

          // Update header count using event utils
          updateCompareCount();
        }
      } else {
        // Handle localStorage compare for non-logged-in users
        const compareList = JSON.parse(
          localStorage.getItem('compareList') || '[]'
        );
        const isCurrentlyInCompare = compareList.some(
          (item) => item._id === product._id
        );

        if (isCurrentlyInCompare) {
          // Remove from compare
          const updatedList = compareList.filter(
            (item) => item._id !== product._id
          );
          localStorage.setItem('compareList', JSON.stringify(updatedList));
          setIsInCompare(false);
          toast.success(`${product.name} removed from compare list`);
        } else {
          // Add to compare (limit to 4 items)
          if (compareList.length >= 4) {
            toast.error('You can only compare up to 4 products');
            return;
          }

          const updatedList = [...compareList, product];
          localStorage.setItem('compareList', JSON.stringify(updatedList));
          setIsInCompare(true);
          toast.success(`${product.name} added to compare list`);
        }

        // Update header count using event utils
        updateCompareCount();
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
        onClick={handleToggleCompare}
        className={`flex items-center justify-center ${className}`}
        title={isInCompare ? 'Remove from compare' : 'Add to compare'}
        aria-label={isInCompare ? 'Remove from compare' : 'Add to compare'}
        disabled={loading}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-secondary-200"></div>
        ) : (
          <VscGitCompare
            className={`${
              isInCompare
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-purple-600'
            } transition-colors`}
          />
        )}
      </button>
    );
  }

  // Default button with text and icon
  return (
    <button
      onClick={handleToggleCompare}
      className={`flex items-center justify-center gap-2 ${className}`}
      disabled={loading}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-secondary-200"></div>
      ) : (
        <>
          <VscGitCompare
            className={`${
              isInCompare
                ? 'text-secondary-100'
                : 'text-gray-500 hover:text-secondary-100'
            } transition-colors`}
          />
          <span>{isInCompare ? 'Remove from Compare' : 'Add to Compare'}</span>
        </>
      )}
    </button>
  );
};

export default CompareButton;
