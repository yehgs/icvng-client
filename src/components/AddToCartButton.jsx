import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useSelector } from 'react-redux';
import { FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';

const AddToCartButton = ({ data, quantity = 1 }) => {
  const { fetchCartItem, updateCartItem, deleteCartItem } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const [isAvailableCart, setIsAvailableCart] = useState(false);
  const [qty, setQty] = useState(0);
  const [cartItemDetails, setCartItemsDetails] = useState();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);

      const response = await Axios({
        ...SummaryApi.addTocart,
        data: {
          productId: data?._id,
          quantity: quantity,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchCartItem) {
          fetchCartItem();
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Checking if this item is in cart or not
  useEffect(() => {
    const checkingItem = cartItem.some(
      (item) => item.productId._id === data._id
    );
    setIsAvailableCart(checkingItem);

    const product = cartItem.find((item) => item.productId._id === data._id);
    setQty(product?.quantity || 0);
    setCartItemsDetails(product);
  }, [data, cartItem]);

  const increaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const response = await updateCartItem(cartItemDetails?._id, qty + 1);

    if (response.success) {
      toast.success('Item added');
    }
  };

  const decreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (qty === 1) {
      deleteCartItem(cartItemDetails?._id);
    } else {
      const response = await updateCartItem(cartItemDetails?._id, qty - 1);

      if (response.success) {
        toast.success('Item removed');
      }
    }
  };

  if (data.stock <= 0) {
    return (
      <button
        className="w-full bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-md cursor-not-allowed"
        disabled
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="w-full">
      {isAvailableCart ? (
        <div className="flex items-center w-full">
          <button
            onClick={decreaseQty}
            className="bg-green-700 hover:bg-green-800 text-white h-12 w-12 rounded-l-md flex items-center justify-center transition"
          >
            <FaMinus />
          </button>

          <div className="flex-1 h-12 bg-white border-t border-b border-gray-200 font-semibold flex items-center justify-center">
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-green-700"></div>
            ) : (
              qty
            )}
          </div>

          <button
            onClick={increaseQty}
            className="bg-green-700 hover:bg-green-800 text-white h-12 w-12 rounded-r-md flex items-center justify-center transition"
            disabled={qty >= data.stock}
          >
            <FaPlus />
          </button>
        </div>
      ) : (
        <button
          onClick={handleAddToCart}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-6 rounded-md transition flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
          ) : (
            <>
              <FaShoppingCart className="mr-2" /> Add to Cart
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;
