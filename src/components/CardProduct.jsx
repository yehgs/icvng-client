import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { valideURLConvert } from '../utils/valideURLConvert';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import { useGlobalContext, useCurrency } from '../provider/GlobalProvider';
import { useSelector } from 'react-redux';
import {
  FaShoppingCart,
  FaStar,
  FaShippingFast,
  FaClock,
  FaCalendarAlt,
  FaSadTear,
  FaShare,
  FaPlus,
  FaMinus,
} from 'react-icons/fa';
import { BsCart4 } from 'react-icons/bs';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import WishlistButton from './WishlistButton';
import CompareButton from './CompareButton';
import ProductRequestModal from './ProductRequestModal';

const CardProduct = ({ data }) => {
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPriceOption, setSelectedPriceOption] = useState(null);
  const [quickCartLoading, setQuickCartLoading] = useState(false);
  const [quickCartQty, setQuickCartQty] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState(null);

  const navigate = useNavigate();
  const {
    getEffectiveStock,
    fetchCartItem,
    updateCartItem,
    deleteCartItem,
    isLoggedIn,
    guestCart,
    addToGuestCart,
    updateGuestCartItem,
    removeFromGuestCart,
  } = useGlobalContext();
  const { formatPrice, selectedCurrency } = useCurrency();
  const cartItem = useSelector((state) => state.cartItem.cart);

  // Get effective stock for display purposes only
  const effectiveStock = getEffectiveStock(data);

  // Check if item is in cart (both guest and logged-in)
  useEffect(() => {
    if (isLoggedIn) {
      const cartProduct = cartItem.find(
        (item) => item.productId._id === data._id
      );
      if (cartProduct) {
        setIsInCart(true);
        setQuickCartQty(cartProduct.quantity);
        setCartItemId(cartProduct._id);
      } else {
        setIsInCart(false);
        setQuickCartQty(0);
        setCartItemId(null);
      }
    } else {
      const guestItem = guestCart.find((item) => item.productId === data._id);
      if (guestItem) {
        setIsInCart(true);
        setQuickCartQty(guestItem.quantity);
        setCartItemId(null); // Guest cart doesn't have _id
      } else {
        setIsInCart(false);
        setQuickCartQty(0);
        setCartItemId(null);
      }
    }
  }, [cartItem, guestCart, data._id, isLoggedIn]);

  // Listen for currency changes
  useEffect(() => {
    const handleCurrencyChange = () => {
      // Force re-render when currency changes
      setSelectedPriceOption(selectedPriceOption);
    };

    window.addEventListener('currency-changed', handleCurrencyChange);
    return () =>
      window.removeEventListener('currency-changed', handleCurrencyChange);
  }, [selectedPriceOption]);

  const getRoastLevelInfo = () => {
    if (!data.roastLevel) return null;

    const levels = {
      LIGHT: { color: 'text-amber-300', label: 'Light Roast' },
      MEDIUM: { color: 'text-amber-600', label: 'Medium Roast' },
      DARK: { color: 'text-amber-900', label: 'Dark Roast' },
    };

    return levels[data.roastLevel] || null;
  };

  const getIntensityLevel = () => {
    if (!data.intensity) return null;

    const level = parseInt(data.intensity.split('/')[0]);
    const total = parseInt(data.intensity.split('/')[1]);

    return { level, total };
  };

  const getProductInfo = () => {
    let details = [];

    if (data.unit) details.push(data.unit);
    if (data.packaging) details.push(data.packaging);
    if (data.weight) details.push(`${data.weight}g`);

    return details.join(' • ');
  };

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

    return badges.slice(0, 2);
  };

  // Get pricing options - all options available regardless of stock
  const getPricingOptions = () => {
    const options = [];

    // Regular price option
    if (data.price > 0) {
      options.push({
        price: data.price,
        label: 'Regular',
        icon: <FaShippingFast className="w-3 h-3" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        key: 'regular',
      });
    }

    // 3-week delivery if price exists
    if (data.price3weeksDelivery > 0) {
      options.push({
        price: data.price3weeksDelivery,
        label: '3 Weeks',
        icon: <FaClock className="w-3 h-3" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        key: '3weeks',
      });
    }

    // 5-week delivery if price exists
    if (data.price5weeksDelivery > 0) {
      options.push({
        price: data.price5weeksDelivery,
        label: '5 Weeks',
        icon: <FaCalendarAlt className="w-3 h-3" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        key: '5weeks',
      });
    }

    return options;
  };

  // Quick add to cart functionality - no stock validation
  const handleQuickAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setQuickCartLoading(true);

      if (!isLoggedIn) {
        // Handle guest cart
        const cartData = {
          productId: data._id,
          quantity: 1,
          priceOption: selectedPriceOption || 'regular',
          price: data.price,
          discount: data.discount || 0,
          name: data.name,
          image: data.image,
        };

        addToGuestCart(cartData);
        toast.success('Added to cart');
        window.dispatchEvent(new CustomEvent('cart-updated'));
        return;
      }

      const cartData = {
        productId: data._id,
        quantity: 1,
      };

      if (selectedPriceOption) {
        cartData.priceOption = selectedPriceOption;
      }

      const response = await Axios({
        ...SummaryApi.addTocart,
        data: cartData,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success('Added to cart');
        fetchCartItem();
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setQuickCartLoading(false);
    }
  };

  const handleQuickIncreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setQuickCartLoading(true);

      if (!isLoggedIn) {
        updateGuestCartItem(data._id, quickCartQty + 1);
        toast.success('Quantity updated');
        window.dispatchEvent(new CustomEvent('cart-updated'));
      } else {
        const response = await updateCartItem(cartItemId, quickCartQty + 1);
        if (response.success) {
          toast.success('Quantity updated');
          window.dispatchEvent(new CustomEvent('cart-updated'));
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setQuickCartLoading(false);
    }
  };

  const handleQuickDecreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setQuickCartLoading(true);

      if (!isLoggedIn) {
        if (quickCartQty === 1) {
          removeFromGuestCart(data._id);
          toast.success('Removed from cart');
        } else {
          updateGuestCartItem(data._id, quickCartQty - 1);
          toast.success('Quantity updated');
        }
        window.dispatchEvent(new CustomEvent('cart-updated'));
      } else {
        if (quickCartQty === 1) {
          await deleteCartItem(cartItemId);
          toast.success('Removed from cart');
        } else {
          const response = await updateCartItem(cartItemId, quickCartQty - 1);
          if (response.success) {
            toast.success('Quantity updated');
          }
        }
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setQuickCartLoading(false);
    }
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

  const handleQuickCheckout = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If not in cart, add it first
    if (!isInCart) {
      await handleQuickAddToCart(e);
    }

    // Navigate to checkout
    navigate('/checkout');
  };

  const pricingOptions = getPricingOptions();
  const roastInfo = getRoastLevelInfo();
  const intensityInfo = getIntensityLevel();
  const badges = getProductBadges();

  //product details
  // Format product type for display
  const formatProductType = (type) => {
    if (!type) return '';
    return type
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="group relative border hover:shadow-md transition-shadow duration-300 p-3 lg:p-4 flex flex-col rounded-lg cursor-pointer bg-white h-full">
      {/* Floating Action Buttons */}
      <div className="absolute top-2 right-2 z-10 group">
        <WishlistButton
          product={data}
          className="bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all"
          iconOnly={true}
        />

        <div className="opacity-0 group-hover:opacity-100 transform translate-y-0 group-hover:translate-y-2 transition-all duration-300 ease-in-out">
          <div className="mt-2 space-y-2">
            <CompareButton
              product={data}
              className="bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all w-10 h-10 flex items-center justify-center"
              iconOnly={true}
            />

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

      {/* Badge Row */}
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

        {/* Stock display - informational only */}
        {effectiveStock > 0 && (
          <div className="absolute bottom-1 right-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
            {effectiveStock <= 5
              ? `Only ${effectiveStock} left`
              : `Stock: ${effectiveStock}`}
          </div>
        )}

        {/* {effectiveStock === 0 && (
          <div className="absolute bottom-1 right-1 bg-orange-600 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </div>
        )} */}
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

      {/* Brand/Producer */}
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
      {/* {data.productType === 'COFFEE' && intensityInfo && (
        <div className="my-1 space-y-1">
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
        </div>
      )} */}

      {/* Product Details */}
      <div className="text-xs text-gray-500 my-1">{getProductInfo()}</div>

      {/* Rating */}
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

      {/* Pricing Options with Currency Support */}
      {data.productAvailability && pricingOptions.length > 0 && (
        <div className="space-y-2 mb-3">
          {pricingOptions.map((option, index) => (
            <div
              key={index}
              className={`flex items-center justify-between text-xs p-2 rounded cursor-pointer transition-colors ${
                selectedPriceOption === option.key
                  ? `${option.bgColor} ring-2 ring-green-500`
                  : `${option.bgColor} hover:ring-1 hover:ring-gray-300`
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedPriceOption(option.key);
              }}
            >
              <div className={`flex items-center gap-1 ${option.color}`}>
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </div>
              <div className={`font-bold ${option.color}`}>
                {formatPrice(pricewithDiscount(option.price, data.discount))}
                {Boolean(data.discount) && (
                  <div className="text-xs text-gray-400 line-through">
                    {formatPrice(option.price)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto pt-2 border-t space-y-2">
        {!data.productAvailability ? (
          /* Product not available for production */
          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-2 px-3 rounded-md transition flex items-center justify-center border border-yellow-300"
          >
            <FaSadTear className="mr-2 text-yellow-600" />
            <span className="text-sm">Not in Production</span>
          </button>
        ) : (
          <>
            {/* Quick Add to Cart / Quantity Controls */}
            {!isInCart ? (
              <button
                onClick={handleQuickAddToCart}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-3 rounded-md transition flex items-center justify-center"
                disabled={quickCartLoading}
              >
                {quickCartLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                ) : (
                  <>
                    <BsCart4 className="mr-2" />
                    Add to Cart
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center bg-green-50 border border-green-200 rounded-md">
                <button
                  onClick={handleQuickDecreaseQty}
                  className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-l-md flex items-center justify-center transition"
                  disabled={quickCartLoading}
                >
                  <FaMinus className="text-sm" />
                </button>

                <div className="flex-1 py-2 px-3 bg-white font-semibold text-center">
                  {quickCartLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-700 mx-auto"></div>
                  ) : (
                    quickCartQty
                  )}
                </div>

                <button
                  onClick={handleQuickIncreaseQty}
                  className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-r-md flex items-center justify-center transition"
                  disabled={quickCartLoading}
                >
                  <FaPlus className="text-sm" />
                </button>
              </div>
            )}

            {/* Quick Checkout Button */}
            <button
              onClick={handleQuickCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition flex items-center justify-center"
            >
              <FaShoppingCart className="mr-2" />
              Quick Checkout
            </button>

            {/* Stock Information */}
            {/* {effectiveStock === 0 && (
              <div className="text-xs text-center text-orange-600">
                Currently out of stock - Order will be processed by admin
              </div>
            )} */}
          </>
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
