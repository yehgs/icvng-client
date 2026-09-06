// client/src/pages/GiftCardBalancePage.jsx
import React, { useState } from 'react';
import { Gift, Search, Loader2 } from 'lucide-react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { useTranslation } from '../hooks/useTranslation';
import { useCountry } from '../context/CountryContext.jsx';

const STATUS_STYLE = {
  ACTIVE: 'bg-green-100 text-green-700',
  REDEEMED: 'bg-gray-100 text-gray-500',
  DISABLED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-amber-100 text-amber-700',
};

const GiftCardBalancePage = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCountry();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await Axios({
        url: `${SummaryApi.checkGiftCardBalance.url}/${code.trim()}`,
        method: SummaryApi.checkGiftCardBalance.method,
      });
      if (res.data.success) setResult(res.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || t('giftCardBalance.notFound'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-6">
        <Gift className="w-10 h-10 text-[#7B3F1C] mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-gray-900">{t('giftCardBalance.title')}</h1>
        <p className="text-gray-500 mt-1">{t('giftCardBalance.subtitle')}</p>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2 mb-6">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t('giftCardBalance.codePlaceholder')}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B3F1C]/30"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="px-4 py-2 bg-[#7B3F1C] text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {t('giftCardBalance.check')}
        </button>
      </form>

      {error && (
        <div className="text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
          <p className="font-mono text-sm text-gray-400 mb-2">{result.code}</p>
          <p className="text-3xl font-bold text-[#7B3F1C] mb-1">
            {formatPrice ? formatPrice(result.balance) : `${result.currency} ${result.balance}`}
          </p>
          <p className="text-xs text-gray-400 mb-3">
            {t('giftCardBalance.ofInitial', { initial: formatPrice ? formatPrice(result.initialAmount) : `${result.currency} ${result.initialAmount}` })}
          </p>
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLE[result.status] || ''}`}>
            {t(`giftCardBalance.status${result.status.charAt(0)}${result.status.slice(1).toLowerCase()}`)}
          </span>
          {result.expiryDate && (
            <p className="text-xs text-gray-400 mt-3">
              {t('giftCardBalance.expires', { date: new Date(result.expiryDate).toLocaleDateString() })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default GiftCardBalancePage;
