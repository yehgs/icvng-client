import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalContext, useCurrency } from '../provider/GlobalProvider';
import { FaCaretRight, FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import imageEmpty from '../assets/empty_cart.webp';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const DisplayCartItem = ({ close }) => {
  const {
    notDiscountTotalPrice,
    totalPrice,
    totalQty,
    isLoggedIn,
    guestCart,
    updateGuestCartItem,
    removeFromGuestCart,
    updateCartItem,
    deleteCartItem,
  } = useGlobalContext();

  const { formatPrice } = useCurrency();
  const cartItem = useSelector((state) => state.cartItem.cart);
  const navigate = useNavigate();
  const [loadingItems, setLoadingItems] = useState({});

  // Get current cart based on login status
  const currentCart = isLoggedIn ? cartItem : guestCart;

  const redirectToCheckoutPage = () => {
    navigate('/checkout');
    if (close) {
      close();
    }
  };

  // Get price option label
  const getPriceOptionLabel = (priceOption) => {
    const labels = {
      regular: 'Regular Delivery',
      '3weeks': '3 Weeks Delivery',
      '5weeks': '5 Weeks Delivery',
    };
    return labels[priceOption] || 'Regular Delivery';
  };

  // Get price option color
  const getPriceOptionColor = (priceOption) => {
    const colors = {
      regular: 'bg-green-100 text-green-700 border-green-200',
      '3weeks': 'bg-orange-100 text-orange-700 border-orange-200',
      '5weeks': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[priceOption] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Calculate price for guest item based on price option
  const getGuestItemPrice = (item) => {
    let basePrice = item.price || 0;

    if (item.priceOption === '3weeks' && item.price3weeksDelivery) {
      basePrice = item.price3weeksDelivery;
    } else if (item.priceOption === '5weeks' && item.price5weeksDelivery) {
      basePrice = item.price5weeksDelivery;
    }

    return pricewithDiscount(basePrice, item.discount || 0);
  };

  // Handle guest cart item quantity increase
  const handleGuestIncrease = async (item) => {
    const itemKey = `${item.productId}-${item.priceOption}`;
    setLoadingItems((prev) => ({ ...prev, [itemKey]: true }));

    try {
      updateGuestCartItem(item.productId, item.quantity + 1, item.priceOption);
      toast.success('Quantity updated');
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemKey]: false }));
    }
  };

  // Handle guest cart item quantity decrease
  const handleGuestDecrease = async (item) => {
    const itemKey = `${item.productId}-${item.priceOption}`;
    setLoadingItems((prev) => ({ ...prev, [itemKey]: true }));

    try {
      if (item.quantity === 1) {
        removeFromGuestCart(item.productId, item.priceOption);
        toast.success('Item removed from cart');
      } else {
        updateGuestCartItem(
          item.productId,
          item.quantity - 1,
          item.priceOption
        );
        toast.success('Quantity updated');
      }
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemKey]: false }));
    }
  };

  // Handle guest cart item delete
  const handleGuestDelete = async (item) => {
    const itemKey = `${item.productId}-${item.priceOption}`;
    setLoadingItems((prev) => ({ ...prev, [itemKey]: true }));

    try {
      removeFromGuestCart(item.productId, item.priceOption);
      toast.success('Item removed from cart');
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemKey]: false }));
    }
  };

  // Handle logged-in user cart item quantity increase
  const handleUserIncrease = async (item) => {
    const itemKey = item._id;
    setLoadingItems((prev) => ({ ...prev, [itemKey]: true }));

    try {
      const response = await updateCartItem(item._id, item.quantity + 1);
      if (response.success) {
        toast.success('Quantity updated');
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemKey]: false }));
    }
  };

  // Handle logged-in user cart item quantity decrease
  const handleUserDecrease = async (item) => {
    const itemKey = item._id;
    setLoadingItems((prev) => ({ ...prev, [itemKey]: true }));

    try {
      if (item.quantity === 1) {
        await deleteCartItem(item._id);
        toast.success('Item removed from cart');
      } else {
        const response = await updateCartItem(item._id, item.quantity - 1);
        if (response.success) {
          toast.success('Quantity updated');
        }
      }
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemKey]: false }));
    }
  };

  // Handle logged-in user cart item delete
  const handleUserDelete = async (item) => {
    const itemKey = item._id;
    setLoadingItems((prev) => ({ ...prev, [itemKey]: true }));

    try {
      await deleteCartItem(item._id);
      toast.success('Item removed from cart');
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemKey]: false }));
    }
  };

  // Render guest cart item with full controls
  const renderGuestCartItem = (item, index) => {
    const itemPrice = getGuestItemPrice(item);
    const priceOption = item.priceOption || 'regular';
    const itemKey = `${item.productId}-${priceOption}`;
    const isLoading = loadingItems[itemKey];

    return (
      <div
        key={`${item.productId}-${priceOption}-${index}`}
        className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
      >
        {/* Product Image */}
        <div className="w-20 h-20 min-w-20 bg-white border rounded-lg overflow-hidden">
          <img
            src={item.image?.[0] || '/placeholder-image.jpg'}
            className="object-contain w-full h-full p-1"
            alt={item.name}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          {/* Product Name */}
          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
            {item.name}
          </h4>

          {/* Price Option Badge */}
          <div className="mb-2">
            <span
              className={`text-xs px-2 py-1 rounded-md border ${getPriceOptionColor(
                priceOption
              )}`}
            >
              {getPriceOptionLabel(priceOption)}
            </span>
          </div>

          {/* Price */}
          <p className="font-bold text-green-700 mb-2">
            {formatPrice(itemPrice)}
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGuestDecrease(item)}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white w-8 h-8 rounded-md flex items-center justify-center transition"
            >
              {item.quantity === 1 ? (
                <FaTrash size={12} />
              ) : (
                <FaMinus size={12} />
              )}
            </button>

            <span className="px-3 py-1 bg-white border border-gray-300 rounded-md font-semibold min-w-[50px] text-center">
              {isLoading ? '...' : item.quantity}
            </span>

            <button
              onClick={() => handleGuestIncrease(item)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white w-8 h-8 rounded-md flex items-center justify-center transition"
            >
              <FaPlus size={12} />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => handleGuestDelete(item)}
              disabled={isLoading}
              className="ml-auto text-red-600 hover:text-red-800 disabled:text-gray-400 transition"
              title="Remove item"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render logged-in user cart item with full controls
  const renderLoggedInCartItem = (item, index) => {
    const priceOption = item.priceOption || 'regular';
    const displayPrice = item.selectedPrice || item?.productId?.price || 0;
    const itemKey = item._id;
    const isLoading = loadingItems[itemKey];

    return (
      <div
        key={`${item._id}-${index}`}
        className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
      >
        {/* Product Image */}
        <div className="w-20 h-20 min-w-20 bg-white border rounded-lg overflow-hidden">
          <img
            src={item?.productId?.image[0]}
            className="object-contain w-full h-full p-1"
            alt={item?.productId?.name}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          {/* Product Name */}
          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
            {item?.productId?.name}
          </h4>

          {/* Price Option Badge */}
          <div className="mb-2">
            <span
              className={`text-xs px-2 py-1 rounded-md border ${getPriceOptionColor(
                priceOption
              )}`}
            >
              {getPriceOptionLabel(priceOption)}
            </span>
          </div>

          {/* Price */}
          <p className="font-bold text-green-700 mb-2">
            {formatPrice(displayPrice)}
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUserDecrease(item)}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white w-8 h-8 rounded-md flex items-center justify-center transition"
            >
              {item.quantity === 1 ? (
                <FaTrash size={12} />
              ) : (
                <FaMinus size={12} />
              )}
            </button>

            <span className="px-3 py-1 bg-white border border-gray-300 rounded-md font-semibold min-w-[50px] text-center">
              {isLoading ? '...' : item.quantity}
            </span>

            <button
              onClick={() => handleUserIncrease(item)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white w-8 h-8 rounded-md flex items-center justify-center transition"
            >
              <FaPlus size={12} />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => handleUserDelete(item)}
              disabled={isLoading}
              className="ml-auto text-red-600 hover:text-red-800 disabled:text-gray-400 transition"
              title="Remove item"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-neutral-900 fixed top-0 bottom-0 right-0 left-0 bg-opacity-70 z-50">
      <div className="bg-white w-full max-w-sm min-h-screen max-h-screen ml-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 shadow-md gap-3 justify-between border-b">
          <h2 className="font-semibold text-lg">
            Cart {totalQty > 0 && `(${totalQty})`}
          </h2>
          <Link to={'/'} className="lg:hidden">
            <IoClose size={25} />
          </Link>
          <button
            onClick={close}
            className="hidden lg:block hover:bg-gray-100 p-1 rounded"
          >
            <IoClose size={25} />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto bg-blue-50 p-3">
          {currentCart.length > 0 ? (
            <div className="space-y-4">
              {/* Savings display */}
              {notDiscountTotalPrice > totalPrice && (
                <div className="flex items-center justify-between px-4 py-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
                  <p className="font-medium">Total Savings</p>
                  <p className="font-bold">
                    {formatPrice(notDiscountTotalPrice - totalPrice)}
                  </p>
                </div>
              )}

              {/* Guest user notice */}
              {!isLoggedIn && (
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 text-center">
                  <p className="text-sm text-blue-800 mb-1 font-medium">
                    Shopping as Guest
                  </p>
                  <p className="text-xs text-blue-600">
                    Login or register at checkout to save your cart
                  </p>
                </div>
              )}

              {/* Cart items */}
              <div className="space-y-3">
                {currentCart.map((item, index) => {
                  return isLoggedIn
                    ? renderLoggedInCartItem(item, index)
                    : renderGuestCartItem(item, index);
                })}
              </div>

              {/* Bill details */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-3 text-gray-800">
                  Bill Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Items total</p>
                    <div className="text-right">
                      {notDiscountTotalPrice > totalPrice && (
                        <p className="line-through text-gray-400 text-xs">
                          {formatPrice(notDiscountTotalPrice)}
                        </p>
                      )}
                      <p className="font-semibold text-gray-800">
                        {formatPrice(totalPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Quantity</p>
                    <p className="font-semibold text-gray-800">
                      {totalQty} item{totalQty > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Delivery</p>
                    <p className="font-semibold text-green-600">Free</p>
                  </div>

                  <div className="border-t pt-3 flex justify-between">
                    <p className="font-bold text-lg text-gray-800">Total</p>
                    <p className="font-bold text-lg text-green-700">
                      {formatPrice(totalPrice)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty cart */
            <div className="bg-white flex flex-col justify-center items-center p-8 rounded-lg">
              <img
                src={imageEmpty}
                className="w-full h-full object-scale-down max-w-xs mb-4"
                alt="Empty cart"
              />
              <p className="text-gray-600 text-lg font-medium mb-4">
                Your cart is empty
              </p>
              <Link
                onClick={close}
                to={'/'}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 text-white rounded-lg font-medium transition"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>

        {/* Checkout button - Fixed at bottom */}
        {currentCart.length > 0 && (
          <div className="p-4 bg-white border-t shadow-lg">
            <button
              onClick={redirectToCheckoutPage}
              className="w-full bg-green-700 hover:bg-green-800 text-white px-4 py-4 rounded-lg font-bold text-base flex items-center justify-between transition shadow-md"
            >
              <span>{formatPrice(totalPrice)}</span>
              <span className="flex items-center gap-2">
                {isLoggedIn ? 'Proceed to Checkout' : 'Checkout'}
                <FaCaretRight />
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DisplayCartItem;
