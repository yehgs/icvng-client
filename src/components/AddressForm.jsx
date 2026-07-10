// client/src/components/address/AddressForm.jsx - Enhanced Nigerian address form
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  MapPin,
  Phone,
  User,
  Building,
  Navigation,
  AlertCircle,
} from "lucide-react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import { useCountry } from "../context/CountryContext";

const AddressForm = ({
  onSubmit,
  onCancel,
  initialData = null,
  loading = false,
}) => {
  const { t } = useCountry();
  const [nigerianStates, setNigerianStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [selectedState, setSelectedState] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      address_line: "",
      address_line_2: "",
      city: "",
      state: "",
      lga: "",
      area: "",
      postal_code: "",
      mobile: "",
      landline: "",
      address_type: "home",
      landmark: "",
      delivery_instructions: "",
      is_primary: false,
      coordinates: {
        latitude: "",
        longitude: "",
      },
    },
  });

  const watchedState = watch("state");

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
        if (key === "coordinates" && initialData[key]) {
          setValue("coordinates.latitude", initialData[key].latitude || "");
          setValue("coordinates.longitude", initialData[key].longitude || "");
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
        url: "/api/address/nigeria-locations?type=states",
        method: "GET",
      });

      if (response.data.success) {
        setNigerianStates(response.data.data);
      } else {
        toast.error(t('address.failedLoadStates'));
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      toast.error(t('address.failedLoadStates'));
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
        method: "GET",
      });

      if (response.data.success) {
        setLgas(response.data.data);
      } else {
        toast.error(t('address.failedLoadLgas'));
        setLgas([]);
      }
    } catch (error) {
      console.error("Error fetching LGAs:", error);
      toast.error(t('address.failedLoadLgas'));
      setLgas([]);
    } finally {
      setLoadingLgas(false);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      // Validate mobile number format
      const mobileRegex = /^(\+234|0)[789][01]\d{8}$/;
      if (!mobileRegex.test(data.mobile.replace(/\s/g, ""))) {
        toast.error(t('address.invalidMobile'));
        return;
      }

      // Validate postal code format
      if (!/^\d{6}$/.test(data.postal_code)) {
        toast.error(t('address.invalidPostalCode'));
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
    { value: "home", label: t('address.typeHome'), icon: "🏠" },
    { value: "office", label: t('address.typeOffice'), icon: "🏢" },
    { value: "warehouse", label: t('address.typeWarehouse'), icon: "🏭" },
    { value: "pickup_point", label: t('address.typePickupPoint'), icon: "📦" },
    { value: "other", label: t('address.typeOther'), icon: "📍" },
  ];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("coordinates.latitude", position.coords.latitude.toString());
          setValue(
            "coordinates.longitude",
            position.coords.longitude.toString()
          );
          toast.success(t('address.locationCaptured'));
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(t('address.locationFailed'));
        }
      );
    } else {
      toast.error(t('address.geolocationNotSupported'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {initialData ? t('address.editAddress') : t('address.addNewAddress')}
        </h2>
        <p className="text-gray-600">
          {t('address.nigerianAddressPrompt')}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Address Lines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('address.addressLine1')} *
            </label>
            <Controller
              name="address_line"
              control={control}
              rules={{ required: t('address.addressLineRequired') }}
              render={({ field }) => (
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...field}
                    type="text"
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address_line ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder={t('address.streetAddressPlaceholder')}
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
              {t('address.addressLine2')}
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
                    placeholder={t('address.addressLine2Placeholder')}
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
              {t('address.state')} *
            </label>
            <Controller
              name="state"
              control={control}
              rules={{ required: t('address.stateRequired') }}
              render={({ field }) => (
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    {...field}
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.state ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={loadingStates}
                  >
                    <option value="">{t('address.selectState')}</option>
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
              {t('address.lga')} *
            </label>
            <Controller
              name="lga"
              control={control}
              rules={{ required: t('address.lgaRequired') }}
              render={({ field }) => (
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    {...field}
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lga ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={!watchedState || loadingLgas}
                  >
                    <option value="">
                      {loadingLgas ? t('address.loadingLgas') : t('address.selectLga')}
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
              {t('address.cityTown')} *
            </label>
            <Controller
              name="city"
              control={control}
              rules={{ required: t('address.cityRequired') }}
              render={({ field }) => (
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...field}
                    type="text"
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.city ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder={t('address.cityPlaceholder')}
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
              {t('address.areaWard')}
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
                    placeholder={t('address.areaPlaceholder')}
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
              {t('address.postalCode')}
            </label>
            <Controller
              name="postal_code"
              control={control}
              rules={{
                pattern: {
                  value: /^\d{6}$/,
                  message: t('address.invalidPostalCode'),
                },
              }}
              render={({ field }) => (
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...field}
                    type="text"
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.postal_code ? "border-red-300" : "border-gray-300"
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
              {t('address.mobileNumber')} *
            </label>
            <Controller
              name="mobile"
              control={control}
              rules={{
                required: t('address.mobileRequired'),
                pattern: {
                  value: /^(\+234|0)[789][01]\d{8}$/,
                  message: t('address.invalidMobile'),
                },
              }}
              render={({ field }) => (
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...field}
                    type="tel"
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.mobile ? "border-red-300" : "border-gray-300"
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
              {t('address.landline')}
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
              {t('address.addressType')}
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
            {t('address.landmark')}
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
                  placeholder={t('address.landmarkPlaceholder')}
                  maxLength={200}
                />
              </div>
            )}
          />
        </div>

        {/* Delivery Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('address.deliveryInstructions')}
          </label>
          <Controller
            name="delivery_instructions"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={t('address.deliveryInstructionsPlaceholder')}
                maxLength={500}
              />
            )}
          />
        </div>

        {/* Coordinates */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('address.gpsCoordinates')}
            </h3>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {t('address.getCurrentLocation')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('address.latitude')}
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
                {t('address.longitude')}
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
                  {t('address.setAsPrimary')}
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
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t('common.saving')
              : initialData
              ? t('address.updateAddress')
              : t('address.addAddress')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
