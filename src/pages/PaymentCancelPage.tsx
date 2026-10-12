import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaTimesCircle,
  FaShoppingCart,
  FaQuestionCircle,
  FaRedo,
  FaHome,
} from 'react-icons/fa';
import { useCountry } from '../context/CountryContext';

const PaymentCancelPage = () => {
  const navigate = useNavigate();
  const { t } = useCountry();

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
      `mailto:customercare@i-coffee.ng?subject=${encodeURIComponent(t('paymentCancel.mailSubject'))}`;
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
            {t('paymentCancel.title')}
          </h1>
          <p className="text-red-100 text-lg">{t('paymentCancel.subtitle')}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('paymentCancel.whatHappened')}
            </h2>
            <div className="space-y-3 text-gray-600">
              <p>
                {t('paymentCancel.interrupted')}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('paymentCancel.reasonBack')}</li>
                <li>{t('paymentCancel.reasonExpired')}</li>
                <li>{t('paymentCancel.reasonMethod')}</li>
                <li>{t('paymentCancel.reasonClosed')}</li>
              </ul>
            </div>
          </div>

          {/* Reassurance */}
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm flex items-start gap-2">
              <FaQuestionCircle className="mt-1 flex-shrink-0" />
              <span>
                <strong>{t('paymentCancel.dontWorry')}</strong>{' '}
                {t('paymentCancel.reassurance')}
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
              {t('paymentCancel.tryAgain')}
            </button>

            <button
              onClick={handleBackToCart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <FaShoppingCart />
              {t('paymentCancel.backToCart')}
            </button>

            <button
              onClick={handleGoHome}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaHome />
              {t('paymentCancel.backToHome')}
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              {t('paymentCancel.needHelp')}
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t('paymentCancel.commonSolutions')}
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• {t('paymentCancel.tipFunds')}</li>
                  <li>• {t('paymentCancel.tipOnline')}</li>
                  <li>• {t('paymentCancel.tipOtherMethod')}</li>
                  <li>• {t('paymentCancel.tipCache')}</li>
                </ul>
              </div>

              <button
                onClick={handleContactSupport}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FaQuestionCircle />
                {t('paymentCancel.contactSupport')}
              </button>

              <div className="text-center text-sm text-gray-500">
                <p>{t('paymentCancel.availableEmail')}</p>
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
