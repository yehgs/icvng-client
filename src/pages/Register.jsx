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
import { useGlobalContext } from '../provider/GlobalProvider';
import Loading from '../components/Loading';

const Register = () => {
  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Get the migration function from context
  const { migrateGuestDataToUser } = useGlobalContext();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateValue = Object.values(data).every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.password !== data.confirmPassword) {
      toast.error('Password and confirm password must be the same');
      return;
    }

    if (data.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Register the user
      const response = await Axios({
        ...SummaryApi.register,
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
      });

      if (response.data.error) {
        toast.error(response.data.message);
        return;
      }

      if (response.data.success) {
        toast.success(response.data.message);

        // Auto-login after successful registration
        try {
          const loginResponse = await Axios({
            ...SummaryApi.login,
            data: {
              email: data.email,
              password: data.password,
            },
          });

          if (loginResponse.data.success) {
            // Store tokens
            localStorage.setItem(
              'accesstoken',
              loginResponse.data.data.accesstoken
            );
            localStorage.setItem(
              'refreshToken',
              loginResponse.data.data.refreshToken
            );

            // Fetch and set user details
            const userDetails = await fetchUserDetails();
            dispatch(setUserDetails(userDetails.data));

            toast.success('Account created and logged in successfully!');

            // Clear form
            setData({
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
            });

            // Small delay to ensure user state is updated
            setTimeout(async () => {
              // Trigger guest data migration
              if (migrateGuestDataToUser) {
                await migrateGuestDataToUser();
              }

              // Check if redirected from a specific page
              const searchParams = new URLSearchParams(location.search);
              const redirectParam = searchParams.get('redirect');

              // Navigate based on redirect parameter
              if (redirectParam === 'checkout') {
                navigate('/checkout');
              } else if (redirectParam === 'wishlist') {
                navigate('/wishlist');
              } else if (redirectParam === 'compare') {
                navigate('/compare');
              } else {
                navigate('/');
              }
            }, 500);
          } else {
            // Registration successful but auto-login failed
            toast.success('Account created successfully! Please log in.');
            navigate('/login');
          }
        } catch (loginError) {
          // Registration successful but auto-login failed
          toast.success('Account created successfully! Please log in.');
          navigate('/login');
        }
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
        {location.search.includes('redirect=checkout') && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
            Create an account to continue with checkout. Your cart items will be
            preserved and added to your new account.
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Join I-Coffee</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <form className="grid gap-4 mt-6" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              autoFocus
              className="bg-blue-50 p-3 border rounded-md outline-none focus:border-secondary-200 focus:ring-2 focus:ring-secondary-200 focus:ring-opacity-20 transition-all"
              name="name"
              value={data.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

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
                placeholder="Enter your password (min. 6 characters)"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer text-gray-500 hover:text-gray-700 ml-2"
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          <div className="grid gap-1">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="bg-blue-50 p-3 border rounded-md flex items-center focus-within:border-secondary-200 focus-within:ring-2 focus-within:ring-secondary-200 focus-within:ring-opacity-20 transition-all">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="w-full outline-none bg-transparent"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="cursor-pointer text-gray-500 hover:text-gray-700 ml-2"
              >
                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!validateValue || loading}
            className={`flex justify-center items-center gap-2 py-3 rounded-md font-semibold transition-all ${
              validateValue && !loading
                ? 'bg-secondary-200 hover:bg-secondary-100 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loading />
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              to={'/login'}
              className="font-semibold text-secondary-200 hover:text-secondary-100 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Guest Shopping Notice */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
          <p className="font-medium">✓ Shopping as a guest?</p>
          <p>
            Your cart, wishlist, and compare items will be automatically saved
            to your new account!
          </p>
        </div>

        {/* Terms Notice */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-secondary-200 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-secondary-200 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Register;
