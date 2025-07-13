//client
import React, { useState } from 'react';
import { FaRegEyeSlash, FaRegEye, FaTimes, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';
import fetchUserDetails from '../utils/fetchUserDetails';
import { useGlobalContext } from '../provider/GlobalProvider';
import Loading from './Loading';

const AuthModal = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'login',
  title = null,
  message = null,
  redirectReason = null,
}) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const { migrateGuestDataToUser } = useGlobalContext();

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const validateLoginForm = Object.values(loginData).every((el) => el);
  const validateRegisterForm = Object.values(registerData).every((el) => el);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await Axios({
        ...SummaryApi.login,
        data: loginData,
      });

      if (response.data.error) {
        toast.error(response.data.message);
        return;
      }

      if (response.data.success) {
        toast.success('Login successful!');
        localStorage.setItem('accesstoken', response.data.data.accesstoken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);

        const userDetails = await fetchUserDetails();
        dispatch(setUserDetails(userDetails.data));

        setLoginData({ email: '', password: '' });

        // Trigger migration after a short delay
        setTimeout(async () => {
          if (migrateGuestDataToUser) {
            await migrateGuestDataToUser();
          }

          if (onSuccess) {
            onSuccess(userDetails.data);
          }
          onClose();
        }, 300);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Password and confirm password must be the same');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await Axios({
        ...SummaryApi.register,
        data: {
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
        },
      });

      if (response.data.error) {
        toast.error(response.data.message);
        return;
      }

      if (response.data.success) {
        toast.success('Registration successful!');

        // Automatically log in the user after registration
        try {
          const loginResponse = await Axios({
            ...SummaryApi.login,
            data: {
              email: registerData.email,
              password: registerData.password,
            },
          });

          if (loginResponse.data.success) {
            localStorage.setItem(
              'accesstoken',
              loginResponse.data.data.accesstoken
            );
            localStorage.setItem(
              'refreshToken',
              loginResponse.data.data.refreshToken
            );

            const userDetails = await fetchUserDetails();
            dispatch(setUserDetails(userDetails.data));

            setRegisterData({
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
            });

            toast.success('Account created and logged in successfully!');

            // Trigger migration after a short delay
            setTimeout(async () => {
              if (migrateGuestDataToUser) {
                await migrateGuestDataToUser();
              }

              if (onSuccess) {
                onSuccess(userDetails.data);
              }
              onClose();
            }, 300);
          } else {
            // Registration successful but auto-login failed
            toast.success('Account created successfully! Please log in.');
            switchMode('login');
          }
        } catch (loginError) {
          // Registration successful but auto-login failed
          toast.success('Account created successfully! Please log in.');
          switchMode('login');
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setCurrentMode(newMode);
    setLoginData({ email: '', password: '' });
    setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Get alert message based on redirect reason
  const getAlertMessage = () => {
    const alerts = {
      checkout: {
        color: 'blue',
        message:
          'Please log in to continue with checkout. Your cart items will be preserved and migrated to your account.',
      },
      wishlist: {
        color: 'pink',
        message:
          'Please log in to access your wishlist. Your current wishlist items will be preserved and merged with your account.',
      },
      compare: {
        color: 'purple',
        message:
          'Please log in to access your compare list. Your current compare items will be preserved and merged with your account.',
      },
      order: {
        color: 'green',
        message:
          'Please log in to place your order. All your data will be preserved.',
      },
      profile: {
        color: 'indigo',
        message: 'Please log in to access your profile and account settings.',
      },
    };

    return alerts[redirectReason] || null;
  };

  if (!isOpen) return null;

  const alertInfo = getAlertMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {title ||
              (currentMode === 'login' ? 'Welcome Back' : 'Join I-Coffee')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Custom message or alert */}
          {(message || alertInfo) && (
            <div
              className={`mb-6 p-3 rounded-lg border ${
                alertInfo
                  ? `bg-${alertInfo.color}-50 border-${alertInfo.color}-200 text-${alertInfo.color}-800`
                  : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            >
              {message || alertInfo.message}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                currentMode === 'login'
                  ? 'bg-white text-secondary-200 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                currentMode === 'register'
                  ? 'bg-white text-secondary-200 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {currentMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-200 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-200 focus:border-transparent pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaRegEye className="text-gray-400" />
                    ) : (
                      <FaRegEyeSlash className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!validateLoginForm || loading}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  validateLoginForm && !loading
                    ? 'bg-secondary-200 hover:bg-secondary-100 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loading />
                    <span className="ml-2">Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {currentMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label
                  htmlFor="register-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="register-name"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-200 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-200 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="register-password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-200 focus:border-transparent pr-10"
                    placeholder="Enter your password (min. 6 characters)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaRegEye className="text-gray-400" />
                    ) : (
                      <FaRegEyeSlash className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="register-confirm-password"
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-200 focus:border-transparent pr-10"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <FaRegEye className="text-gray-400" />
                    ) : (
                      <FaRegEyeSlash className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!validateRegisterForm || loading}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  validateRegisterForm && !loading
                    ? 'bg-secondary-200 hover:bg-secondary-100 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loading />
                    <span className="ml-2">Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Guest Shopping Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-sm text-green-800">
                <FaLock className="text-green-600" />
                <span className="font-medium">Your data is safe with us</span>
              </div>
              <p className="text-xs text-green-700 text-center mt-1">
                Cart, wishlist, and compare items will be automatically saved to
                your account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
