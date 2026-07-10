import React, { useState } from 'react';
import { FaRegEyeSlash, FaRegEye } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';
import fetchUserDetails from '../utils/fetchUserDetails';
import Loading from '../components/Loading';
import { Mail } from 'lucide-react';
import { useCountry } from '../context/CountryContext';

const Register = () => {
  const { t } = useCountry();
  const [data, setData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null); // for email-verify state
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect');

  const handleChange = (e) => setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const validateValue = Object.values(data).every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) { toast.error(t('auth.passwordsDoNotMatch')); return; }
    if (data.password.length < 6) { toast.error(t('auth.passwordTooShort')); return; }
    setLoading(true);

    try {
      const response = await Axios({
        ...SummaryApi.register,
        data: { name: data.name, email: data.email, password: data.password },
      });
      if (response.data.error) { toast.error(response.data.message); return; }

      if (response.data.success) {
        toast.success(response.data.message);

        // Check if app requires email verification
        if (response.data.requiresVerification) {
          // Show email verification state — user cannot log in until verified
          setRegisteredEmail(data.email);
          return;
        }

        // No email verification required — auto-login
        try {
          const loginResponse = await Axios({
            ...SummaryApi.login,
            data: { email: data.email, password: data.password },
          });
          if (loginResponse.data.success) {
            localStorage.setItem('accesstoken', loginResponse.data.data.accesstoken);
            localStorage.setItem('refreshToken', loginResponse.data.data.refreshToken);
            const userDetails = await fetchUserDetails();
            dispatch(setUserDetails(userDetails.data));
            toast.success(t('auth.accountCreatedLoggedIn'));
            setData({ name: '', email: '', password: '', confirmPassword: '' });
            // GlobalProvider will auto-merge guest cart on isLoggedIn change
            setTimeout(() => {
              if (redirectTo === 'checkout') navigate('/checkout');
              else if (redirectTo === 'wishlist') navigate('/wishlist');
              else navigate('/');
            }, 300);
          } else {
            // Auto-login failed — go to login page preserving redirect
            navigate(`/login${location.search}`);
          }
        } catch {
          navigate(`/login${location.search}`);
        }
      }
    } catch (error) { AxiosToastError(error); }
    finally { setLoading(false); }
  };

  // ── Email verification pending state ───────────────────────────────────────
  if (registeredEmail) {
    return (
      <section className="w-full container mx-auto px-2">
        <div className="bg-white my-4 w-full max-w-lg mx-auto rounded p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('auth.checkYourEmail')}</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('auth.verificationLinkSentTo')}{' '}
            <span className="font-semibold text-gray-700">{registeredEmail}</span>.
            {' '}{t('auth.clickToActivate')}
          </p>
          <p className="text-xs text-gray-400 mt-2">{t('auth.checkSpamFolder')}</p>
          <div className="mt-6 space-y-3">
            <Link to={`/login${location.search}`}
              className="block w-full py-2.5 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-600 transition text-sm text-center">
              {t('auth.goToSignIn')}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full container mx-auto px-2">
      <div className="bg-white my-4 w-full max-w-lg mx-auto rounded p-7">
        {redirectTo === 'checkout' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
            🛒 {t('auth.checkoutRegisterNotice')}
          </div>
        )}

        <h1 className="text-2xl font-semibold text-center mb-6">{t('auth.createAccount')}</h1>

        <form className="grid gap-4 mt-6" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="name">{t('auth.fullName')}</label>
            <input type="text" id="name" name="name" autoFocus
              className="bg-blue-50 p-2 border rounded outline-none focus:border-primary-200"
              value={data.name} onChange={handleChange} placeholder={t('auth.enterFullName')} />
          </div>
          <div className="grid gap-1">
            <label htmlFor="email">{t('auth.email')}</label>
            <input type="email" id="email" name="email"
              className="bg-blue-50 p-2 border rounded outline-none focus:border-primary-200"
              value={data.email} onChange={handleChange} placeholder={t('auth.enterEmail')} />
          </div>
          <div className="grid gap-1">
            <label htmlFor="password">{t('auth.password')}</label>
            <div className="bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200">
              <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                className="w-full bg-transparent outline-none"
                value={data.password} onChange={handleChange} placeholder={t('auth.atLeast6Chars')} />
              <div className="cursor-pointer text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
          </div>
          <div className="grid gap-1">
            <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
            <div className="bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200">
              <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword"
                className="w-full bg-transparent outline-none"
                value={data.confirmPassword} onChange={handleChange} placeholder={t('auth.confirmYourPassword')} />
              <div className="cursor-pointer text-gray-400" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
          </div>
          <button disabled={!validateValue || loading}
            className={`${validateValue ? 'bg-green-800 hover:bg-green-700' : 'bg-gray-500 cursor-not-allowed'} text-white py-2 rounded font-semibold tracking-wide mt-2 flex items-center justify-center gap-2 transition`}>
            {loading ? <><Loading /> {t('auth.registering')}</> : t('auth.register')}
          </button>
        </form>
        <p className="my-4 text-center">
          {t('auth.hasAccount')}{' '}
          <Link to={`/login${location.search}`} className="text-green-700 hover:text-green-600 font-medium">{t('auth.signIn')}</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
