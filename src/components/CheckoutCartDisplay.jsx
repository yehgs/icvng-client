//client
import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaMinus, FaTrash, FaShoppingBag } from 'react-icons/fa';
import { useGlobalContext, useCurrency } from '../provider/GlobalProvider';
import { useSelector } from 'react-redux';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';

const CheckoutCartDisplay = () => {
  const {
    isLoggedIn,
    guestCart,
    updateGuestCartItem,
    removeFromGuestCart,
    updateCartItem,
    deleteCartItem,
    fetchCartItem,
  } = useGlobalContext();

  const { formatPrice } = useCurrency();
  const cartItem = useSelector((state) => state.cartItem.cart);

  // Get current cart based on login status
  const currentCart = isLoggedIn ? cartItem : guestCart;

  // Handle quantity update for logged-in users
  const handleLoggedInQuantityUpdate = async (cartItemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await deleteCartItem(cartItemId);
        toast.success('Item removed from cart');
      } else {
        const response = await updateCartItem(cartItemId, newQuantity);
        if (response.success) {
          toast.success('Quantity updated');
        }
      }
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Handle quantity update for guest users
  const handleGuestQuantityUpdate = (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        removeFromGuestCart(productId);
        toast.success('Item removed from cart');
      } else {
        updateGuestCartItem(productId, newQuantity);
        toast.success('Quantity updated');
      }
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  // Handle remove item
  const handleRemoveItem = async (item) => {
    try {
      if (isLoggedIn) {
        await deleteCartItem(item._id);
        toast.success('Item removed from cart');
      } else {
        removeFromGuestCart(item.productId);
        toast.success('Item removed from cart');
      }
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      if (isLoggedIn) {
        AxiosToastError(error);
      } else {
        toast.error('Failed to remove item');
      }
    }
  };

  // Calculate item total
  const calculateItemTotal = (item) => {
    if (isLoggedIn && item.productId) {
      const price = pricewithDiscount(
        item.productId.price,
        item.productId.discount
      );
      return price * item.quantity;
    } else if (!isLoggedIn) {
      const price = pricewithDiscount(item.price, item.discount || 0);
      return price * item.quantity;
    }
    return 0;
  };

  // Get item price for display
  const getItemPrice = (item) => {
    if (isLoggedIn && item.productId) {
      return pricewithDiscount(item.productId.price, item.productId.discount);
    } else if (!isLoggedIn) {
      return pricewithDiscount(item.price, item.discount || 0);
    }
    return 0;
  };

  // Get item original price (before discount)
  const getItemOriginalPrice = (item) => {
    if (isLoggedIn && item.productId) {
      return item.productId.price;
    } else if (!isLoggedIn) {
      return item.price;
    }
    return 0;
  };

  // Get item discount
  const getItemDiscount = (item) => {
    if (isLoggedIn && item.productId) {
      return item.productId.discount || 0;
    } else if (!isLoggedIn) {
      return item.discount || 0;
    }
    return 0;
  };

  // Get item name
  const getItemName = (item) => {
    if (isLoggedIn && item.productId) {
      return item.productId.name;
    } else if (!isLoggedIn) {
      return item.name;
    }
    return 'Unknown Product';
  };

  // Get item image
  const getItemImage = (item) => {
    if (isLoggedIn && item.productId && item.productId.image) {
      return item.productId.image[0];
    } else if (!isLoggedIn && item.image) {
      return Array.isArray(item.image) ? item.image[0] : item.image;
    }
    return '/placeholder-image.jpg';
  };

  // Get item identifier for updates
  const getItemId = (item) => {
    return isLoggedIn ? item._id : item.productId;
  };

  if (currentCart.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <FaShoppingBag className="mx-auto text-gray-400 text-4xl mb-3" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-500 mb-4">
          Add some items to your cart to continue shopping
        </p>
        <Link
          to="/"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaShoppingBag className="mr-2 text-green-600" />
          Your Cart ({currentCart.length} item
          {currentCart.length > 1 ? 's' : ''})
        </h3>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {currentCart.map((item, index) => {
          const itemTotal = calculateItemTotal(item);
          const itemPrice = getItemPrice(item);
          const originalPrice = getItemOriginalPrice(item);
          const discount = getItemDiscount(item);
          const itemName = getItemName(item);
          const itemImage = getItemImage(item);
          const itemId = getItemId(item);

          return (
            <div key={`cart-item-${itemId}-${index}`} className="p-4">
              <div className="flex items-start space-x-3">
                {/* Product Image */}
                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={itemImage}
                    alt={itemName}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                    {itemName}
                  </h4>

                  {/* Price Display */}
                  <div className="mt-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {formatPrice(itemPrice)}
                      </span>
                      {discount > 0 && (
                        <span className="text-xs text-gray-500 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => {
                          if (isLoggedIn) {
                            handleLoggedInQuantityUpdate(
                              item._id,
                              item.quantity - 1
                            );
                          } else {
                            handleGuestQuantityUpdate(
                              item.productId,
                              item.quantity - 1
                            );
                          }
                        }}
                        className="p-1 hover:bg-gray-100 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus className="text-xs text-gray-600" />
                      </button>

                      <span className="px-3 py-1 text-sm font-medium text-gray-800 min-w-8 text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => {
                          if (isLoggedIn) {
                            handleLoggedInQuantityUpdate(
                              item._id,
                              item.quantity + 1
                            );
                          } else {
                            handleGuestQuantityUpdate(
                              item.productId,
                              item.quantity + 1
                            );
                          }
                        }}
                        className="p-1 hover:bg-gray-100 transition-colors"
                      >
                        <FaPlus className="text-xs text-gray-600" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Remove item"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold text-gray-800">
                    {formatPrice(itemTotal)}
                  </div>
                  {item.quantity > 1 && (
                    <div className="text-xs text-gray-500">
                      {formatPrice(itemPrice)} each
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Status Info (if needed) */}
              {/* {isLoggedIn && item.productId && (
                <div className="mt-2 text-xs text-gray-500">
                  {item.productId.stock > 0
                    ? `${item.productId.stock} in stock`
                    : 'Available for order (admin processing)'}
                </div>
              )} */}
            </div>
          );
        })}
      </div>

      {/* Continue Shopping Link */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <Link
          to="/"
          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center"
        >
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default CheckoutCartDisplay;
