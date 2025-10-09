import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../provider/GlobalProvider';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const PaystackCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCartItem, fetchOrder } = useGlobalContext();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');

      if (!reference && !trxref) {
        setStatus('error');
        setVerifying(false);
        toast.error('Payment reference not found');
        return;
      }

      const paymentRef = reference || trxref;

      // Verify payment with Paystack API
      const response = await Axios({
        url: `/api/order/verify-paystack/${paymentRef}`,
        method: 'get',
      });

      if (response.data.success) {
        setStatus('success');
        setOrderDetails(response.data.data);
        toast.success('Payment successful! Your order has been placed.');

        // Refresh cart and orders
        await fetchCartItem();
        await fetchOrder();

        // Redirect to success page after 3 seconds
        setTimeout(() => {
          navigate('/order-success', {
            state: {
              orderDetails: response.data.data,
              paymentMethod: 'Paystack',
            },
          });
        }, 3000);
      } else {
        setStatus('failed');
        toast.error(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      toast.error('Failed to verify payment. Please contact support.');
    } finally {
      setVerifying(false);
    }
  };

  const handleRetry = () => {
    navigate('/checkout');
  };

  const handleContactSupport = () => {
    window.location.href =
      'mailto:customercare@i-coffee.ng?subject=Payment Issue';
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <FaSpinner className="animate-spin text-blue-600 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Verifying Payment...
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment with Paystack.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        {status === 'success' ? (
          <>
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your payment has been confirmed and your order has been placed.
            </p>
            {orderDetails && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-600">
                  Order Reference:{' '}
                  <span className="font-medium">{orderDetails.reference}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Amount Paid:{' '}
                  <span className="font-medium">
                    ₦{orderDetails.amount?.toLocaleString()}
                  </span>
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Redirecting to order details...
            </p>
          </>
        ) : status === 'failed' ? (
          <>
            <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment could not be processed. Please try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Try Again
              </button>
              <button
                onClick={handleContactSupport}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition"
              >
                Contact Support
              </button>
            </div>
          </>
        ) : (
          <>
            <FaTimesCircle className="text-yellow-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Verification Error
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't verify your payment status. Please contact support if
              you were charged.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Return to Checkout
              </button>
              <button
                onClick={handleContactSupport}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition"
              >
                Contact Support
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaystackCallbackPage;
