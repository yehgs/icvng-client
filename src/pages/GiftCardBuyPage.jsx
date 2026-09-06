// client/src/pages/GiftCardBuyPage.jsx
import React, { useState } from 'react';
import { Gift, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { useCountry } from '../context/CountryContext.jsx';
import { useTranslation } from '../hooks/useTranslation';

const PRESET_AMOUNTS_NGN = [5000, 10000, 25000, 50000];
const PRESET_AMOUNTS_OTHER = [10, 25, 50, 100];

const GiftCardBuyPage = () => {
  const { t } = useTranslation();
  const { hasPaystack, hasStripe, country, formatPrice } = useCountry();
  const currency = country?.currency?.code || 'NGN';
  const presets = currency === 'NGN' ? PRESET_AMOUNTS_NGN : PRESET_AMOUNTS_OTHER;

  const [amount, setAmount] = useState(presets[1]);
  const [customAmount, setCustomAmount] = useState('');
  const [form, setForm] = useState({
    recipientName: '', recipientEmail: '', senderName: '', purchaserEmail: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const handleSubmit = async () => {
    if (!finalAmount || finalAmount <= 0) {
      toast.error(t('giftCardBuy.amountRequired'));
      return;
    }
    if (!form.recipientEmail) {
      toast.error(t('giftCardBuy.recipientEmailRequired'));
      return;
    }
    if (!form.purchaserEmail) {
      toast.error(t('giftCardBuy.purchaserEmailRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = { amount: finalAmount, ...form };
      if (hasPaystack && currency === 'NGN') {
        const res = await Axios({ ...SummaryApi.purchaseGiftCardPaystack, data: payload });
        if (res.data.success) {
          window.location.href = res.data.data.authorizationUrl;
        }
      } else if (hasStripe) {
        const res = await Axios({ ...SummaryApi.purchaseGiftCardStripe, data: payload });
        if (res.data.success) {
          window.location.href = res.data.data.url;
        }
      } else {
        toast.error(t('giftCardBuy.noPaymentMethod'));
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B3F1C]/30';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <Gift className="w-10 h-10 text-[#7B3F1C] mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-gray-900">{t('giftCardBuy.title')}</h1>
        <p className="text-gray-500 mt-1">{t('giftCardBuy.subtitle')}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('giftCardBuy.chooseAmount')}</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => { setAmount(p); setCustomAmount(''); }}
                className={`py-2 rounded-lg text-sm font-semibold border transition ${
                  !customAmount && amount === p
                    ? 'bg-[#7B3F1C] text-white border-[#7B3F1C]'
                    : 'border-gray-300 text-gray-700 hover:border-[#7B3F1C]'
                }`}
              >
                {formatPrice ? formatPrice(p) : `${currency} ${p}`}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={0}
            placeholder={t('giftCardBuy.customAmountPlaceholder')}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className={inp}
          />
        </div>

        {/* Recipient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('giftCardBuy.recipientName')} <span className="text-gray-400 font-normal">({t('common.optional') || 'optional'})</span></label>
            <input value={form.recipientName} onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('giftCardBuy.recipientEmail')} *</label>
            <input type="email" value={form.recipientEmail} onChange={(e) => setForm((p) => ({ ...p, recipientEmail: e.target.value }))} className={inp} placeholder="friend@email.com" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('giftCardBuy.giftMessage')} <span className="text-gray-400 font-normal">({t('common.optional') || 'optional'})</span></label>
          <textarea rows={3} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className={inp + ' resize-none'} placeholder={t('giftCardBuy.giftMessagePlaceholder')} />
        </div>

        <div className="border-t border-gray-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('giftCardBuy.yourName')} <span className="text-gray-400 font-normal">({t('common.optional') || 'optional'})</span></label>
            <input value={form.senderName} onChange={(e) => setForm((p) => ({ ...p, senderName: e.target.value }))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('giftCardBuy.yourEmail')} *</label>
            <input type="email" value={form.purchaserEmail} onChange={(e) => setForm((p) => ({ ...p, purchaserEmail: e.target.value }))} className={inp} placeholder="you@email.com" />
            <p className="text-[11px] text-gray-400 mt-1">{t('giftCardBuy.receiptHint')}</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-[#7B3F1C] hover:bg-[#6a3517] text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {t('giftCardBuy.buyNow', { amount: formatPrice ? formatPrice(finalAmount || 0) : finalAmount })}
        </button>
      </div>
    </div>
  );
};

export default GiftCardBuyPage;
