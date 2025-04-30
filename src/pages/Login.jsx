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
        navigate('/account/product-requests');
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
      }

      if (response.data.success) {
        toast.success(response.data.message);
        localStorage.setItem('accesstoken', response.data.data.accesstoken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);

        const userDetails = await fetchUserDetails();
        dispatch(setUserDetails(userDetails.data));

        setData({
          email: '',
          password: '',
        });

        // Handle any pending product requests
        await handlePendingProductRequest();

        // If no pending request redirects happened, go to homepage
        if (sessionStorage.getItem('pendingRequest') === null) {
          navigate('/');
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
        {location.search.includes('redirect=request') && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            Please log in to submit your product request. After logging in, your
            request will be automatically submitted.
          </div>
        )}

        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="email">Email :</label>
            <input
              type="email"
              id="email"
              className="bg-blue-50 p-2 border rounded outline-none focus:border-primary-200"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="password">Password :</label>
            <div className="bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="w-full outline-none"
                name="password"
                value={data.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              <div
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer"
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
            <Link
              to={'/forgot-password'}
              className="block ml-auto hover:text-primary-200"
            >
              Forgot password?
            </Link>
          </div>

          <button
            disabled={!validValue || loading}
            className={`flex justify-center items-center gap-2 ${
              validValue
                ? 'bg-secondary-200 hover:bg-secondary-100'
                : 'bg-gray-500 cursor-not-allowed'
            } text-white py-2 rounded font-semibold my-3 tracking-wide`}
          >
            {loading ? <Loading /> : 'Login'}
          </button>
        </form>

        <p>
          Don't have an account?{' '}
          <Link
            to={'/register'}
            className="font-semibold text-secondary-100 hover:text-secondary-200"
          >
            Register
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
