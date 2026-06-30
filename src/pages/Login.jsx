import React, { useState } from 'react';
import { FaRegEyeSlash, FaRegEye } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import fetchUserDetails from '../utils/fetchUserDetails';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';
import Loading from '../components/Loading';
// Phase 4: Google OAuth
import GoogleLoginButton from '../components/GoogleLoginButton';

const Login = () => {
  const [data, setData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // ?redirect=checkout → go to /checkout after login
  // The GlobalProvider useEffect on isLoggedIn change will call mergeGuestCartToServer()
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect');

  const handleChange = (e) => setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const validValue = Object.values(data).every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await Axios({ ...SummaryApi.login, data });
      if (response.data.error) { toast.error(response.data.message); return; }
      if (response.data.success) {
        toast.success(response.data.message);
        localStorage.setItem('accesstoken', response.data.data.accesstoken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        const userDetails = await fetchUserDetails();
        dispatch(setUserDetails(userDetails.data));
        setData({ email: '', password: '' });

        // Navigate — GlobalProvider will merge guest cart automatically on isLoggedIn change
        setTimeout(() => {
          if (redirectTo === 'checkout') navigate('/checkout');
          else if (redirectTo === 'wishlist') navigate('/wishlist');
          else if (redirectTo === 'compare') navigate('/compare');
          else navigate('/');
        }, 300);
      }
    } catch (error) { AxiosToastError(error); }
    finally { setLoading(false); }
  };

  return (
    <section className="w-full container mx-auto px-2">
      <div className="bg-white my-4 w-full max-w-lg mx-auto rounded p-7">
        {redirectTo === 'checkout' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
            🛒 Sign in to complete your order — your cart items will be merged automatically.
          </div>
        )}

        <h1 className="text-2xl font-semibold text-center mb-6">Welcome Back</h1>

        <form className="grid gap-4 mt-6" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" autoFocus
              className="bg-blue-50 p-2 border rounded outline-none focus:border-primary-200"
              value={data.email} onChange={handleChange} placeholder="Enter your email" />
          </div>
          <div className="grid gap-1">
            <label htmlFor="password">Password</label>
            <div className="bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200">
              <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                className="w-full bg-transparent outline-none"
                value={data.password} onChange={handleChange} placeholder="Enter your password" />
              <div className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
            <Link to="/forgot-password" className="block ml-auto text-sm text-green-700 hover:text-green-600">
              Forgot password?
            </Link>
          </div>
          <button disabled={!validValue || loading}
            className={`${validValue ? 'bg-green-800 hover:bg-green-700' : 'bg-gray-500 cursor-not-allowed'} text-white py-2 rounded font-semibold tracking-wide mt-2 flex items-center justify-center gap-2 transition`}>
            {loading ? <><Loading /> Signing in...</> : 'Login'}
          </button>
        </form>
        <p className="my-4 text-center">
          Don&apos;t have an account?{' '}
          <Link to={`/register${location.search}`} className="text-green-700 hover:text-green-600 font-medium">Register</Link>
        </p>

        {/* Phase 4: Google OAuth */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400 uppercase">
            <span className="bg-white px-3">or</span>
          </div>
        </div>
        <GoogleLoginButton redirect={redirectTo ? `/${redirectTo}` : "/"} />
      </div>
    </section>
  );
};

export default Login;
