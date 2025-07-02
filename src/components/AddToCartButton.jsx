import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useSelector } from 'react-redux';
import { FaMinus, FaPlus, FaShoppingCart, FaSadTear } from 'react-icons/fa';
import { BsCart4 } from 'react-icons/bs';
import ProductRequestModal from './ProductRequestModal';

const AddToCartButton = ({ data, quantity = 1 }) => {
  const { fetchCartItem, updateCartItem, deleteCartItem } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const [isAvailableCart, setIsAvailableCart] = useState(false);
  const [qty, setQty] = useState(0);
  const [cartItemDetails, setCartItemsDetails] = useState();
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);

      // Prepare cart data with selected pricing option if available
      const cartData = {
        productId: data?._id,
        quantity: quantity,
      };

      // Include selected price option if it exists
      if (data.selectedPriceOption) {
        cartData.priceOption = data.selectedPriceOption;
        cartData.selectedPrice = data.selectedPrice;
      }

      const response = await Axios({
        ...SummaryApi.addTocart,
        data: cartData,
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

  const handleRequestClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRequestModal(true);
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

  // Check if product is not available for production
  if (!data.productAvailability) {
    return (
      <>
        <button
          onClick={handleRequestClick}
          className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-3 px-6 rounded-md transition flex items-center justify-center border border-yellow-300"
        >
          <FaSadTear className="mr-2" />
          Not in Production - Request Notification
        </button>

        {showRequestModal && (
          <ProductRequestModal
            product={data}
            onClose={() => setShowRequestModal(false)}
            isDiscontinued={true}
          />
        )}
      </>
    );
  }

  // Check if out of stock but still available for production
  if (!data.productAvailability) {
    return (
      <>
        <button
          onClick={handleRequestClick}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-3 px-6 rounded-md transition flex items-center justify-center"
        >
          <BsCart4 className="mr-2" />
          Notify When Available
        </button>

        {showRequestModal && (
          <ProductRequestModal
            product={data}
            onClose={() => setShowRequestModal(false)}
            isDiscontinued={false}
          />
        )}
      </>
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
              <BsCart4 className="mr-2" /> Add to Cart
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;
