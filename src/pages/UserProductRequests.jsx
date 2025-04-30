import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import AxiosToastError from '../utils/AxiosToastError';
import { setUserRequests } from '../store/productRequestSlice';
import { formatDistanceToNow } from 'date-fns';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';

const UserProductRequests = () => {
  const dispatch = useDispatch();
  const { userRequests } = useSelector((state) => state.productRequest);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getUserProductRequests,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setUserRequests(responseData.data));
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  // Get status badge className
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">My Product Requests</h1>

      {loading ? (
        <Loading />
      ) : userRequests.length === 0 ? (
        <NoData message="You haven't made any product requests yet" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(request.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                <div className="flex items-start mb-3">
                  {request.product?.image &&
                  request.product.image.length > 0 ? (
                    <img
                      src={request.product.image[0]}
                      alt={request.product.name}
                      className="w-16 h-16 object-cover rounded mr-3"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">
                      {request.product?.name || 'Unknown Product'}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {DisplayPriceInNaira(request.product?.price || 0)}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm">
                    <span className="font-medium">Quantity:</span>{' '}
                    {request.quantity}
                  </div>
                  {request.message && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">My message:</span>
                      <p className="mt-1 text-gray-700 bg-gray-50 p-2 rounded text-xs">
                        {request.message}
                      </p>
                    </div>
                  )}
                </div>

                {request.adminNotes && (
                  <div className="border-t pt-3 mb-3">
                    <div className="text-sm">
                      <span className="font-medium">Admin notes:</span>
                      <p className="mt-1 text-gray-700 bg-blue-50 p-2 rounded text-xs">
                        {request.adminNotes}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between border-t pt-3">
                  <div className="text-xs text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Request Details
              </h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800">
                  Product Information
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                    selectedRequest.status
                  )}`}
                >
                  {selectedRequest.status}
                </span>
              </div>

              <div className="flex items-start mb-3">
                {selectedRequest.product?.image &&
                selectedRequest.product.image.length > 0 ? (
                  <img
                    src={selectedRequest.product.image[0]}
                    alt={selectedRequest.product.name}
                    className="w-20 h-20 object-cover rounded mr-3"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded mr-3 flex items-center justify-center">
                    <span className="text-sm text-gray-500">No image</span>
                  </div>
                )}
                <div>
                  <div className="font-medium">
                    {selectedRequest.product?.name || 'Unknown Product'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Price:{' '}
                    {DisplayPriceInNaira(selectedRequest.product?.price || 0)}
                  </div>
                </div>
              </div>

              <div className="text-sm">
                <div className="mb-2">
                  <span className="font-medium">Requested Quantity:</span>{' '}
                  {selectedRequest.quantity}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Request Date:</span>{' '}
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </div>
                {selectedRequest.updatedAt !== selectedRequest.createdAt && (
                  <div className="mb-2">
                    <span className="font-medium">Last Updated:</span>{' '}
                    {new Date(selectedRequest.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Customer Message */}
            {selectedRequest.message && (
              <div className="mb-4 bg-amber-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Your Message</h3>
                <p className="text-gray-700 text-sm">
                  {selectedRequest.message}
                </p>
              </div>
            )}

            {/* Admin Notes */}
            {selectedRequest.adminNotes && (
              <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Admin Notes</h3>
                <p className="text-gray-700 text-sm">
                  {selectedRequest.adminNotes}
                </p>
              </div>
            )}

            {/* Status Information */}
            <div className="p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-800 mb-2">
                Status Information
              </h3>

              <div className="text-sm space-y-2">
                {selectedRequest.status === 'PENDING' && (
                  <p>
                    Your request is pending review by our team. We'll process it
                    as soon as possible.
                  </p>
                )}

                {selectedRequest.status === 'PROCESSING' && (
                  <p>
                    Your request is currently being processed. Our team is
                    working on it.
                  </p>
                )}

                {selectedRequest.status === 'COMPLETED' && (
                  <p>
                    Your request has been completed. Please contact us if you
                    have any questions.
                  </p>
                )}

                {selectedRequest.status === 'REJECTED' && (
                  <p>
                    Your request could not be fulfilled. Please check the admin
                    notes for more information or contact our support team.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProductRequests;
