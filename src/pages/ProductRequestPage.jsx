import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import ConfirmBox from '../components/ConfirmBox';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import {
  setAdminRequests,
  setCurrentRequest,
  removeRequest,
  updateRequestStatus,
  setLoading as setRequestsLoading,
} from '../store/productRequestSlice';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';
import { formatDistanceToNow } from 'date-fns';

const ProductRequestPage = () => {
  const dispatch = useDispatch();
  const {
    adminRequests,
    currentRequest,
    loading: storeLoading,
  } = useSelector((state) => state.productRequest);
  const [loading, setLoading] = useState(false);
  const [openRequestDetails, setOpenRequestDetails] = useState(false);
  const [openConfirmBoxDelete, setOpenConfirmBoxDelete] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [adminNotes, setAdminNotes] = useState('');
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // Fetch product requests
  const fetchProductRequests = async () => {
    try {
      dispatch(setRequestsLoading(true));
      const response = await Axios({
        ...SummaryApi.getAllProductRequests,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setAdminRequests(responseData.data));
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      dispatch(setRequestsLoading(false));
    }
  };

  useEffect(() => {
    fetchProductRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch request details when selected
  const fetchRequestDetails = async (requestId) => {
    if (!requestId) return;

    try {
      setLoading(true);
      setSelectedRequestId(requestId);

      const response = await Axios({
        ...SummaryApi.getProductRequestDetails(requestId),
      });

      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setCurrentRequest(responseData.data));
        setAdminNotes(responseData.data.adminNotes || '');
        setOpenRequestDetails(true);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // View request details
  const handleViewRequest = (request) => {
    fetchRequestDetails(request._id);
  };

  // Delete product request
  const handleDeleteRequest = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.deleteProductRequest,
        data: { requestId: currentRequest._id },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        dispatch(removeRequest(currentRequest._id));
        setOpenConfirmBoxDelete(false);
        setOpenRequestDetails(false);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Update request status
  const handleUpdateStatus = async (status) => {
    try {
      setUpdateStatusLoading(true);

      const response = await Axios({
        ...SummaryApi.updateProductRequestStatus,
        data: {
          requestId: currentRequest._id,
          status,
          adminNotes,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        dispatch(updateRequestStatus(responseData.data));

        if (status === 'COMPLETED' || status === 'REJECTED') {
          setOpenRequestDetails(false);
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  // Close modals and reset state
  const handleCloseDetails = () => {
    setOpenRequestDetails(false);
    setSelectedRequestId(null);
    dispatch(setCurrentRequest(null));
  };

  // Filter requests by status
  const filteredRequests =
    statusFilter === 'ALL'
      ? adminRequests
      : adminRequests.filter((request) => request.status === statusFilter);

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

  // Get status counts for the filter badges
  const getStatusCounts = () => {
    const counts = {
      ALL: adminRequests.length,
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      REJECTED: 0,
    };

    adminRequests.forEach((request) => {
      if (counts[request.status] !== undefined) {
        counts[request.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <section className="p-4">
      <div className="bg-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 mb-4">
        <h2 className="font-semibold text-xl mb-2 sm:mb-0">Product Requests</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All <span className="ml-1">{statusCounts.ALL}</span>
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === 'PENDING'
                ? 'bg-amber-800 text-white'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            Pending <span className="ml-1">{statusCounts.PENDING}</span>
          </button>
          <button
            onClick={() => setStatusFilter('PROCESSING')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === 'PROCESSING'
                ? 'bg-blue-800 text-white'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            Processing <span className="ml-1">{statusCounts.PROCESSING}</span>
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === 'COMPLETED'
                ? 'bg-green-800 text-white'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            Completed <span className="ml-1">{statusCounts.COMPLETED}</span>
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === 'REJECTED'
                ? 'bg-red-800 text-white'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            Rejected <span className="ml-1">{statusCounts.REJECTED}</span>
          </button>
          <button
            onClick={fetchProductRequests}
            className="ml-2 bg-secondary-200 text-white px-3 py-1.5 rounded-md hover:bg-secondary-100 transition-colors flex items-center"
            disabled={storeLoading}
          >
            {storeLoading ? (
              <>
                <span className="animate-spin h-4 w-4 border-t-2 border-white mr-2"></span>
                Refreshing...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {storeLoading ? (
        <Loading />
      ) : filteredRequests.length === 0 ? (
        <NoData
          message={`No ${
            statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''
          } product requests available`}
        />
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-center">Quantity</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center">
                      {request.product?.image &&
                      request.product.image.length > 0 ? (
                        <img
                          src={request.product.image[0]}
                          alt={request.product.name}
                          className="w-12 h-12 object-cover rounded mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            No image
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium line-clamp-1">
                          {request.product?.name || 'Unknown Product'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {DisplayPriceInNaira(request.product?.price || 0)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      {request.user?.avatar ? (
                        <img
                          src={request.user.avatar}
                          alt={request.user.name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            {request.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium line-clamp-1">
                          {request.user?.name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {request.user?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-medium">{request.quantity}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm text-gray-600">
                    {new Date(request.createdAt).toLocaleDateString()}
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(request.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleViewRequest(request)}
                      className="bg-secondary-200 text-white px-3 py-1 rounded hover:bg-secondary-100 transition-colors"
                      disabled={loading && selectedRequestId === request._id}
                    >
                      {loading && selectedRequestId === request._id ? (
                        <span className="animate-spin h-4 w-4 border-t-2 border-white"></span>
                      ) : (
                        'View'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Request Details Modal */}
      {openRequestDetails && currentRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Request Details
              </h2>
              <button
                onClick={handleCloseDetails}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Product Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3 border-b pb-2">
                  Product Information
                </h3>
                <div className="flex items-start mb-3">
                  {currentRequest.product?.image &&
                  currentRequest.product.image.length > 0 ? (
                    <img
                      src={currentRequest.product.image[0]}
                      alt={currentRequest.product.name}
                      className="w-20 h-20 object-cover rounded mr-3"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      <span className="text-sm text-gray-500">No image</span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">
                      {currentRequest.product?.name || 'Unknown Product'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Price:{' '}
                      {DisplayPriceInNaira(currentRequest.product?.price || 0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Current Stock: {currentRequest.product?.stock || 0}
                    </div>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="mb-2">
                    <span className="font-medium">Requested Quantity:</span>{' '}
                    {currentRequest.quantity}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Request ID:</span>
                    <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {currentRequest._id}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(currentRequest.createdAt).toLocaleString()}
                  </div>
                  {currentRequest.updatedAt !== currentRequest.createdAt && (
                    <div className="mb-2">
                      <span className="font-medium">Last Updated:</span>{' '}
                      {new Date(currentRequest.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3 border-b pb-2">
                  Customer Information
                </h3>
                <div className="flex items-center mb-3">
                  {currentRequest.user?.avatar ? (
                    <img
                      src={currentRequest.user.avatar}
                      alt={currentRequest.user.name}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                      <span className="text-sm text-gray-500">
                        {currentRequest.user?.name?.charAt(0).toUpperCase() ||
                          'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">
                      {currentRequest.user?.name || 'Unknown User'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentRequest.user?.email || 'No email'}
                    </div>
                  </div>
                </div>
                <div className="text-sm">
                  {currentRequest.user?.mobile && (
                    <div className="mb-2">
                      <span className="font-medium">Phone:</span>{' '}
                      {currentRequest.user.mobile}
                    </div>
                  )}
                  <div className="mb-2">
                    <span className="font-medium">Account Created:</span>{' '}
                    {currentRequest.user?.createdAt
                      ? new Date(
                          currentRequest.user.createdAt
                        ).toLocaleDateString()
                      : 'Unknown'}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">User ID:</span>
                    <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {currentRequest.user?._id || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Message */}
            {currentRequest.message && (
              <div className="mb-4 bg-amber-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2 border-b pb-2">
                  Customer Message
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {currentRequest.message}
                </p>
              </div>
            )}

            {/* Admin Notes */}
            <div className="mb-6">
              <label
                htmlFor="adminNotes"
                className="block font-medium text-gray-700 mb-2 border-b pb-2"
              >
                Admin Notes
              </label>
              <textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-200"
                rows="3"
                placeholder="Add notes about this request (visible to the customer)..."
              ></textarea>
            </div>

            {/* Status */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="font-medium text-gray-700 mr-2">
                  Current Status:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                    currentRequest.status
                  )}`}
                >
                  {currentRequest.status}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                {currentRequest.status === 'PENDING' && (
                  <p>
                    This request is waiting for your attention. Update the
                    status when you start working on it.
                  </p>
                )}
                {currentRequest.status === 'PROCESSING' && (
                  <p>
                    You are currently working on this request. Update to
                    "Completed" once fulfilled or "Rejected" if it cannot be
                    processed.
                  </p>
                )}
                {currentRequest.status === 'COMPLETED' && (
                  <p>
                    This request has been marked as completed. The customer has
                    been notified.
                  </p>
                )}
                {currentRequest.status === 'REJECTED' && (
                  <p>
                    This request has been rejected. Make sure to provide a
                    reason in the admin notes.
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-between items-center pt-4 border-t">
              <div>
                <button
                  onClick={() => setOpenConfirmBoxDelete(true)}
                  className="bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 transition-colors"
                  disabled={updateStatusLoading}
                >
                  Delete Request
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                {currentRequest.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleUpdateStatus('REJECTED')}
                    className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors"
                    disabled={updateStatusLoading}
                  >
                    {updateStatusLoading ? 'Processing...' : 'Reject'}
                  </button>
                )}

                {currentRequest.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleUpdateStatus('COMPLETED')}
                    className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors"
                    disabled={updateStatusLoading}
                  >
                    {updateStatusLoading ? 'Processing...' : 'Complete'}
                  </button>
                )}

                {currentRequest.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus('PROCESSING')}
                    className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    disabled={updateStatusLoading}
                  >
                    {updateStatusLoading
                      ? 'Processing...'
                      : 'Mark as Processing'}
                  </button>
                )}

                {currentRequest.status === 'PROCESSING' && (
                  <button
                    onClick={() => handleUpdateStatus('PENDING')}
                    className="bg-amber-500 text-white px-3 py-2 rounded-md hover:bg-amber-600 transition-colors"
                    disabled={updateStatusLoading}
                  >
                    {updateStatusLoading
                      ? 'Processing...'
                      : 'Return to Pending'}
                  </button>
                )}

                <button
                  onClick={() => handleUpdateStatus(currentRequest.status)}
                  className="bg-secondary-200 text-white px-3 py-2 rounded-md hover:bg-secondary-100 transition-colors"
                  disabled={updateStatusLoading}
                >
                  {updateStatusLoading ? 'Processing...' : 'Save Notes Only'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {openConfirmBoxDelete && (
        <ConfirmBox
          title="Delete Product Request"
          message="Are you sure you want to delete this product request? This action cannot be undone."
          close={() => setOpenConfirmBoxDelete(false)}
          cancel={() => setOpenConfirmBoxDelete(false)}
          confirm={handleDeleteRequest}
        />
      )}
    </section>
  );
};

export default ProductRequestPage;
