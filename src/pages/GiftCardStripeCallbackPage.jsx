// client/src/pages/GiftCardStripeCallbackPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaCopy } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { useTranslation } from '../hooks/useTranslation.js';
import { useCountry } from '../context/CountryContext.jsx';

const MAX_POLLS = 10;
const POLL_INTERVAL_MS = 2000;

// Stripe (like the regular Stripe checkout flow elsewhere in this app)
// fulfills purely from its webhook — there's no synchronous "verify"
// endpoint to call the moment the browser lands back here. So this page
// polls a lightweight status endpoint a few times instead, which is
// normally enough for the webhook to have landed within a couple of
// seconds.
const GiftCardStripeCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { formatPrice } = useCountry();

  const [status, setStatus] = useState('verifying');
  const [card, setCard] = useState(null);
  const pollsRef = useRef(0);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await Axios({
          url: `${SummaryApi.giftCardPurchaseStatus.url}/${sessionId}`,
          method: SummaryApi.giftCardPurchaseStatus.method,
        });
        if (cancelled) return;
        if (res.data?.data?.ready) {
          setCard(res.data.data);
          setStatus('success');
          return;
        }
      } catch {
        // keep polling — a transient failure here shouldn't end the attempt early
      }
      pollsRef.current += 1;
      if (pollsRef.current >= MAX_POLLS) {
        if (!cancelled) setStatus('pending'); // not failed — just not confirmed yet, check email
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };
    poll();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(card.code);
    toast.success(t('giftCardBuy.codeCopied'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        {status === 'verifying' && (
          <>
            <FaSpinner className="animate-spin text-blue-600 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('giftCardBuy.verifying')}</h2>
          </>
        )}
        {status === 'success' && card && (
          <>
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('giftCardBuy.purchaseSuccess')}</h2>
            <p className="text-gray-600 mb-4">
              {t('giftCardBuy.purchaseSuccessBody', { email: card.recipientEmail })}
            </p>
            <div className="bg-[#7B3F1C]/5 border border-[#7B3F1C]/20 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('giftCardBuy.yourCode')}</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-bold text-lg text-[#7B3F1C]">{card.code}</span>
                <button onClick={copyCode} className="text-gray-400 hover:text-[#7B3F1C]"><FaCopy /></button>
              </div>
              <p className="text-sm text-gray-500 mt-2">{formatPrice ? formatPrice(card.amount) : `${card.currency} ${card.amount}`}</p>
            </div>
            <Link to="/" className="inline-block w-full py-3 bg-[#7B3F1C] text-white rounded-lg font-semibold hover:bg-[#6a3517]">
              {t('giftCardBuy.continueShopping')}
            </Link>
          </>
        )}
        {status === 'pending' && (
          <>
            <FaSpinner className="text-amber-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('giftCardBuy.stillProcessing')}</h2>
            <p className="text-gray-600 mb-6">{t('giftCardBuy.stillProcessingBody')}</p>
            <Link to="/" className="inline-block w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
              {t('giftCardBuy.continueShopping')}
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('giftCardBuy.purchaseFailed')}</h2>
            <p className="text-gray-600 mb-6">{t('giftCardBuy.purchaseFailedBody')}</p>
            <Link to="/gift-cards/buy" className="inline-block w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
              {t('giftCardBuy.tryAgain')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default GiftCardStripeCallbackPage;
