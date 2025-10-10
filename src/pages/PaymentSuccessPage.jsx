import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGlobalContext } from '../provider/GlobalProvider';
import {
  FaCheckCircle,
  FaBox,
  FaShippingFast,
  FaReceipt,
  FaHome,
} from 'react-icons/fa';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCartItem, fetchOrder } = useGlobalContext();

  const orderDetails = location.state?.orderDetails;
  const paymentMethod = location.state?.paymentMethod || 'Card Payment';

  useEffect(() => {
    // Refresh cart and orders when component mounts
    fetchCartItem();
    fetchOrder();
  }, []);

  const handleViewOrders = () => {
    navigate('/order');
  };

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 animate-bounce">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-green-100 text-lg">Thank you for your order</p>
        </div>

        {/* Order Details */}
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              What happens next?
            </h2>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FaReceipt className="text-blue-500" />
                    Order Confirmation
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    You'll receive an email confirmation with your order details
                    shortly.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FaBox className="text-purple-500" />
                    Order Processing
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    We'll start preparing your order for shipment.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FaShippingFast className="text-orange-500" />
                    Shipping Updates
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Track your order status in the Orders section of your
                    account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {orderDetails && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Reference:</span>
                  <span className="font-medium text-gray-800">
                    {orderDetails.reference ||
                      orderDetails.orderId ||
                      'Processing...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-800">
                    {paymentMethod}
                  </span>
                </div>
                {orderDetails.amount && (
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-green-600 text-lg">
                      ₦{orderDetails.amount?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleViewOrders}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <FaBox />
              View My Orders
            </button>

            <button
              onClick={handleContinueShopping}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              Continue Shopping
            </button>

            <button
              onClick={handleGoHome}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaHome />
              Back to Home
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <strong>Need help?</strong> Contact our customer support at{' '}
              <a
                href="mailto:customercare@i-coffee.ng"
                className="underline hover:text-blue-600"
              >
                customercare@i-coffee.ng
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
