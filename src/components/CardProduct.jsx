import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';
import { valideURLConvert } from '../utils/valideURLConvert';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import {
  FaShoppingCart,
  FaStar,
  FaCoffee,
  FaShippingFast,
  FaClock,
  FaCalendarAlt,
  FaSadTear,
  FaShare,
  FaBalanceScale,
} from 'react-icons/fa';
import { MdLocalCafe } from 'react-icons/md';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useGlobalContext } from '../provider/GlobalProvider';
import WishlistButton from './WishlistButton';
import CompareButton from './CompareButton';
import ProductRequestModal from './ProductRequestModal';

const CardProduct = ({ data }) => {
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Format product type for display
  const formatProductType = (type) => {
    if (!type) return '';
    return type
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get roast level icon and label
  const getRoastLevelInfo = () => {
    if (!data.roastLevel) return null;

    const levels = {
      LIGHT: { color: 'text-amber-300', label: 'Light Roast' },
      MEDIUM: { color: 'text-amber-600', label: 'Medium Roast' },
      DARK: { color: 'text-amber-900', label: 'Dark Roast' },
    };

    return levels[data.roastLevel] || null;
  };

  // Format coffee intensity level for display
  const getIntensityLevel = () => {
    if (!data.intensity) return null;

    const level = parseInt(data.intensity.split('/')[0]);
    const total = parseInt(data.intensity.split('/')[1]);

    return { level, total };
  };

  // Format product details
  const getProductInfo = () => {
    let details = [];

    if (data.unit) details.push(data.unit);
    if (data.packaging) details.push(data.packaging);
    if (data.weight) details.push(`${data.weight}g`);

    return details.join(' • ');
  };

  // Get product badges and features
  const getProductBadges = () => {
    const badges = [];

    if (data.blend) {
      badges.push({
        label: data.blend,
        class: 'bg-amber-50 text-amber-800',
      });
    }

    if (data.coffeeOrigin) {
      badges.push({
        label: data.coffeeOrigin,
        class: 'bg-green-50 text-green-800',
      });
    }

    if (data.aromaticProfile) {
      badges.push({
        label: data.aromaticProfile,
        class: 'bg-indigo-50 text-indigo-800',
      });
    }

    return badges.slice(0, 2); // Limit to 2 badges to avoid overcrowding
  };

  // Get pricing options based on stock availability
  const getPricingOptions = () => {
    const options = [];

    // Only show regular price if stock > 0
    if (data.stock > 0 && data.price > 0) {
      options.push({
        price: data.price,
        label: 'Regular',
        icon: <FaShippingFast className="w-3 h-3" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      });
    }

    // Always show 3-week delivery if price exists
    if (data.price3weeksDelivery > 0) {
      options.push({
        price: data.price3weeksDelivery,
        label: '3 Weeks',
        icon: <FaClock className="w-3 h-3" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      });
    }

    // Always show 5-week delivery if price exists
    if (data.price5weeksDelivery > 0) {
      options.push({
        price: data.price5weeksDelivery,
        label: '5 Weeks',
        icon: <FaCalendarAlt className="w-3 h-3" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      });
    }

    return options;
  };

  // Handle share functionality
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: data.name,
          text: `Check out this product: ${data.name}`,
          url: window.location.origin + url,
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const productUrl = window.location.origin + url;
    navigator.clipboard
      .writeText(productUrl)
      .then(() => {
        toast.success('Product link copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };

  const handleBuyNowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!data.productAvailability) {
      setShowRequestModal(true);
    } else {
      // Navigate to product page for purchase
      window.location.href = url;
    }
  };

  const roastInfo = getRoastLevelInfo();
  const intensityInfo = getIntensityLevel();
  const badges = getProductBadges();
  const pricingOptions = getPricingOptions();

  return (
    <div className="group relative border hover:shadow-md transition-shadow duration-300 p-3 lg:p-4 flex flex-col rounded-lg cursor-pointer bg-white h-full">
      {/* Floating Action Buttons */}
      <div className="absolute top-2 right-2 z-10 group">
        {/* Main Wishlist Button */}
        <WishlistButton
          product={data}
          className="bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all"
          iconOnly={true}
        />

        {/* Compare and Share Buttons - Animated on Hover */}
        <div className="opacity-0 group-hover:opacity-100 transform translate-y-0 group-hover:translate-y-2 transition-all duration-300 ease-in-out">
          <div className="mt-2 space-y-2">
            {/* Compare Button */}
            <CompareButton
              product={data}
              className="bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all w-10 h-10 flex items-center justify-center"
              iconOnly={true}
            />

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all w-10 h-10 flex items-center justify-center"
              title="Share product"
            >
              <FaShare className="text-gray-500 hover:text-blue-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Badge Row - Keep category at top left */}
      <div className="flex justify-between mb-2">
        {data.productType && (
          <span className="rounded-full text-xs px-2 py-0.5 bg-gray-100 text-gray-600">
            {formatProductType(data.productType)}
          </span>
        )}
        <div className="flex gap-1 mr-7">
          {data.featured && (
            <span className="text-white bg-yellow-500 px-2 py-0.5 text-xs font-medium rounded-full">
              Featured
            </span>
          )}
          {Boolean(data.discount) && (
            <span className="text-white bg-green-600 px-2 py-0.5 text-xs font-medium rounded-full">
              {data.discount}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Image */}
      <Link
        to={url}
        className="relative block h-36 w-full mb-3 flex items-center justify-center bg-gray-50 rounded-md overflow-hidden group-hover:opacity-95 transition-opacity"
      >
        {data.image && data.image.length > 0 ? (
          <img
            src={data.image[0]}
            alt={data.name}
            className="w-full h-full object-contain mix-blend-multiply p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        {/* Stock display - positioned at bottom right of image */}
        {data.stock > 0 && (
          <div className="absolute bottom-1 right-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
            {data.stock <= 5
              ? `Only ${data.stock} left`
              : `Stock: ${data.stock}`}
          </div>
        )}
      </Link>

      {/* Product Name */}
      <Link to={url} className="block">
        <h3 className="font-medium text-gray-800 line-clamp-2 mb-1 hover:text-green-700 transition-colors">
          {data.name}
        </h3>
      </Link>

      {/* SKU */}
      {data.sku && (
        <div className="text-xs text-gray-400 mb-1">SKU: {data.sku}</div>
      )}

      {/* Brand/Producer if available */}
      {data.producer && (
        <div className="text-xs text-gray-500 mb-1">
          by{' '}
          <span className="font-medium">{data.producer.name || 'Brand'}</span>
        </div>
      )}

      {/* Feature Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1 my-1">
          {badges.map((badge, index) => (
            <span
              key={index}
              className={`text-xs px-1.5 py-0.5 rounded-sm ${badge.class}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Coffee-specific details */}
      {data.productType === 'COFFEE' && (
        <div className="my-1 space-y-1">
          {/* Intensity */}
          {intensityInfo && (
            <div className="flex items-center text-xs">
              <span className="mr-1 font-medium">Intensity:</span>
              <div className="flex space-x-0.5">
                {[...Array(intensityInfo.total)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < intensityInfo.level ? 'bg-amber-800' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Details */}
      <div className="text-xs text-gray-500 my-1">{getProductInfo()}</div>

      {/* Rating if available */}
      {data.averageRating > 0 && (
        <div className="flex items-center mb-2">
          <FaStar className="text-amber-400 mr-1" />
          <span className="text-sm font-medium">
            {data.averageRating.toFixed(1)}
          </span>
          {data.ratings && data.ratings.length > 0 && (
            <span className="text-xs text-gray-400 ml-1">
              ({data.ratings.length})
            </span>
          )}
        </div>
      )}

      {/* Pricing Options - Show all available prices */}
      {data.productAvailability && pricingOptions.length > 0 && (
        <div className="space-y-2 mb-3">
          {pricingOptions.map((option, index) => (
            <div
              key={index}
              className={`flex items-center justify-between text-xs p-2 rounded ${option.bgColor}`}
            >
              <div className={`flex items-center gap-1 ${option.color}`}>
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </div>
              <div className={`font-bold ${option.color}`}>
                {DisplayPriceInNaira(
                  pricewithDiscount(option.price, data.discount)
                )}
                {Boolean(data.discount) && (
                  <div className="text-xs text-gray-400 line-through">
                    {DisplayPriceInNaira(option.price)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto pt-2 border-t space-y-2">
        {/* Buy Now Button */}
        {!data.productAvailability ? (
          /* Product discontinued */
          <button
            onClick={handleBuyNowClick}
            className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-2 px-3 rounded-md transition flex items-center justify-center border border-yellow-300"
          >
            <FaSadTear className="mr-2 text-yellow-600" />
            <span className="text-sm">Not in Production</span>
          </button>
        ) : (
          /* Regular buy now button */
          <button
            onClick={handleBuyNowClick}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-3 rounded-md transition flex items-center justify-center"
          >
            <FaShoppingCart className="mr-2" />
            Buy Now
          </button>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <ProductRequestModal
          product={data}
          onClose={() => setShowRequestModal(false)}
          isDiscontinued={!data.productAvailability}
        />
      )}
    </div>
  );
};

export default CardProduct;
