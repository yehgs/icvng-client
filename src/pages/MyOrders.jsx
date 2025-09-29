// client/src/pages/MyOrders.jsx - Enhanced with order listing and details view
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  Eye,
  MapPin,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  Navigation,
} from 'lucide-react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import NoData from '../components/NoData';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [trackingData, setTrackingData] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getOrderItems,
      });

      if (response.data.success) {
        setOrders(response.data.data);
        // Fetch tracking data for orders with tracking numbers
        const ordersWithTracking = response.data.data.filter(
          (order) => order.tracking_number
        );
        for (const order of ordersWithTracking) {
          await fetchTrackingData(order.tracking_number);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingData = async (trackingNumber) => {
    try {
      const response = await Axios({
        url: `/api/shipping/track/${trackingNumber}`,
        method: 'get',
      });

      if (response.data.success) {
        setTrackingData((prev) => ({
          ...prev,
          [trackingNumber]: response.data.data,
        }));
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RETURNED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTrackingStatusColor = (status) => {
    const colors = {
      PENDING: 'text-yellow-600 bg-yellow-100',
      PROCESSING: 'text-blue-600 bg-blue-100',
      PICKED_UP: 'text-purple-600 bg-purple-100',
      IN_TRANSIT: 'text-indigo-600 bg-indigo-100',
      OUT_FOR_DELIVERY: 'text-orange-600 bg-orange-100',
      DELIVERED: 'text-green-600 bg-green-100',
      ATTEMPTED: 'text-yellow-600 bg-yellow-100',
      RETURNED: 'text-red-600 bg-red-100',
      LOST: 'text-red-600 bg-red-100',
      CANCELLED: 'text-gray-600 bg-gray-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedOrder(null);
    setShowDetailsModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white shadow-md p-6 font-semibold mb-6">
            <h1 className="text-2xl">My Orders</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white shadow-md p-6 font-semibold mb-6 rounded-lg">
          <h1 className="text-2xl text-gray-900">My Orders</h1>
          <p className="text-gray-600 text-sm mt-1">
            Track and manage your coffee orders
          </p>
        </div>

        {/* Orders List */}
        {!orders.length ? (
          <NoData />
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const orderTracking = trackingData[order.tracking_number];

              return (
                <div
                  key={order._id + index + 'order'}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.orderId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.order_status
                        )}`}
                      >
                        {order.order_status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={order.product_details.image[0]}
                      alt={order.product_details.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {order.product_details.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {order.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₦{order.totalAmt.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Tracking Info */}
                  {order.tracking_number && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">
                            Tracking: {order.tracking_number}
                          </span>
                        </div>
                        {orderTracking && (
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getTrackingStatusColor(
                              orderTracking.status
                            )}`}
                          >
                            {orderTracking.status.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      {orderTracking && (
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                          <span>Carrier: {orderTracking.carrier.name}</span>
                          {orderTracking.estimatedDelivery && (
                            <span>
                              Est. Delivery:{' '}
                              {new Date(
                                orderTracking.estimatedDelivery
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            tracking={trackingData[selectedOrder.tracking_number]}
            onClose={closeDetailsModal}
          />
        )}
      </div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, tracking, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Order Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Order ID</p>
                <p className="font-medium">{order.orderId}</p>
              </div>
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    order.order_status
                  )}`}
                >
                  {order.order_status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-gray-600">Payment</p>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.payment_status === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Product Details
            </h3>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={order.product_details.image[0]}
                alt={order.product_details.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {order.product_details.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Quantity: {order.quantity}
                </p>
                <p className="text-sm text-gray-600">
                  Unit Price: ₦{order.unitPrice.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  Total: ₦{order.totalAmt.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          {order.tracking_number && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Tracking Information
              </h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    Tracking Number:
                  </span>
                  <span className="font-mono text-blue-600">
                    {order.tracking_number}
                  </span>
                </div>
                {tracking && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Status:</span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getTrackingStatusColor(
                          tracking.status
                        )}`}
                      >
                        {tracking.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        Carrier:
                      </span>
                      <span>{tracking.carrier.name}</span>
                    </div>
                    {tracking.estimatedDelivery && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          Est. Delivery:
                        </span>
                        <span>
                          {new Date(
                            tracking.estimatedDelivery
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {order.delivery_address && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Delivery Address
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {order.delivery_address.address_line}
                </p>
                <p className="text-sm text-gray-900">
                  {order.delivery_address.city}, {order.delivery_address.state}
                </p>
                <p className="text-sm text-gray-900">
                  {order.delivery_address.pincode}
                </p>
                {order.delivery_address.mobile && (
                  <p className="text-sm text-gray-600 mt-2">
                    📞 {order.delivery_address.mobile}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
