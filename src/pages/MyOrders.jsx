// client/src/pages/MyOrders.jsx - WITH ORDER GROUPING
import React, { useState, useEffect } from 'react';
import {
  Package,
  ChevronDown,
  ChevronUp,
  Eye,
  Navigation,
  Calendar,
  ShoppingBag,
  CreditCard,
  MapPin,
  Phone,
  Truck,
  X,
} from 'lucide-react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import NoData from '../components/NoData';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orderGroups, setOrderGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
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
        // Check if response is grouped or individual orders
        const data = response.data.data;

        if (Array.isArray(data) && data.length > 0) {
          // Check if data is already grouped
          if (data[0].allOrders) {
            // Already grouped
            setOrderGroups(data);
          } else {
            // Individual orders - group them by orderGroupId
            const grouped = groupOrdersByGroupId(data);
            setOrderGroups(grouped);
          }

          // Fetch tracking data for orders with tracking numbers
          const allOrders = data.flatMap((group) => group.allOrders || [group]);

          for (const order of allOrders) {
            if (order.tracking_number) {
              await fetchTrackingData(order.tracking_number);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to group orders by orderGroupId (for backward compatibility)
  const groupOrdersByGroupId = (orders) => {
    const groupMap = new Map();

    orders.forEach((order) => {
      const groupId = order.orderGroupId || `SINGLE-${order.orderId}`;

      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          orderGroupId: groupId,
          parentOrder: order.isParentOrder ? order : null,
          childOrders: [],
          allOrders: [],
          summary: {
            totalItems: order.totalItemsInGroup || 1,
            createdAt: order.createdAt,
            payment_status: order.payment_status,
            order_status: order.order_status,
            totals: order.groupTotals || {
              subTotal: order.subTotalAmt,
              totalShipping: order.shipping_cost,
              grandTotal: order.totalAmt,
              itemCount: 1,
            },
          },
        });
      }

      const group = groupMap.get(groupId);
      group.allOrders.push(order);

      if (order.isParentOrder) {
        group.parentOrder = order;
      } else if (order.orderGroupId) {
        group.childOrders.push(order);
      }
    });

    return Array.from(groupMap.values());
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

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      CONFIRMED:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      PROCESSING:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      SHIPPED:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      DELIVERED:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      RETURNED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      PENDING:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      PENDING_BANK_TRANSFER:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
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
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white shadow-md p-6 rounded-lg mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
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
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white shadow-md p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 text-sm mt-1">
                Track and manage your coffee orders
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShoppingBag className="w-5 h-5" />
              <span>
                {orderGroups.length} order{orderGroups.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orderGroups.length === 0 ? (
          <NoData />
        ) : (
          <div className="space-y-4">
            {orderGroups.map((group) => {
              const isExpanded = expandedGroups.has(group.orderGroupId);
              const parentOrder = group.parentOrder || group.allOrders[0];
              const hasMultipleItems = group.summary.totalItems > 1;

              return (
                <div
                  key={group.orderGroupId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Group Header - Always Visible */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() =>
                      hasMultipleItems && toggleGroup(group.orderGroupId)
                    }
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              Order from{' '}
                              {new Date(
                                group.summary.createdAt
                              ).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </h3>
                            {hasMultipleItems && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                <ShoppingBag className="w-3 h-3" />
                                {group.summary.totalItems} items
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {parentOrder.orderGroupId || parentOrder.orderId}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ₦{group.summary.totals.grandTotal.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                                parentOrder.payment_status
                              )}`}
                            >
                              {parentOrder.payment_status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        {hasMultipleItems && (
                          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Summary Info */}
                    {!isExpanded && (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(
                              group.summary.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {hasMultipleItems ? (
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            <span>{group.summary.totalItems} products</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            <span>
                              {group.allOrders[0].product_details.name}
                            </span>
                          </div>
                        )}
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            group.summary.order_status
                          )}`}
                        >
                          {group.summary.order_status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expanded View - Products List */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Products in this order:
                        </h4>

                        <div className="space-y-3">
                          {group.allOrders.map((order) => {
                            const tracking =
                              trackingData[order.tracking_number];

                            return (
                              <div
                                key={order.orderId}
                                className="bg-white rounded-lg p-4 border border-gray-200"
                              >
                                <div className="flex items-start gap-4">
                                  {/* Product Image */}
                                  <img
                                    src={order.product_details.image[0]}
                                    alt={order.product_details.name}
                                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                  />

                                  {/* Product Details */}
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-900 mb-1">
                                      {order.product_details.name}
                                    </h5>

                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                                      <span>Order ID: {order.orderId}</span>
                                      <span>•</span>
                                      <span>Qty: {order.quantity}</span>
                                      <span>•</span>
                                      <span className="font-medium text-gray-900">
                                        ₦{order.totalAmt.toLocaleString()}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                          order.order_status
                                        )}`}
                                      >
                                        {order.order_status.replace(/_/g, ' ')}
                                      </span>

                                      {order.tracking_number && (
                                        <span className="flex items-center gap-1 text-xs text-gray-600">
                                          <Navigation className="w-3 h-3" />
                                          {order.tracking_number}
                                        </span>
                                      )}
                                    </div>

                                    {tracking && (
                                      <div className="mt-2 text-xs text-gray-600">
                                        <span
                                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getTrackingStatusColor(
                                            tracking.status
                                          )}`}
                                        >
                                          <Truck className="w-3 h-3" />
                                          {tracking.status.replace(/_/g, ' ')}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* View Details Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openOrderDetails(order);
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>Details</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Group Totals */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center text-sm">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-gray-600">
                                <span>Subtotal:</span>
                                <span className="font-medium text-gray-900">
                                  ₦
                                  {group.summary.totals.subTotal.toLocaleString()}
                                </span>
                              </div>
                              {group.summary.totals.totalShipping > 0 && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <span>Shipping:</span>
                                  <span className="font-medium text-gray-900">
                                    ₦
                                    {group.summary.totals.totalShipping.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-600 mb-1">
                                Total Amount
                              </div>
                              <div className="text-xl font-bold text-green-600">
                                ₦
                                {group.summary.totals.grandTotal.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
            getStatusColor={getStatusColor}
            getPaymentStatusColor={getPaymentStatusColor}
            getTrackingStatusColor={getTrackingStatusColor}
          />
        )}
      </div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({
  order,
  tracking,
  onClose,
  getStatusColor,
  getPaymentStatusColor,
  getTrackingStatusColor,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Order Details
              </h2>
              <p className="text-sm text-gray-600">{order.orderId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              Order Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Order ID</p>
                <p className="font-medium text-gray-900">{order.orderId}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Order Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    order.order_status
                  )}`}
                >
                  {order.order_status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                    order.payment_status
                  )}`}
                >
                  {order.payment_status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-600" />
              Product Details
            </h3>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={order.product_details.image[0]}
                alt={order.product_details.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">
                  {order.product_details.name}
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium text-gray-900">
                      {order.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-medium text-gray-900">
                      ₦{order.unitPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium text-gray-900">Total:</span>
                    <span className="font-bold text-green-600">
                      ₦{order.totalAmt.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          {order.tracking_number && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-gray-600" />
                Tracking Information
              </h3>
              <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    Tracking Number:
                  </span>
                  <span className="font-mono text-sm text-blue-600">
                    {order.tracking_number}
                  </span>
                </div>
                {tracking && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        Status:
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getTrackingStatusColor(
                          tracking.status
                        )}`}
                      >
                        <Truck className="w-3 h-3" />
                        {tracking.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        Carrier:
                      </span>
                      <span className="text-sm text-gray-900">
                        {tracking.carrier.name}
                      </span>
                    </div>
                    {tracking.estimatedDelivery && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          Est. Delivery:
                        </span>
                        <span className="text-sm text-gray-900">
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
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                Delivery Address
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
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
                  <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
                    <Phone className="w-4 h-4" />
                    <span>{order.delivery_address.mobile}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-600" />
              Payment Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                <p className="font-medium text-gray-900">
                  {order.payment_method}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                    order.payment_status
                  )}`}
                >
                  {order.payment_status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
