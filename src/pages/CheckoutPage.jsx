// client/src/pages/CheckoutPage.jsx
// 4-step checkout: Address → Shipping → Payment → Review
// Login required — guests see auth modal from cart drawer before reaching here
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGlobalContext, useCurrency } from '../provider/GlobalProvider';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { nigeriaStatesLgas } from '../data/nigeria-states-lgas';
// Phase 4: country-aware payment routing
import { useCountry } from '../context/CountryContext.jsx';
import { useTranslation } from '../hooks/useTranslation';
import {
  MapPin, Truck, CreditCard, FileText, ChevronRight,
  Plus, Loader2, Package, Minus, Trash2, Store,
} from 'lucide-react';
import { FaShoppingCart, FaShieldAlt } from 'react-icons/fa';

const STEPS = ['Address', 'Shipping', 'Payment', 'Review'];

// ─── Simple inline address form ──────────────────────────────────────────────
function AddressForm({ onSave, saving }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    fullName: '', phone: '', address_line: '', address_line_2: '',
    city: '', state: 'Rivers', lga: '', country: 'Nigeria', label: '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const inp = 'w-full border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:border-green-500 bg-white';

  const stateData = nigeriaStatesLgas.find((s) => s.state === form.state);
  const lgas = stateData?.lga || [];

  const handleUse = () => {
    if (!form.fullName) { toast.error('Please enter your full name'); return; }
    if (!form.phone) { toast.error('Please enter your phone number'); return; }
    if (!form.address_line) { toast.error('Please enter your street address'); return; }
    if (!form.city) { toast.error('Please enter your city or town'); return; }
    if (!form.state) { toast.error('Please select a state'); return; }
    // lga is recommended but not blocking — fall back to state in handleSaveAddress
    onSave(form);
  };

  return (
    <div className="space-y-3 border border-gray-200 p-4 rounded-lg bg-gray-50">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
        <input placeholder={t('checkout.namePlaceholder')} value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)} className={inp} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
        <input placeholder="+234 801 234 5678" value={form.phone}
          onChange={(e) => set('phone', e.target.value)} className={inp} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address *</label>
        <input placeholder={t('checkout.streetLabel')} value={form.address_line}
          onChange={(e) => set('address_line', e.target.value)} className={inp} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Apartment / Floor (optional)</label>
        <input placeholder={t('checkout.streetPlaceholder')} value={form.address_line_2}
          onChange={(e) => set('address_line_2', e.target.value)} className={inp} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">City / Town *</label>
          <input placeholder={t('checkout.cityPlaceholder')} value={form.city}
            onChange={(e) => set('city', e.target.value)} className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
          <select value={form.state}
            onChange={(e) => { set('state', e.target.value); set('lga', ''); }}
            className={inp}>
            {nigeriaStatesLgas.map((s) => (
              <option key={s.state} value={s.state}>{s.state}</option>
            ))}
          </select>
        </div>
      </div>
      {lgas.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            LGA <span className="font-normal text-gray-500">— for accurate shipping cost</span>
          </label>
          <select value={form.lga} onChange={(e) => set('lga', e.target.value)} className={inp}>
            <option value="">{t('checkout.selectLGA')}</option>
            {lgas.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Address Label (optional)</label>
        <input placeholder={t('checkout.addressLabelPlaceholder')} value={form.label}
          onChange={(e) => set('label', e.target.value)} className={inp} />
      </div>
      <button type="button" onClick={handleUse} disabled={saving}
        className="w-full bg-green-600 text-white text-sm font-semibold py-2.5 rounded hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2 transition">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Use This Address'}
      </button>
    </div>
  );
}

