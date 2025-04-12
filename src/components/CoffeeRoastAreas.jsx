import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import countryList from 'react-select-country-list';
import Select from 'react-select';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { setCoffeeRoastAreas } from '../store/productSlice';
import { toast } from 'react-hot-toast';

const CoffeeRoastAreas = () => {
  const dispatch = useDispatch();
  const coffeeRoastAreas = useSelector(
    (state) => state.product.coffeeRoastAreas || []
  );
  const countries = useMemo(() => countryList().getData(), []);

  const italyOption = countries.find((country) => country.value === 'IT');

  const [areaForm, setAreaForm] = useState({
    _id: '',
    city: '',
    region: '',
    country: italyOption,
    latitude: '',
    longitude: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchCoffeeRoastAreas = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getCoffeeRoastAreas,
      });
      if (response.data.success) {
        dispatch(setCoffeeRoastAreas(response.data.data));
      }
    } catch (error) {
      toast.error('Failed to fetch coffee roast areas');
    }
  };

  useEffect(() => {
    fetchCoffeeRoastAreas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAreaForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (selectedOption) => {
    setAreaForm((prev) => ({
      ...prev,
      country: selectedOption,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!areaForm.country) {
      toast.error('Country is required');
      return;
    }

    // Validate coordinates if provided
    const lat = areaForm.latitude ? parseFloat(areaForm.latitude) : null;
    const lng = areaForm.longitude ? parseFloat(areaForm.longitude) : null;

    if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
      toast.error('Invalid latitude. Must be between -90 and 90');
      return;
    }

    if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
      toast.error('Invalid longitude. Must be between -180 and 180');
      return;
    }

    const payload = {
      country: areaForm.country.label,
    };

    // Only add non-empty fields to payload
    if (areaForm.city) payload.city = areaForm.city;
    if (areaForm.region) payload.region = areaForm.region;
    if (lat !== null) payload.latitude = lat;
    if (lng !== null) payload.longitude = lng;

    if (isEditing) {
      payload._id = areaForm._id;
    }

    try {
      const apiCall = isEditing
        ? SummaryApi.updateCoffeeRoastArea
        : SummaryApi.addCoffeeRoastArea;

      const response = await Axios({
        ...apiCall,
        data: payload,
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.success) {
        toast.success(
          isEditing
            ? 'Coffee roast area updated successfully'
            : 'Coffee roast area added successfully'
        );
        fetchCoffeeRoastAreas();
        resetForm();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to save coffee roast area'
      );
    }
  };

  const resetForm = () => {
    setAreaForm({
      _id: '',
      city: '',
      region: '',
      country: italyOption,
      latitude: '',
      longitude: '',
    });
    setIsEditing(false);
  };

  const handleEdit = (area) => {
    const countryOption =
      countries.find((c) => c.label === area.country) || italyOption;

    setAreaForm({
      _id: area._id,
      city: area.city || '',
      region: area.region || '',
      country: countryOption,
      latitude: area.latitude || '',
      longitude: area.longitude || '',
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm('Are you sure you want to delete this coffee roast area?')
    ) {
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.deleteCoffeeRoastArea,
        data: { _id: id },
      });

      if (response.data.success) {
        toast.success('Coffee roast area deleted successfully');
        fetchCoffeeRoastAreas();
      }
    } catch (error) {
      toast.error('Failed to delete coffee roast area');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        {isEditing ? 'Edit Coffee Roast Area' : 'Add New Coffee Roast Area'}
      </h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <Select
              options={countries}
              value={areaForm.country}
              onChange={handleCountryChange}
              className="w-full"
              required
            />
            <p className="mt-1 text-sm text-gray-500">Required field</p>
          </div>

          <div>
            <label className="block mb-2">City/Province</label>
            <input
              type="text"
              name="city"
              value={areaForm.city}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Region/State</label>
            <input
              type="text"
              name="region"
              value={areaForm.region}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={areaForm.latitude}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                min="-90"
                max="90"
              />
            </div>

            <div>
              <label className="block mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={areaForm.longitude}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                min="-180"
                max="180"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-secondary-200 text-white px-4 py-2 rounded hover:bg-secondary-100"
          >
            {isEditing ? 'Update Area' : 'Add Area'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-xl font-semibold mb-4">
          Existing Coffee Roast Areas
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Country</th>
                <th className="p-2 border">Region/State</th>
                <th className="p-2 border">City/Province</th>
                <th className="p-2 border">Latitude</th>
                <th className="p-2 border">Longitude</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coffeeRoastAreas.map((area) => (
                <tr key={area._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{area.country}</td>
                  <td className="p-2 border">{area.region || '—'}</td>
                  <td className="p-2 border">{area.city || '—'}</td>
                  <td className="p-2 border">
                    {area.latitude !== undefined ? area.latitude : '—'}
                  </td>
                  <td className="p-2 border">
                    {area.longitude !== undefined ? area.longitude : '—'}
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleEdit(area)}
                      className="mr-2 text-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(area._id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {coffeeRoastAreas.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center">
                    No coffee roast areas found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoffeeRoastAreas;
