import React, { useState, useEffect, useCallback } from 'react';
import { VscGitCompare } from 'react-icons/vsc';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { updateCompareCount } from '../utils/eventUtils';

// Module-level cache so each productId is only checked once per page load
const statusCache = new Map();

const CompareButton = ({ product, className = '', iconOnly = false }) => {
  const [loading, setLoading] = useState(false);
  const [isInCompare, setIsInCompare] = useState(false);
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?._id);

  useEffect(() => {
    if (!product?._id) return;

    if (!isLoggedIn) {
      try {
        const local = JSON.parse(localStorage.getItem('compareList') || '[]');
        setIsInCompare(local.some((item) => item._id === product._id));
      } catch {
        setIsInCompare(false);
      }
      return;
    }

    // Logged-in: check server once, using cache to avoid duplicate requests
    const pid = product._id;

    if (statusCache.has(pid)) {
      setIsInCompare(statusCache.get(pid));
      return;
    }

    statusCache.set(pid, false);

    Axios({ ...SummaryApi.checkCompare(pid) })
      .then((res) => {
        const val = Boolean(res.data?.isInCompare);
        statusCache.set(pid, val);
        setIsInCompare(val);
      })
      .catch(() => {
        // Silently swallow — never show a toast or console error on page load
        statusCache.delete(pid);
      });
  }, [isLoggedIn, product?._id]); // eslint-disable-line

  const handleToggleCompare = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      setLoading(true);
      try {
        if (isLoggedIn) {
          const res = await Axios({
            ...SummaryApi.toggleCompare,
            data: { productId: product._id },
          });

          if (res.data?.success) {
            const added = res.data.action === 'added';
            setIsInCompare(added);
            statusCache.set(product._id, added);
            toast.success(
              added
                ? `${product.name} added to compare list`
                : `${product.name} removed from compare list`
            );
            updateCompareCount();
          }
        } else {
          // Guest — localStorage only
          const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
          const already = compareList.some((i) => i._id === product._id);

          if (already) {
            localStorage.setItem(
              'compareList',
              JSON.stringify(compareList.filter((i) => i._id !== product._id))
            );
            setIsInCompare(false);
            toast.success(`${product.name} removed from compare list`);
          } else {
            if (compareList.length >= 4) {
              toast.error('You can only compare up to 4 products');
              return;
            }
            localStorage.setItem('compareList', JSON.stringify([...compareList, product]));
            setIsInCompare(true);
            toast.success(`${product.name} added to compare list`);
          }
          updateCompareCount();
        }
      } catch (error) {
        const msg = error?.response?.data?.message || 'Failed to update compare list';
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
        onClick={handleToggleCompare}
        className={`flex items-center justify-center ${className}`}
        title={isInCompare ? 'Remove from compare' : 'Add to compare'}
        aria-label={isInCompare ? 'Remove from compare' : 'Add to compare'}
        disabled={loading}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-secondary-200" />
        ) : (
          <VscGitCompare
            className={`${
              isInCompare ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'
            } transition-colors`}
          />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleCompare}
      className={`flex items-center justify-center gap-2 ${className}`}
      disabled={loading}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-secondary-200" />
      ) : (
        <>
          <VscGitCompare
            className={`${
              isInCompare ? 'text-secondary-100' : 'text-gray-500 hover:text-secondary-100'
            } transition-colors`}
          />
          <span>{isInCompare ? 'Remove from Compare' : 'Add to Compare'}</span>
        </>
      )}
    </button>
  );
};

export default CompareButton;