// ─── Cart adjuster in sidebar ─────────────────────────────────────────────────
function CartAdjuster({ items, onUpdate, onRemove, formatPrice }) {
  if (!items?.length) return null;
  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Items</p>
      {items.map((item) => {
        const product = item.productId;
        const price = item.selectedPrice || product?.price || 0;
        return (
          <div key={item._id} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white rounded border overflow-hidden shrink-0">
              {product?.image?.[0] && <img src={product.image[0]} alt={product.name} className="w-full h-full object-contain" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{product?.name}</p>
              <p className="text-xs text-gray-500">{formatPrice(price)}</p>
            </div>
            <div className="flex items-center border border-gray-200 rounded bg-white overflow-hidden">
              <button onClick={() => onUpdate(item, item.quantity - 1)} disabled={item.quantity <= 1}
                className="px-1.5 py-1 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
              <button onClick={() => onUpdate(item, item.quantity + 1)}
                className="px-1.5 py-1 text-gray-400 hover:bg-gray-50">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs font-bold w-16 text-right shrink-0">{formatPrice(price * item.quantity)}</p>
            <button onClick={() => onRemove(item)} className="p-1 text-gray-300 hover:text-red-500 transition">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Checkout ────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const { t } = useTranslation();
  const { isLoggedIn, fetchCartItem, fetchOrder, updateCartItem, deleteCartItem, isMerging } = useGlobalContext();
  const { selectedCurrency, formatPrice, convertPrice, getPaymentMethod, exchangeRates } = useCurrency();
  // Phase 4: country-aware payment availability
  const { hasPaystack, hasStripe, countryCode } = useCountry();
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [addressList, setAddressList] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  // Default payment method: paystack for NG, stripe for others
  const [contact, setContact] = useState({ name: '', email: '', phone: '', notes: '', paymentMethod: hasPaystack ? 'paystack' : 'stripe' });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not logged in (shouldn't reach here — cart drawer blocks it)
  useEffect(() => {
    if (!isLoggedIn) navigate('/');
  }, [isLoggedIn]);

  // Pre-fill contact from user account
  useEffect(() => {
    if (user) setContact((p) => ({ ...p, name: user.name || '', email: user.email || '', phone: user.mobile || '' }));
  }, [user]);

  // Load saved addresses
  useEffect(() => {
    if (!isLoggedIn) return;
    Axios({ ...SummaryApi.getAddress }).then((res) => {
      if (res.data.success) {
        const addrs = res.data.data || [];
        setAddressList(addrs);
        const primary = addrs.find((a) => a.is_primary) || addrs[0];
        if (primary) { setSelectedAddressId(primary._id); loadShipping(primary._id); }
        else setShowAddressForm(true);
      }
    }).catch(() => {});
  }, [isLoggedIn]);

  const subtotal = useMemo(() =>
    cartItem.reduce((s, item) => s + (item.selectedPrice || item.productId?.price || 0) * item.quantity, 0),
    [cartItem]);

  const shippingCost = selectedMethod?.cost || 0;
  const total = subtotal + shippingCost;

  const loadShipping = async (addressId) => {
    if (!addressId || cartItem.length === 0) return;
    setShippingLoading(true);
    setShippingMethods([]);
    setSelectedMethod(null);
    try {
      const items = cartItem.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        category: item.productId.category?._id || item.productId.category,
        weight: item.productId.weight || 1,
        name: item.productId.name,
        priceOption: item.priceOption || 'regular',
        selectedPrice: item.selectedPrice || item.productId.price,
      }));
      const totalWeight = items.reduce((t, i) => t + (i.weight || 1) * i.quantity, 0);

      const res = await Axios({
        url: '/api/shipping/calculate-checkout', method: 'post',
        data: { addressId, items, orderValue: subtotal, totalWeight },
      });

      if (res.data.success) {
        const methods = (res.data.data?.methods || []).sort((a, b) => {
          if (a.type === 'pickup' && b.type !== 'pickup') return 1;
          if (b.type === 'pickup' && a.type !== 'pickup') return -1;
          return a.cost - b.cost;
        });
        setShippingMethods(methods);
        if (methods.length > 0) setSelectedMethod(methods[0]);
        else toast.error('No shipping options for this address');
      }
    } catch { toast.error('Failed to load shipping options'); }
    finally { setShippingLoading(false); }
  };

  const handleSaveAddress = async (formData) => {
    setAddressSaving(true);
    try {
      // Map checkout form field names to what the server's addAddressController expects.
      // The inline form uses: fullName, phone, address_line, city, state, lga, label
      // The server requires:  address_line, city, state, lga, mobile
      const payload = {
        address_line: formData.address_line,
        address_line_2: formData.address_line_2 || '',
        city: formData.city,
        state: formData.state,
        lga: formData.lga || formData.state, // fall back to state name if LGA not selected
        mobile: formData.phone,              // server field is "mobile", form field is "phone"
        address_type: 'home',
        status: true,
      };

      const res = await Axios({ ...SummaryApi.createAddress, data: payload });
      if (res.data.success) {
        toast.success('Address saved');
        const newAddr = res.data.data;
        // Attach display fields locally so the review step can show them
        newAddr.fullName = formData.fullName;
        newAddr.phone = formData.phone;
        setAddressList((p) => [...p, newAddr]);
        setSelectedAddressId(newAddr._id);
        setShowAddressForm(false);
        await loadShipping(newAddr._id);
      }
    } catch (e) { AxiosToastError(e); }
    finally { setAddressSaving(false); }
  };

  const handleCartUpdate = async (item, qty) => {
    if (qty < 1) return;
    await updateCartItem(item._id, qty);
    fetchCartItem?.();
  };

  const handleCartRemove = async (item) => {
    await deleteCartItem(item._id);
    fetchCartItem?.();
    toast.success('Item removed');
  };

  const handleSubmit = async () => {
    if (!agreeToTerms) { toast.error('Please agree to the terms and conditions'); return; }
    if (!selectedMethod) { toast.error('Please select a shipping method'); return; }
    if (!contact.name || !contact.email || !contact.phone) { toast.error('Please complete your contact details'); return; }

    setSubmitting(true);
    try {
      const orderItems = cartItem.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        priceOption: item.priceOption || 'regular',
        selectedPrice: item.selectedPrice || item.productId.price,
      }));

      if (contact.paymentMethod === 'bank_transfer') {
        const bankDetails = {
          bankName: import.meta.env.VITE_BANK_NAME || 'ZENITH BANK PLC',
          accountName: import.meta.env.VITE_BANK_ACCOUNT_NAME || 'I-COFFEE VENTURES',
          accountNumber: import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '1310523997',
          reference: `ICOFFEE-${Date.now()}-${user._id}`,
        };
        const res = await Axios({
          ...SummaryApi.directBankTransferOrder,
          data: {
            list_items: orderItems, addressId: selectedAddressId,
            subTotalAmt: subtotal, totalAmt: total, shippingCost,
            shippingMethodId: selectedMethod._id, currency: 'NGN', bankDetails,
            customerNotes: contact.notes,
          },
        });
        if (res.data.success) {
          fetchCartItem?.(); fetchOrder?.();
          navigate('/bank-transfer-instructions', {
            state: { orderDetails: res.data.data, bankDetails, totalAmount: total, shippingCost, shippingMethod: selectedMethod },
          });
        }
      } else {
        // Paystack (NGN) or Stripe (international)
        const paymentMethod = getPaymentMethod();
        const convertedSubTotal = convertPrice(subtotal);
        const convertedShipping = convertPrice(shippingCost);
        const convertedTotal = convertPrice(total);
        const exchangeRate = exchangeRates[selectedCurrency] || 1;
        const endpoint = paymentMethod === 'stripe' ? SummaryApi.payment_url : SummaryApi.paystackPaymentController;

        const res = await Axios({
          ...endpoint,
          data: {
            list_items: orderItems,
            addressId: selectedAddressId,
            subTotalAmt: selectedCurrency === 'NGN' ? subtotal : convertedSubTotal,
            totalAmt: selectedCurrency === 'NGN' ? total : convertedTotal,
            shippingCost: selectedCurrency === 'NGN' ? shippingCost : convertedShipping,
            originalAmounts: { subTotalAmt: subtotal, shippingCost, totalAmt: total },
            exchangeRateInfo: { rate: exchangeRate, fromCurrency: 'NGN', toCurrency: selectedCurrency },
            shippingMethodId: selectedMethod._id,
            currency: selectedCurrency, paymentMethod,
            customerNotes: contact.notes,
          },
        });

        if (res.data.success) {
          fetchCartItem?.(); fetchOrder?.();
          if (paymentMethod === 'stripe') {
            const { loadStripe } = await import('@stripe/stripe-js');
            const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
            await stripe.redirectToCheckout({ sessionId: res.data.id });
          } else {
            window.location.href = res.data.paymentUrl;
          }
        }
      }
    } catch (e) { AxiosToastError(e); }
    finally { setSubmitting(false); }
  };

  // While guest cart is being merged — show a loading screen instead of "empty cart"
  if (isMerging) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        <p className="text-gray-600 font-medium">Loading your cart…</p>
      </div>
    );
  }

  if (cartItem.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaShoppingCart className="mx-auto text-gray-300 text-6xl mb-4" />
          <p className="text-gray-600 mb-4 text-lg font-medium">Your cart is empty</p>
          <Link to="/shop" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const selectedAddress = addressList.find((a) => a._id === selectedAddressId);
  const inp = 'w-full border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:border-green-500 bg-white';

  return (
    <div className="min-h-screen bg-gray-50 py-6 lg:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-wide">Checkout</h1>

        {/* Step Progress */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < step ? 'bg-green-600 text-white' : i === step ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* STEP 0 — Address */}
            {step === 0 && (
              <div className="bg-white border border-gray-200 p-5 rounded-lg">
                <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" /> Delivery Address
                </h2>
                {addressList.length > 0 && !showAddressForm && (
                  <div className="space-y-3 mb-4">
                    {addressList.filter((a) => a.status !== false).map((addr) => (
                      <label key={addr._id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddressId === addr._id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input type="radio" name="address" checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)} className="mt-1" />
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {addr.fullName || addr.address_line}
                            {addr.label && <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{addr.label}</span>}
                            {addr.is_primary && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Primary</span>}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {addr.address_line}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}
                          </div>
                          <div className="text-xs text-gray-500">
                            {addr.lga ? `${addr.lga}, ` : ''}{addr.city}, {addr.state}
                          </div>
                          <div className="text-xs text-gray-400">{addr.mobile || addr.phone}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                {showAddressForm
                  ? <AddressForm onSave={handleSaveAddress} saving={addressSaving} />
                  : <button onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 mb-4">
                      <Plus className="w-4 h-4" /> Add new address
                    </button>
                }
                {!showAddressForm && (
                  <button onClick={() => {
                    if (!selectedAddressId) { toast.error('Please select a delivery address'); return; }
                    loadShipping(selectedAddressId);
                    setStep(1);
                  }} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition">
                    Continue to Shipping <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* STEP 1 — Shipping */}
            {step === 1 && (
              <div className="bg-white border border-gray-200 p-5 rounded-lg">
                <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-600" /> Shipping Method
                </h2>
                {selectedAddress && (
                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-green-500" />
                    Delivering to: <strong>{selectedAddress.lga ? `${selectedAddress.lga}, ` : ''}{selectedAddress.state}</strong>
                  </p>
                )}
                {shippingLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>
                ) : shippingMethods.length === 0 ? (
                  <div className="py-6 text-center text-gray-500">
                    <Truck className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm">No shipping options available for this address.</p>
                    <button onClick={() => setStep(0)} className="text-green-600 text-sm mt-2 hover:underline">← Change address</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <label key={method._id} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMethod?._id === method._id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input type="radio" checked={selectedMethod?._id === method._id}
                          onChange={() => setSelectedMethod(method)} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {method.type === 'pickup' ? <Store className="w-4 h-4 text-amber-600" /> : <Truck className="w-4 h-4 text-green-600" />}
                              <span className="font-semibold text-sm text-gray-900">{method.name}</span>
                            </div>
                            <span className="text-sm font-bold">
                              {method.cost === 0 ? <span className="text-green-600">FREE</span> : formatPrice(method.cost)}
                            </span>
                          </div>
                          {method.estimatedDays && <p className="text-xs text-gray-500 mt-0.5">Est. {method.estimatedDays} business day(s)</p>}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setStep(0)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition">← Back</button>
                  <button onClick={() => setStep(2)} disabled={!selectedMethod}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition">
                    Continue to Payment <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Payment & Contact */}
            {step === 2 && (
              <div className="bg-white border border-gray-200 p-5 rounded-lg">
                <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" /> Contact & Payment
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                      <input value={contact.name} onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))} className={inp} placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Phone *</label>
                      <input value={contact.phone} onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))} className={inp} placeholder="+234 801 234 5678" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                      <input type="email" value={contact.email} onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))} className={inp} placeholder="your@email.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Payment Method *</label>
                    <div className="space-y-2">
                      {/* Phase 4: Show Paystack only if enabled for this country */}
                      {hasPaystack && (
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-green-400 transition">
                          <input type="radio" value="paystack" checked={contact.paymentMethod === 'paystack'}
                            onChange={() => setContact((p) => ({ ...p, paymentMethod: 'paystack' }))} />
                          <span className="text-sm">💳 Pay Online (Card / Bank via Paystack)</span>
                        </label>
                      )}
                      {/* Show Stripe for all countries */}
                      {hasStripe && (
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-green-400 transition">
                          <input type="radio" value="stripe" checked={contact.paymentMethod === 'stripe'}
                            onChange={() => setContact((p) => ({ ...p, paymentMethod: 'stripe' }))} />
                          <span className="text-sm">💳 {hasPaystack ? 'Pay with Stripe (International Card)' : 'Pay with Card (Stripe)'}</span>
                        </label>
                      )}
                      {/* Bank transfer always available */}
                      {hasPaystack && (
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-green-400 transition">
                          <input type="radio" value="bank_transfer" checked={contact.paymentMethod === 'bank_transfer'}
                            onChange={() => setContact((p) => ({ ...p, paymentMethod: 'bank_transfer' }))} />
                          <span className="text-sm">🏦 Manual Bank Transfer</span>
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Order Notes (optional)</label>
                    <textarea value={contact.notes} rows={3} className={inp + ' resize-none'}
                      onChange={(e) => setContact((p) => ({ ...p, notes: e.target.value }))}
                      placeholder={t('checkout.specialInstructions')} />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition">← Back</button>
                    <button onClick={() => setStep(3)} disabled={!contact.name || !contact.email || !contact.phone}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition">
                      Review Order <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — Review */}
            {step === 3 && (
              <div className="bg-white border border-gray-200 p-5 rounded-lg">
                <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" /> Review Your Order
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-5">
                  {cartItem.map((item) => {
                    const product = item.productId;
                    const price = item.selectedPrice || product?.price || 0;
                    return (
                      <div key={item._id} className="flex items-center gap-3 py-3 border-b border-gray-100">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                          {product?.image?.[0] && <img src={product.image[0]} alt={product.name} className="w-full h-full object-contain" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{product?.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold">{formatPrice(price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Address summary */}
                {selectedAddress && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Delivering to:</p>
                    <p className="text-gray-700 font-medium">{selectedAddress.fullName || contact.name}</p>
                    <p className="text-gray-600">
                      {selectedAddress.address_line}{selectedAddress.address_line_2 ? `, ${selectedAddress.address_line_2}` : ''},
                      {selectedAddress.lga ? ` ${selectedAddress.lga},` : ''} {selectedAddress.city}, {selectedAddress.state}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">{selectedAddress.mobile || selectedAddress.phone || contact.phone}</p>
                  </div>
                )}

                {/* Shipping summary */}
                {selectedMethod && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Shipping:</p>
                    <p className="text-gray-600">{selectedMethod.name} — {shippingCost === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatPrice(shippingCost)}</p>
                  </div>
                )}

                {/* Contact summary */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-semibold text-gray-700 mb-1">Contact & Payment:</p>
                  <p className="text-gray-600">{contact.name} · {contact.email} · {contact.phone}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {contact.paymentMethod === 'paystack' ? '💳 Paystack' : contact.paymentMethod === 'bank_transfer' ? '🏦 Bank Transfer' : '💳 Stripe'}
                  </p>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer mb-5">
                  <input type="checkbox" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-green-600" />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms-and-conditions" target="_blank" className="text-green-600 underline">Terms & Conditions</Link>,{' '}
                    <Link to="/privacy-policy" target="_blank" className="text-green-600 underline">Privacy Policy</Link>, and{' '}
                    <Link to="/refund-policy" target="_blank" className="text-green-600 underline">Refund Policy</Link>.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition">← Back</button>
                  <button onClick={handleSubmit} disabled={submitting || !agreeToTerms}
                    className="flex-1 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-gray-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition">
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                      : <>Place Order — {formatPrice(total)}</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-5 rounded-lg sticky top-4 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Order Summary</h3>
              <CartAdjuster items={cartItem} onUpdate={handleCartUpdate} onRemove={handleCartRemove} formatPrice={formatPrice} />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItem.length} item{cartItem.length !== 1 ? 's' : ''})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {selectedMethod && (
                  <div className="flex justify-between text-gray-600">
                    <span>{t('checkout.shipping')}</span>
                    <span>{shippingCost === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatPrice(shippingCost)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>{t('checkout.total')}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
                <FaShieldAlt className="text-green-500" /> Secure & encrypted checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
