import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../provider/GlobalProvider';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation.js';
import { useCountry } from '../context/CountryContext.jsx';

/**
 * CinetpayCallbackPage
 *
 * The CinetPay half of PaystackCallbackPage.jsx — same shape, deliberately
 * reusing the `paystackCallback` i18n namespace (already localized across
 * every supported language) rather than duplicating ~15 near-identical
 * keys under a new `cinetpayCallback` namespace. Nothing in those strings
 * names Paystack specifically (they're phrased generically — "Verifying
 * your payment...", "Payment Successful" — see the paystackCallback.*
 * keys in i18n/locales/*.js), so reuse is intentional, not a shortcut that
 * will read wrong to a shopper.
 *
 * verify-cinetpay/:reference calls CinetPay's server-to-server "Check
 * Payment Status" API before creating the order — see
 * controllers/order.controller.js#verifyCinetpayController. This page is
 * the PRIMARY order-creation path (same role PaystackCallbackPage plays);
 * the CinetPay notify_url webhook is the backup in case the browser never
 * returns.
 */
const CinetpayCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCartItem, fetchOrder } = useGlobalContext();
  const { t } = useTranslation();
  const { country, formatPrice } = useCountry();

  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  const supportEmail =
    country?.supportEmail || `customercare@${country?.domain || 'i-coffee.ng'}`;

  useEffect(() => {
    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPayment = async () => {
    try {
      // CinetPay's return_url gets ?reference=<our txRef> appended at
      // initiation time (see cinetpayPaymentController) — no gateway-side
      // query param to fall back on the way Paystack's trxref/reference pair
      // exists, since we control this URL entirely ourselves.
      const reference = searchParams.get('reference');

      if (!reference) {
        setStatus('error');
        setVerifying(false);
        toast.error(t('paystackCallback.referenceNotFound'));
        return;
      }

      const response = await Axios({
        url: `/api/order/verify-cinetpay/${reference}`,
        method: 'get',
      });

      if (response.data.success) {
        setStatus('success');
        setOrderDetails(response.data.data);
        toast.success(t('paystackCallback.successToast'));

        await fetchCartItem();
        await fetchOrder();

        setTimeout(() => {
          navigate('/order-success', {
            state: {
              orderDetails: response.data.data,
              paymentMethod: 'CinetPay',
            },
          });
        }, 3000);
      } else {
        setStatus('failed');
        toast.error(
          response.data.message || t('paystackCallback.verificationFailed')
        );
      }
    } catch (error) {
      console.error('CinetPay verification error:', error);
      setStatus('error');
      toast.error(t('paystackCallback.verificationErrorToast'));
    } finally {
      setVerifying(false);
    }
  };

  const handleRetry = () => navigate('/checkout');

  const handleContactSupport = () => {
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(
      t('paystackCallback.supportSubject')
    )}`;
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <FaSpinner className="animate-spin text-blue-600 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {t('paystackCallback.verifyingHeading')}
          </h2>
          <p className="text-gray-600">
            {t('paystackCallback.verifyingBody')}
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
              {t('paystackCallback.successHeading')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('paystackCallback.successBody')}
            </p>
            {orderDetails && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-600">
                  {t('paystackCallback.orderReference')}:{' '}
                  <span className="font-medium">{orderDetails.reference}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {t('paystackCallback.amountPaid')}:{' '}
                  <span className="font-medium">
                    {formatPrice
                      ? formatPrice(orderDetails.amount)
                      : `${orderDetails.currency || ''} ${
                          orderDetails.amount?.toLocaleString() ?? ''
                        }`}
                  </span>
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              {t('paystackCallback.redirecting')}
            </p>
          </>
        ) : status === 'failed' ? (
          <>
            <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {t('paystackCallback.failedHeading')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('paystackCallback.failedBody')}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition"
              >
                {t('paystackCallback.tryAgain')}
              </button>
              <button
                onClick={handleContactSupport}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition"
              >
                {t('paystackCallback.contactSupport')}
              </button>
            </div>
          </>
        ) : (
          <>
            <FaTimesCircle className="text-yellow-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {t('paystackCallback.errorHeading')}
            </h2>
            <p className="text-gray-600 mb-2">
              {t('paystackCallback.errorBody')}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {t('paystackCallback.errorChargeRecorded')}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition"
              >
                {t('paystackCallback.returnToCheckout')}
              </button>
              <button
                onClick={handleContactSupport}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition"
              >
                {t('paystackCallback.contactSupport')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CinetpayCallbackPage;
