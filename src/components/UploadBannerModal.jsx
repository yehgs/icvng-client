import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import uploadImage from '../utils/UploadImage';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const UploadBannerModal = ({ close, fetchData, editData }) => {
  const [data, setData] = useState({
    title: editData?.title || '',
    subtitle: editData?.subtitle || '',
    image: editData?.image || '',
    link: editData?.link || '',
    linkText: editData?.linkText || 'Learn More',
    position: editData?.position || 'homepage_side1',
    isActive: editData?.isActive !== undefined ? editData.isActive : true,
    _id: editData?._id || '',
  });
  const [loading, setLoading] = useState(false);

  const handleOnChange = (e) => {
    const { name, value, type, checked } = e.target;

    setData((prev) => {
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const apiCall = editData?._id
        ? SummaryApi.updateBanner
        : SummaryApi.addBanner;

      const response = await Axios({
        ...apiCall,
        data: data,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        close();
        fetchData();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBannerImage = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      const response = await uploadImage(file);
      const { data: ImageResponse } = response;

      setData((prev) => {
        return {
          ...prev,
          image: ImageResponse.data.url,
        };
      });
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800 bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white max-w-4xl w-full p-4 rounded max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">
            {editData?._id ? 'Edit Banner' : 'Add Banner'}
          </h1>
          <button onClick={close} className="w-fit block ml-auto">
            <IoClose size={25} />
          </button>
        </div>

        <form className="my-3 grid gap-4" onSubmit={handleSubmit}>
          {/* Image - Required */}
          <div className="grid gap-1">
            <p>Image *</p>
            <div className="flex gap-4 flex-col lg:flex-row items-center">
              <div className="border bg-blue-50 h-36 w-full lg:w-60 flex items-center justify-center rounded">
                {data.image ? (
                  <img
                    alt="banner"
                    src={data.image}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <p className="text-sm text-neutral-500">No Image</p>
                )}
              </div>
              <label htmlFor="uploadBannerImage">
                <div className="border-primary-200 hover:bg-primary-100 px-4 py-2 rounded cursor-pointer border font-medium">
                  Upload Image
                </div>

                <input
                  onChange={handleUploadBannerImage}
                  type="file"
                  id="uploadBannerImage"
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          {/* Position - Required */}
          <div className="grid gap-1">
            <label htmlFor="bannerPosition">Position *</label>
            <select
              id="bannerPosition"
              value={data.position}
              name="position"
              onChange={handleOnChange}
              className="bg-blue-50 p-2 border border-blue-100 focus-within:border-primary-200 outline-none rounded"
              required
            >
              <option value="homepage_side1">Homepage Side 1</option>
              <option value="homepage_side2">Homepage Side 2</option>
              <option value="footer">Footer</option>
            </select>
          </div>

          {/* Title - Optional */}
          <div className="grid gap-1">
            <label htmlFor="bannerTitle">Title (Optional)</label>
            <input
              type="text"
              id="bannerTitle"
              placeholder="Enter banner title"
              value={data.title}
              name="title"
              onChange={handleOnChange}
              className="bg-blue-50 p-2 border border-blue-100 focus-within:border-primary-200 outline-none rounded"
            />
          </div>

          {/* Subtitle - Optional */}
          <div className="grid gap-1">
            <label htmlFor="bannerSubtitle">Subtitle (Optional)</label>
            <input
              type="text"
              id="bannerSubtitle"
              placeholder="Enter banner subtitle"
              value={data.subtitle}
              name="subtitle"
              onChange={handleOnChange}
              className="bg-blue-50 p-2 border border-blue-100 focus-within:border-primary-200 outline-none rounded"
            />
          </div>

          {/* Link - Optional */}
          <div className="grid gap-1">
            <label htmlFor="bannerLink">Link URL (Optional)</label>
            <input
              type="url"
              id="bannerLink"
              placeholder="Enter banner link URL"
              value={data.link}
              name="link"
              onChange={handleOnChange}
              className="bg-blue-50 p-2 border border-blue-100 focus-within:border-primary-200 outline-none rounded"
            />
          </div>

          {/* Link Text - Optional */}
          <div className="grid gap-1">
            <label htmlFor="bannerLinkText">Link Text (Optional)</label>
            <input
              type="text"
              id="bannerLinkText"
              placeholder="Enter link text"
              value={data.linkText}
              name="linkText"
              onChange={handleOnChange}
              className="bg-blue-50 p-2 border border-blue-100 focus-within:border-primary-200 outline-none rounded"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="bannerActive"
              name="isActive"
              checked={data.isActive}
              onChange={handleOnChange}
              className="h-4 w-4"
            />
            <label htmlFor="bannerActive">Active</label>
          </div>

          <button
            type="submit"
            disabled={loading || !data.image}
            className={`
              ${
                data.image && !loading
                  ? 'bg-primary-200 hover:bg-primary-100'
                  : 'bg-gray-300'
              }
              py-3 px-4 font-semibold rounded text-white transition-colors
              ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {loading
              ? 'Processing...'
              : editData?._id
              ? 'Update Banner'
              : 'Add Banner'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default UploadBannerModal;
