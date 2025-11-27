// client/src/components/address/AddressForm.jsx - Enhanced Nigerian address form
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  MapPin,
  Phone,
  User,
  Building,
  Navigation,
  AlertCircle,
} from 'lucide-react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const AddressForm = ({
  onSubmit,
  onCancel,
  initialData = null,
  loading = false,
}) => {
  const [nigerianStates, setNigerianStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [selectedState, setSelectedState] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      address_line: '',
      address_line_2: '',
      city: '',
      state: '',
      lga: '',
      area: '',
      postal_code: '',
      mobile: '',
      landline: '',
      address_type: 'home',
      landmark: '',
      delivery_instructions: '',
      is_primary: false,
      coordinates: {
        latitude: '',
        longitude: '',
      },
    },
  });

  const watchedState = watch('state');

  // Load Nigerian states on component mount
  useEffect(() => {
    fetchNigerianStates();
  }, []);

  // Load LGAs when state changes
  useEffect(() => {
    if (watchedState && watchedState !== selectedState) {
      setSelectedState(watchedState);
      fetchLGAs(watchedState);
    }
  }, [watchedState, selectedState]);

  // Populate form with initial data
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        if (key === 'coordinates' && initialData[key]) {
          setValue('coordinates.latitude', initialData[key].latitude || '');
          setValue('coordinates.longitude', initialData[key].longitude || '');
        } else {
          setValue(key, initialData[key]);
        }
      });

      if (initialData.state) {
        setSelectedState(initialData.state);
        fetchLGAs(initialData.state);
      }
    }
  }, [initialData, setValue]);

  const fetchNigerianStates = async () => {
    try {
      setLoadingStates(true);
      const response = await Axios({
        url: '/api/address/nigeria-locations?type=states',
        method: 'GET',
      });

      if (response.data.success) {
        setNigerianStates(response.data.data);
      } else {
        toast.error('Failed to load Nigerian states');
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      toast.error('Failed to load Nigerian states');
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchLGAs = async (stateName) => {
    if (!stateName) return;

    try {
      setLoadingLgas(true);
      const response = await Axios({
        url: `/api/address/nigeria-locations?type=lgas&state=${encodeURIComponent(
          stateName
        )}`,
        method: 'GET',
      });

      if (response.data.success) {
        setLgas(response.data.data);
      } else {
        toast.error('Failed to load LGAs');
        setLgas([]);
      }
    } catch (error) {
      console.error('Error fetching LGAs:', error);
      toast.error('Failed to load LGAs');
      setLgas([]);
    } finally {
      setLoadingLgas(false);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      // Validate mobile number format
      const mobileRegex = /^(\+234|0)[789][01]\d{8}$/;
      if (!mobileRegex.test(data.mobile.replace(/\s/g, ''))) {
        toast.error('Please enter a valid Nigerian mobile number');
        return;
      }

      // Validate postal code format
      if (!/^\d{6}$/.test(data.postal_code)) {
        toast.error('Postal code must be exactly 6 digits');
        return;
      }

      // Process coordinates
      const processedData = {
        ...data,
        coordinates: {
          latitude: data.coordinates?.latitude
            ? parseFloat(data.coordinates.latitude)
            : undefined,
          longitude: data.coordinates?.longitude
            ? parseFloat(data.coordinates.longitude)
            : undefined,
        },
      };

      // Remove empty coordinate values
      if (
        !processedData.coordinates.latitude ||
        !processedData.coordinates.longitude
      ) {
        delete processedData.coordinates;
      }

      await onSubmit(processedData);
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const addressTypes = [
    { value: 'home', label: 'Home', icon: '🏠' },
    { value: 'office', label: 'Office', icon: '🏢' },
    { value: 'warehouse', label: 'Warehouse', icon: '🏭' },
    { value: 'pickup_point', label: 'Pickup Point', icon: '📦' },
    { value: 'other', label: 'Other', icon: '📍' },
  ];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('coordinates.latitude', position.coords.latitude.toString());
          setValue(
            'coordinates.longitude',
            position.coords.longitude.toString()
          );
          toast.success('Location captured successfully');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {initialData ? 'Edit Address' : 'Add New Address'}
        </h2>
        <p className="text-gray-600">
          Please provide your complete Nigerian address details
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Address Lines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <Controller
              name="address_line"
              control={control}
              rules={{ required: 'Address line is required' }}
              render={({ field }) => (
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...field}
                    type="text"
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address_line ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your street address"
                    maxLength={500}
                  />
                </div>
              )}
            />
            {errors.address_line && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.address_line.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2 (Optional)
            </label>
            <Controller
              name="address_line_2"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...field}
                    type="text"
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    maxLength={200}
                  />
                </div>
              )}
            />
          </div>
        </div>

        {/* State and LGA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <Controller
              name="state"
              control={control}
              rules={{ required: 'State is required' }}
              render={({ field }) => (
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    {...field}
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.state ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loadingStates}
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map((state) => (
                      <option key={state.name} value={state.name}>
                        {state.name} ({state.capital})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.state.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local Government Area (LGA) *
            </label>
            <Controller
              name="lga"
              control={control}
              rules={{ required: 'LGA is required' }}
              render={({ field }) => (
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    {...field}
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lga ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!watchedState || loadingLgas}
                  >
                    <option value="">
                      {loadingLgas ? 'Loading LGAs...' : 'Select LGA'}
                    </option>
                    {lgas.map((lga) => (
                      <option key={lga.name} value={lga.name}>
                        {lga.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />
            {errors.lga && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.lga.message}
              </p>
            )}
          </div>
        </div>

        {/* City and Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City/Town *
            </label>
            <Controller
              name="city"
              control={control}
              rules={{ required: 'City is required' }}
              render={({ field }) => (
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...field}
                    type="text"
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter city or town"
                  />
                </div>
              )}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.city.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area/Ward (Optional)
            </label>
            <Controller
              name="area"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...field}
                    type="text"
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter area or ward"
                  />
                </div>
              )}
            />
          </div>
        </div>

        {/* Postal Code and Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code (Optional)
            </label>
            <Controller
              name="postal_code"
              control={control}
              rules={{
                pattern: {
                  value: /^\d{6}$/,
                  message: 'Postal code must be exactly 6 digits',
                },
              }}
              render={({ field }) => (
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...field}
                    type="text"
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.postal_code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              )}
            />
            {errors.postal_code && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.postal_code.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number *
            </label>
            <Controller
              name="mobile"
              control={control}
              rules={{
                required: 'Mobile number is required',
                pattern: {
                  value: /^(\+234|0)[789][01]\d{8}$/,
                  message: 'Please enter a valid Nigerian mobile number',
                },
              }}
              render={({ field }) => (
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...field}
                    type="tel"
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.mobile ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+234 801 234 5678"
                  />
                </div>
              )}
            />
            {errors.mobile && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.mobile.message}
              </p>
            )}
          </div>
        </div>

        {/* Landline and Address Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Landline (Optional)
            </label>
            <Controller
              name="landline"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...field}
                    type="tel"
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+234 1 234 5678"
                  />
                </div>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Type
            </label>
            <Controller
              name="address_type"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    {...field}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {addressTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />
          </div>
        </div>

        {/* Landmark */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Landmark (Optional)
          </label>
          <Controller
            name="landmark"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Navigation className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  {...field}
                  type="text"
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Near a notable landmark or building"
                  maxLength={200}
                />
              </div>
            )}
          />
        </div>

        {/* Delivery Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Instructions (Optional)
          </label>
          <Controller
            name="delivery_instructions"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Special instructions for delivery (e.g., gate code, security contact, best delivery time)"
                maxLength={500}
              />
            )}
          />
        </div>

        {/* Coordinates */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              GPS Coordinates (Optional)
            </h3>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Current Location
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <Controller
                name="coordinates.latitude"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="6.5244"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <Controller
                name="coordinates.longitude"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3.3792"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Primary Address */}
        <div className="flex items-center">
          <Controller
            name="is_primary"
            control={control}
            render={({ field: { value, onChange } }) => (
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={onChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Set as primary address
                </span>
              </label>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Saving...'
              : initialData
              ? 'Update Address'
              : 'Add Address'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
