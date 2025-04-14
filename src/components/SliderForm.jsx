import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { X } from 'lucide-react';
import uploadImage from '../utils/UploadImage';

const SliderForm = ({ data, close, fetchData, isEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    url: '',
    isActive: true,
    order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (isEdit && data) {
      setFormData({
        _id: data._id,
        title: data.title || '',
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        url: data.url || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order !== undefined ? data.order : 0,
      });
    }
  }, [data, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'order'
          ? parseInt(value, 10)
          : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      setUploadingImage(true);
      const response = await uploadImage(file);

      if (!response.data) {
        toast.error('Failed to upload image');
        return;
      }

      const { data: imageResponse } = response;

      if (imageResponse && imageResponse.success) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: imageResponse.data.url,
        }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if already uploading an image
    if (uploadingImage) {
      toast.error('Please wait for image upload to complete');
      return;
    }

    try {
      setLoading(true);

      if (!formData.title || !formData.imageUrl) {
        toast.error('Title and image are required');
        setLoading(false);
        return;
      }

      console.log('formData', formData);

      const response = await Axios({
        ...(isEdit ? SummaryApi.updateSlider : SummaryApi.addSlider),
        data: formData,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchData();
        close();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isEdit ? 'Edit Slider' : 'Add New Slider'}
          </h2>
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading || uploadingImage}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter slider title"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-secondary-100 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter slider description"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-secondary-100 focus:outline-none"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="border bg-blue-50 h-32 w-full md:w-48 flex items-center justify-center rounded">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://via.placeholder.com/400x200?text=Invalid+Image';
                    }}
                  />
                ) : (
                  <p className="text-sm text-neutral-500">No Image</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="uploadSliderImage"
                  className={`px-4 py-2 ${
                    uploadingImage
                      ? 'bg-gray-400'
                      : 'bg-secondary-200 hover:bg-secondary-100'
                  } text-white rounded cursor-pointer transition-colors text-center`}
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    id="uploadSliderImage"
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                    disabled={uploadingImage || loading}
                  />
                </label>
                {isEdit && formData.imageUrl && (
                  <p className="text-xs text-gray-500">
                    Upload new image to replace the current one
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link URL
            </label>
            <input
              type="text"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="Enter link URL (where the slider should navigate to)"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-secondary-200 focus:outline-none"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-secondary-200 focus:outline-none"
                disabled={loading}
              />
            </div>

            <div className="w-1/2 flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-secondary-100 border-gray-300 rounded focus:ring-secondary-200"
                  disabled={loading}
                />
                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
              disabled={loading || uploadingImage}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary-200 text-white rounded hover:bg-secondary-100 transition-colors disabled:opacity-50"
              disabled={loading || uploadingImage}
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SliderForm;
