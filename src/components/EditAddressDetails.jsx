// client/src/components/EditAddressDetails.jsx - Updated to use Nigerian address system
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { IoClose } from 'react-icons/io5';
import { FaMapMarkerAlt, FaPhone, FaBuilding, FaCompass } from 'react-icons/fa';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useGlobalContext } from '../provider/GlobalProvider';

const EditAddressDetails = ({ close, data }) => {
  const { fetchAddress } = useGlobalContext();
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
      _id: data._id || '',
      userId: data.userId || '',
      address_line: data.address_line || '',
      city: data.city || '',
      state: data.state || '',
      lga: data.lga || '',
      postal_code: data.postal_code || data.pincode || '',
      mobile: data.mobile || '',
      landline: data.landline || '',
      address_type: data.address_type || 'home',
      landmark: data.landmark || '',
      delivery_instructions: data.delivery_instructions || '',
      is_primary: data.is_primary || false,
    },
  });

  const watchedState = watch('state');

  // Load Nigerian states on component mount
  useEffect(() => {
    fetchNigerianStates();
    if (data.state) {
      setSelectedState(data.state);
      fetchLGAs(data.state);
    }
  }, [data.state]);

  // Load LGAs when state changes
  useEffect(() => {
    if (watchedState && watchedState !== selectedState) {
      setSelectedState(watchedState);
      fetchLGAs(watchedState);
      if (watchedState !== data.state) {
        setValue('lga', ''); // Clear LGA when state changes from original
      }
    }
  }, [watchedState, selectedState, setValue, data.state]);

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

  const onSubmit = async (formData) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateAddress,
        data: {
          _id: formData._id,
          userId: formData.userId,
          address_line: formData.address_line,
          city: formData.city,
          state: formData.state,
          lga: formData.lga,
          postal_code: formData.postal_code,
          mobile: formData.mobile,
          landline: formData.landline,
          address_type: formData.address_type,
          landmark: formData.landmark,
          delivery_instructions: formData.delivery_instructions,
          is_primary: formData.is_primary,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (close) {
          close();
          reset();
          fetchAddress();
        }
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const addressTypes = [
    { value: 'home', label: 'Home 🏠' },
    { value: 'office', label: 'Office 🏢' },
    { value: 'warehouse', label: 'Warehouse 🏭' },
    { value: 'pickup_point', label: 'Pickup Point 📦' },
    { value: 'other', label: 'Other 📍' },
  ];

  return (
    <section className="bg-black fixed top-0 left-0 right-0 bottom-0 z-50 bg-opacity-70 h-screen overflow-auto">
      <div className="bg-white p-6 w-full max-w-2xl mt-8 mx-auto rounded-lg shadow-lg">
        <div className="flex justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Address</h2>
          <button
            onClick={close}
            className="hover:text-red-500 text-gray-600 transition-colors"
          >
            <IoClose size={25} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Hidden Fields */}
          <Controller
            name="_id"
            control={control}
            render={({ field }) => <input {...field} type="hidden" />}
          />
          <Controller
            name="userId"
            control={control}
            render={({ field }) => <input {...field} type="hidden" />}
          />

          {/* Address Line */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line *
            </label>
            <Controller
              name="address_line"
              control={control}
              rules={{ required: 'Address line is required' }}
              render={({ field }) => (
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-3 text-gray-400" />
                  <input
                    {...field}
                    type="text"
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address_line ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your street address"
                  />
                </div>
              )}
            />
            {errors.address_line && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address_line.message}
              </p>
            )}
          </div>

          {/* State and LGA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <Controller
                name="state"
                control={control}
                rules={{ required: 'State is required' }}
                render={({ field }) => (
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                    <select
                      {...field}
                      className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Local Government Area (LGA) *
              </label>
              <Controller
                name="lga"
                control={control}
                rules={{ required: 'LGA is required' }}
                render={({ field }) => (
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                    <select
                      {...field}
                      className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.lga.message}
                </p>
              )}
            </div>
          </div>

          {/* City and Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City/Town *
              </label>
              <Controller
                name="city"
                control={control}
                rules={{ required: 'City is required' }}
                render={({ field }) => (
                  <div className="relative">
                    <FaBuilding className="absolute left-3 top-3 text-gray-400" />
                    <input
                      {...field}
                      type="text"
                      className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter city or town"
                    />
                  </div>
                )}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code *
              </label>
              <Controller
                name="postal_code"
                control={control}
                rules={{
                  required: 'Postal code is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Postal code must be exactly 6 digits',
                  },
                }}
                render={({ field }) => (
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                    <input
                      {...field}
                      type="text"
                      className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.postal_code
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                )}
              />
              {errors.postal_code && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.postal_code.message}
                </p>
              )}
            </div>
          </div>

          {/* Mobile and Landline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <FaPhone className="absolute left-3 top-3 text-gray-400" />
                    <input
                      {...field}
                      type="tel"
                      className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.mobile ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+234 801 234 5678"
                    />
                  </div>
                )}
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landline (Optional)
              </label>
              <Controller
                name="landline"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-3 text-gray-400" />
                    <input
                      {...field}
                      type="tel"
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+234 1 234 5678"
                    />
                  </div>
                )}
              />
            </div>
          </div>

          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Type
            </label>
            <Controller
              name="address_type"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-3 text-gray-400" />
                  <select
                    {...field}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {addressTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landmark (Optional)
            </label>
            <Controller
              name="landmark"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <FaCompass className="absolute left-3 top-3 text-gray-400" />
                  <input
                    {...field}
                    type="text"
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Near a notable landmark"
                  />
                </div>
              )}
            />
          </div>

          {/* Delivery Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Instructions (Optional)
            </label>
            <Controller
              name="delivery_instructions"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Special instructions for delivery"
                />
              )}
            />
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
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                reset();
                close();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Address
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditAddressDetails;
