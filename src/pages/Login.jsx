import React, { useState, useEffect } from 'react';
import { FaRegEyeSlash, FaRegEye } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import fetchUserDetails from '../utils/fetchUserDetails';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';
import { useGlobalContext } from '../provider/GlobalProvider';
import Loading from '../components/Loading';

const Login = () => {
  const [data, setData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Get the migration function from context
  const { migrateGuestDataToUser } = useGlobalContext();

  // Handle pending product requests after login
  const handlePendingProductRequest = async () => {
    const searchParams = new URLSearchParams(location.search);
    const isRequestRedirect = searchParams.get('redirect') === 'request';

    if (!isRequestRedirect) return;

    const pendingRequestJSON = sessionStorage.getItem('pendingRequest');
    if (!pendingRequestJSON) return;

    try {
      const pendingRequest = JSON.parse(pendingRequestJSON);

      // Submit the pending request
      const response = await Axios({
        ...SummaryApi.createProductRequest,
        data: {
          productId: pendingRequest.productId,
          quantity: parseInt(pendingRequest.quantity),
          message: pendingRequest.message,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success('Your product request was successfully submitted');

        // Clear the pending request
        sessionStorage.removeItem('pendingRequest');

        // Redirect to user's product requests page
        navigate('/dashboard/user-request');
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validValue = Object.values(data).every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await Axios({
        ...SummaryApi.login,
        data: data,
      });

      if (response.data.error) {
        toast.error(response.data.message);
        return;
      }

      if (response.data.success) {
        toast.success(response.data.message);

        // Store tokens
        localStorage.setItem('accesstoken', response.data.data.accesstoken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);

        // Fetch and set user details
        const userDetails = await fetchUserDetails();
        dispatch(setUserDetails(userDetails.data));

        // Clear form
        setData({
          email: '',
          password: '',
        });

        // Small delay to ensure user state is updated
        setTimeout(async () => {
          // Trigger guest data migration
          if (migrateGuestDataToUser) {
            await migrateGuestDataToUser();
          }

          // Handle any pending product requests
          await handlePendingProductRequest();

          // Check if redirected from checkout or other pages
          const searchParams = new URLSearchParams(location.search);
          const redirectParam = searchParams.get('redirect');

          // Navigate based on redirect parameter
          if (sessionStorage.getItem('pendingRequest') === null) {
            if (redirectParam === 'checkout') {
              navigate('/checkout');
            } else if (redirectParam === 'wishlist') {
              navigate('/wishlist');
            } else if (redirectParam === 'compare') {
              navigate('/compare');
            } else {
              navigate('/');
            }
          }
        }, 500);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full container mx-auto px-2">
      <div className="bg-white my-4 w-full max-w-lg mx-auto rounded p-7">
        {/* Alert Messages */}
        {location.search.includes('redirect=request') && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            Please log in to submit your product request. After logging in, your
            request will be automatically submitted.
          </div>
        )}

        {location.search.includes('redirect=checkout') && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
            Please log in to continue with checkout. Your cart items will be
            preserved and migrated to your account.
          </div>
        )}

        {location.search.includes('redirect=wishlist') && (
          <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-md text-pink-800">
            Please log in to access your wishlist. Your current wishlist items
            will be preserved and merged with your account.
          </div>
        )}

        {location.search.includes('redirect=compare') && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md text-purple-800">
            Please log in to access your compare list. Your current compare
            items will be preserved and merged with your account.
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your I-Coffee account</p>
        </div>

        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="bg-blue-50 p-3 border rounded-md outline-none focus:border-secondary-200 focus:ring-2 focus:ring-secondary-200 focus:ring-opacity-20 transition-all"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="grid gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="bg-blue-50 p-3 border rounded-md flex items-center focus-within:border-secondary-200 focus-within:ring-2 focus-within:ring-secondary-200 focus-within:ring-opacity-20 transition-all">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="w-full outline-none bg-transparent"
                name="password"
                value={data.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer text-gray-500 hover:text-gray-700 ml-2"
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
            <div className="text-right">
              <Link
                to={'/forgot-password'}
                className="text-sm text-secondary-200 hover:text-secondary-100 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={!validValue || loading}
            className={`flex justify-center items-center gap-2 py-3 rounded-md font-semibold transition-all ${
              validValue && !loading
                ? 'bg-secondary-200 hover:bg-secondary-100 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loading />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to={'/register'}
              className="font-semibold text-secondary-200 hover:text-secondary-100 hover:underline"
            >
              Create one here
            </Link>
          </p>
        </div>

        {/* Guest Shopping Notice */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
          <p className="font-medium">✓ Shopping as a guest?</p>
          <p>
            No worries! Your cart and wishlist items will be automatically saved
            to your account when you log in.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
