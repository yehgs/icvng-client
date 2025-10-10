import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaTimesCircle,
  FaShoppingCart,
  FaQuestionCircle,
  FaRedo,
  FaHome,
} from 'react-icons/fa';

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate('/checkout');
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    window.location.href =
      'mailto:customercare@i-coffee.ng?subject=Payment Issue - Need Help';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Error Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
            <FaTimesCircle className="text-red-500 text-5xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Payment Cancelled
          </h1>
          <p className="text-red-100 text-lg">Your payment was not completed</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              What happened?
            </h2>
            <div className="space-y-3 text-gray-600">
              <p>
                Your payment process was interrupted or cancelled. This could
                happen due to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You clicked the back or cancel button</li>
                <li>Your payment session expired</li>
                <li>There was an issue with your payment method</li>
                <li>The payment window was closed</li>
              </ul>
            </div>
          </div>

          {/* Reassurance */}
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm flex items-start gap-2">
              <FaQuestionCircle className="mt-1 flex-shrink-0" />
              <span>
                <strong>Don't worry!</strong> Your cart items are still saved.
                No charges were made to your account. You can try again whenever
                you're ready.
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <FaRedo />
              Try Payment Again
            </button>

            <button
              onClick={handleBackToCart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <FaShoppingCart />
              Back to Cart
            </button>

            <button
              onClick={handleGoHome}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaHome />
              Back to Home
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Need Help?
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Common Solutions:
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Check if your card has sufficient funds</li>
                  <li>• Ensure your card is enabled for online transactions</li>
                  <li>• Try using a different payment method</li>
                  <li>• Clear your browser cache and try again</li>
                </ul>
              </div>

              <button
                onClick={handleContactSupport}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FaQuestionCircle />
                Contact Customer Support
              </button>

              <div className="text-center text-sm text-gray-500">
                <p>Available 24/7 via email:</p>
                <a
                  href="mailto:customercare@i-coffee.ng"
                  className="text-blue-600 hover:underline font-medium"
                >
                  customercare@i-coffee.ng
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
