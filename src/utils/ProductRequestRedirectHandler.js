import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGlobalContext } from '../provider/GlobalProvider';
import Axios from './Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from './AxiosToastError';

// This component should be added to your Login page to handle redirect after login
const ProductRequestRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useGlobalContext();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const handlePendingRequest = async () => {
      const searchParams = new URLSearchParams(location.search);
      const isRequestRedirect = searchParams.get('redirect') === 'request';

      if (isLoggedIn && isRequestRedirect) {
        // Check for pending request in sessionStorage
        const pendingRequestData = sessionStorage.getItem('pendingRequest');

        if (pendingRequestData) {
          try {
            const { productId, quantity, message } =
              JSON.parse(pendingRequestData);

            // Submit the pending request
            const response = await Axios({
              ...SummaryApi.createProductRequest,
              data: {
                productId,
                quantity: parseInt(quantity),
                message,
              },
            });

            const { data: responseData } = response;

            if (responseData.success) {
              toast.success(responseData.message);

              // Clear the pending request
              sessionStorage.removeItem('pendingRequest');

              // Redirect to user's product requests page
              navigate('/account/product-requests');
            }
          } catch (error) {
            AxiosToastError(error);
          }
        }
      }
    };

    handlePendingRequest();
  }, [isLoggedIn, location]);

  return null; // This is a utility component, no UI needed
};

export default ProductRequestRedirectHandler;
