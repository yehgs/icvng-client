import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { useGlobalContext } from '../provider/GlobalProvider';
import { FaShoppingCart } from 'react-icons/fa';
import ProductRequestModal from './ProductRequestModal';

const SimpleAddToCartButton = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { fetchCartItem } = useGlobalContext();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);

      const response = await Axios({
        ...SummaryApi.addTocart,
        data: {
          productId: data?._id,
          quantity: 1,
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

  const handleRequestClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRequestModal(true);
  };

  if (data.stock <= 0) {
    return (
      <>
        <button
          onClick={handleRequestClick}
          className="w-full bg-secondary-200 hover:bg-secondary-100 text-white text-sm font-medium py-2 px-3 rounded-md transition flex items-center justify-center"
        >
          Request
        </button>

        {showRequestModal && (
          <ProductRequestModal
            product={data}
            onClose={() => setShowRequestModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      className="w-full bg-green-700 hover:bg-green-800 text-white text-sm font-medium py-2 px-3 rounded-md transition flex items-center justify-center"
      disabled={loading}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
      ) : (
        <>
          <FaShoppingCart className="mr-1" /> Add
        </>
      )}
    </button>
  );
};

export default SimpleAddToCartButton;
