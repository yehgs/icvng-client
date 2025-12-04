// client/src/pages/TrackingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Calendar,
  Phone,
  Mail,
  Navigation,
  Info,
} from 'lucide-react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';

const TrackingPage = () => {
  const { trackingNumber } = useParams();
  const [searchParams] = useSearchParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(
    trackingNumber || searchParams.get('number') || ''
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (trackingNumber || searchParams.get('number')) {
      handleTrackingSearch(trackingNumber || searchParams.get('number'));
    }
  }, [trackingNumber]);

  const handleTrackingSearch = async (number = searchInput) => {
    if (!number.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await Axios({
        url: `/api/shipping/track/${number.toUpperCase()}`,
        method: 'get',
      });

      if (response.data.success) {
        setTracking(response.data.data);
      } else {
        setError(response.data.message || 'Tracking number not found');
        setTracking(null);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to track shipment');
      setTracking(null);
      console.error('Tracking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: Clock,
      PROCESSING: Package,
      PICKED_UP: Truck,
      IN_TRANSIT: Truck,
      OUT_FOR_DELIVERY: Navigation,
      DELIVERED: CheckCircle,
      ATTEMPTED: AlertTriangle,
      RETURNED: AlertTriangle,
      LOST: AlertTriangle,
      CANCELLED: AlertTriangle,
    };
    return icons[status] || Package;
  };

  const getStatusColor = (status) => {
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

  const getStatusDescription = (status) => {
    const descriptions = {
      PENDING:
        'Your order has been received and is being prepared for shipment.',
      PROCESSING: 'Your package is being processed and prepared for pickup.',
      PICKED_UP: 'Your package has been picked up by our delivery partner.',
      IN_TRANSIT: 'Your package is on its way to the destination.',
      OUT_FOR_DELIVERY:
        'Your package is out for delivery and will arrive soon.',
      DELIVERED: 'Your package has been successfully delivered.',
      ATTEMPTED:
        'Delivery was attempted but unsuccessful. Another attempt will be made.',
      RETURNED: 'Your package is being returned to sender.',
      LOST: 'Your package appears to be lost. Please contact customer service.',
      CANCELLED: 'Your shipment has been cancelled.',
    };
    return descriptions[status] || 'Status information not available.';
  };

  const isDelivered = tracking?.status === 'DELIVERED';
  const isOverdue =
    tracking?.estimatedDelivery &&
    new Date() > new Date(tracking.estimatedDelivery) &&
    !tracking.actualDelivery &&
    !['DELIVERED', 'RETURNED', 'LOST', 'CANCELLED'].includes(tracking.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Enter your tracking number to get real-time updates on your shipment
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="tracking-search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tracking Number
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="tracking-search"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && handleTrackingSearch()
                  }
                  placeholder="Enter tracking number (e.g., ICF123456ABC)"
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                />
              </div>
            </div>
            <div className="sm:pt-7">
              <button
                onClick={() => handleTrackingSearch()}
                disabled={loading || !searchInput.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                    Tracking...
                  </div>
                ) : (
                  'Track Package'
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <Info className="inline w-4 h-4 mr-1" />
            Tracking numbers are usually 10-12 characters long and may contain
            letters and numbers.
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">
                  Tracking Not Found
                </h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-red-700">
              <p className="font-medium">Please check:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your tracking number is entered correctly</li>
                <li>
                  The package has been shipped (tracking may not be available
                  for newly placed orders)
                </li>
                <li>
                  You're using the correct tracking number from your order
                  confirmation
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tracking Results */}
        {tracking && (
          <div className="space-y-6">
            {/* Package Status Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Tracking: {tracking.trackingNumber}
                  </h2>
                  <p className="text-gray-600">
                    Carrier: {tracking.carrier.name}
                  </p>
                </div>
                <div className="text-right">
                  {isOverdue && (
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full mb-2">
                      Overdue
                    </span>
                  )}
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      tracking.status
                    )}`}
                  >
                    {React.createElement(getStatusIcon(tracking.status), {
                      className: 'w-4 h-4 mr-2',
                    })}
                    {tracking.status.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    Estimated Delivery
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {tracking.estimatedDelivery
                      ? new Date(tracking.estimatedDelivery).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          }
                        )
                      : 'TBD'}
                  </div>
                </div>

                {tracking.actualDelivery && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-sm text-green-600">Delivered On</div>
                    <div className="text-lg font-semibold text-green-900">
                      {new Date(tracking.actualDelivery).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </div>
                  </div>
                )}

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Package className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Package Weight</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {tracking.packageInfo.weight}kg
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Destination</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {tracking.deliveryAddress.city},{' '}
                    {tracking.deliveryAddress.state}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-900 font-medium">
                  {getStatusDescription(tracking.status)}
                </p>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Shipping Timeline
              </h3>

              <div className="flow-root">
                <ul className="-mb-8">
                  {tracking.events.map((event, eventIdx) => {
                    const EventIcon = getStatusIcon(event.status);
                    const isLast = eventIdx === tracking.events.length - 1;

                    return (
                      <li key={eventIdx}>
                        <div className="relative pb-8">
                          {!isLast && (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  eventIdx === 0
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-400 text-white'
                                }`}
                              >
                                <EventIcon className="h-4 w-4" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {event.description}
                                </p>
                                {event.location &&
                                  (event.location.city ||
                                    event.location.facility) && (
                                    <p className="text-sm text-gray-500">
                                      <MapPin className="inline w-3 h-3 mr-1" />
                                      {event.location.facility &&
                                        `${event.location.facility}, `}
                                      {event.location.city &&
                                        `${event.location.city}`}
                                      {event.location.state &&
                                        `, ${event.location.state}`}
                                    </p>
                                  )}
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <div>
                                  {new Date(
                                    event.timestamp
                                  ).toLocaleDateString()}
                                </div>
                                <div>
                                  {new Date(event.timestamp).toLocaleTimeString(
                                    [],
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Need Help?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Phone className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Customer Support
                    </p>
                    <p className="text-sm text-gray-500">
                      +234 800 ICOFFEE (426-3333)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email Support
                    </p>
                    <p className="text-sm text-gray-500">support@i-coffee.ng</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Support Hours:</strong> Monday - Friday: 8:00 AM -
                  6:00 PM WAT | Saturday: 9:00 AM - 4:00 PM WAT
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  For urgent delivery issues, please call our support line with
                  your tracking number ready.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sample Tracking Numbers (for demo purposes) */}
        {!tracking && !loading && !error && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Don't have a tracking number?
            </h3>
            <p className="text-gray-600 mb-4">
              You can find your tracking number in your order confirmation email
              or by logging into your account.
            </p>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Try these sample tracking numbers:
              </p>
              <div className="flex flex-wrap gap-2">
                {['ICF123456ABC', 'ICF789012DEF', 'ICF345678GHI'].map(
                  (sample) => (
                    <button
                      key={sample}
                      onClick={() => {
                        setSearchInput(sample);
                        handleTrackingSearch(sample);
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-mono"
                    >
                      {sample}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
