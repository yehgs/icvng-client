import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../provider/GlobalProvider';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation.js';
import { useCountry } from '../context/CountryContext.jsx';

/**
 * PaystackCallbackPage
 *
 * Previously this page was 100% hardcoded English with a literal "₦" and a
 * hardcoded customercare@i-coffee.ng address — so a Togo/Benin/Italy customer
 * returning from a payment saw English copy and a Nigerian currency symbol,
 * and every string was invisible to the UI-translation CRUD page because none
 * of the keys existed in the locale files.
 *
 * Now: every string goes through t() against the `paystackCallback` namespace
 * (registered in client/src/i18n/locales/en.js, so it seeds into the
 * uiTranslation collection and is editable live from UiTranslationsManagement),
 * amounts render in the storefront's own currency, and the support address is
 * derived from the active country rather than pinned to Nigeria.
 *
 * This page also carries the customer-visible half of the order-creation bug:
 * when createOrderFromPaystackTransaction threw (the missing ProductModel
 * import), the verify endpoint returned 500 and this page fell into the
 * generic "error" branch. The error branch now tells the customer plainly that
 * the charge succeeded and is recorded, because it is — the server persists a
 * PaymentFailure row before surfacing the error, so "contact support" is now
 * an instruction that support can actually act on.
 */
const PaystackCallbackPage = () => {
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
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');

      if (!reference && !trxref) {
        setStatus('error');
        setVerifying(false);
        toast.error(t('paystackCallback.referenceNotFound'));
        return;
      }

      const paymentRef = reference || trxref;

      const response = await Axios({
        url: `/api/order/verify-paystack/${paymentRef}`,
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
              paymentMethod: 'Paystack',
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
      console.error('Payment verification error:', error);
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
                    {/* Country-aware formatting — no hardcoded ₦. */}
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
            {/* The charge is recorded server-side even when this screen is
                reached, so we say so explicitly rather than leaving the
                customer to wonder whether their money vanished. */}
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

export default PaystackCallbackPage;
