import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { useGlobalContext } from '../provider/GlobalProvider';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addRequest } from '../store/productRequestSlice';
import ReactDOM from 'react-dom';
import {
  FaBell,
  FaExclamationTriangle,
  FaClock,
  FaInfoCircle,
} from 'react-icons/fa';

const ProductRequestModal = ({ product, onClose, isDiscontinued = false }) => {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { isLoggedIn } = useGlobalContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  // Check if user is logged in based on userId in Redux store
  const isUserLoggedIn = Boolean(user?._id);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in - use both isLoggedIn from context and user ID from Redux
    if (!isUserLoggedIn && !isLoggedIn) {
      // Store current state for redirection after login
      sessionStorage.setItem(
        'pendingRequest',
        JSON.stringify({
          productId: product._id,
          quantity,
          message,
          isDiscontinued,
        })
      );

      toast.error('Please login to submit a request');
      navigate('/login?redirect=request');
      return;
    }

    try {
      setLoading(true);

      const response = await Axios({
        ...SummaryApi.createProductRequest,
        data: {
          productId: product._id,
          quantity: parseInt(quantity),
          message,
          requestType: isDiscontinued
            ? 'restock_notification'
            : 'availability_notification',
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        dispatch(addRequest(responseData.data));
        onClose();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Get modal content based on request type
  const getModalContent = () => {
    if (isDiscontinued) {
      return {
        title: 'Request Restock Notification',
        icon: <FaExclamationTriangle className="text-yellow-500 text-2xl" />,
        description:
          "This product is no longer in production. We'll notify you if it becomes available again in the future.",
        actionText: 'Notify me when available',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
      };
    } else {
      return {
        title: 'Request Stock Notification',
        icon: <FaBell className="text-blue-500 text-2xl" />,
        description:
          "This product is currently out of stock. We'll notify you as soon as it becomes available.",
        actionText: 'Notify me when in stock',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
      };
    }
  };

  const modalContent = getModalContent();

  // Use a portal to render the modal at the root level of the DOM
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            {modalContent.icon}
            <h2 className="text-xl font-semibold text-gray-800 ml-3">
              {modalContent.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Alert Box */}
        <div
          className={`mb-6 p-4 rounded-lg ${modalContent.bgColor} border ${modalContent.borderColor}`}
        >
          <div className="flex items-start">
            <FaInfoCircle className="text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-700">{modalContent.description}</p>
          </div>
        </div>

        {/* Product Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center">
            {product.image && product.image.length > 0 ? (
              <img
                src={product.image[0]}
                alt={product.name}
                className="w-16 h-16 object-contain mr-4 rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 flex items-center justify-center mr-4 rounded">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
              {product.producer && (
                <p className="text-sm text-gray-500 mb-1">
                  by {product.producer.name}
                </p>
              )}
              {product.sku && (
                <p className="text-xs text-gray-400">SKU: {product.sku}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Quantity Interested In
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Additional Message (Optional)
            </label>
            <textarea
              id="message"
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isDiscontinued
                  ? "Let us know why you're interested in this discontinued product..."
                  : 'Add any specific requirements or questions about this product...'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Timeline Info */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-600">
              <FaClock className="mr-2" />
              <span>
                {isDiscontinued
                  ? "We'll contact you if this product becomes available again"
                  : "We'll notify you within 24-48 hours of restocking"}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${modalContent.buttonColor}`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                modalContent.actionText
              )}
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Your email will be used only for this notification. You can
            unsubscribe from our notifications at any time.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductRequestModal;
