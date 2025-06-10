import React, { useEffect, useState } from 'react';
import { IoAdd, IoTrash } from 'react-icons/io5';
import { Edit } from 'lucide-react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import UploadBannerModal from '../components/UploadBannerModal';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import ConfirmBox from '../components/ConfirmBox';

const BannerAdmin = () => {
  const [openUploadBanner, setOpenUploadBanner] = useState(false);
  const [allBanners, setAllBanners] = useState([]);
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterPosition, setFilterPosition] = useState('all');

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getBanner,
        params: filterPosition !== 'all' ? { position: filterPosition } : {},
      });
      const { data: responseData } = response;

      if (responseData.success) {
        setAllBanners(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteBanner,
        data: {
          _id: deleteData._id,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchBanners();
        setDeleteData(null);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateBanner,
        data: {
          _id: banner._id,
          isActive: !banner.isActive,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(
          `Banner ${!banner.isActive ? 'activated' : 'deactivated'}`
        );
        fetchBanners();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [filterPosition]);

  const getPositionLabel = (position) => {
    switch (position) {
      case 'homepage_side1':
        return 'Homepage Side 1';
      case 'homepage_side2':
        return 'Homepage Side 2';
      case 'footer':
        return 'Footer';
      default:
        return position;
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 'homepage_side1':
        return 'bg-blue-100 text-blue-800';
      case 'homepage_side2':
        return 'bg-green-100 text-green-800';
      case 'footer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="bg-white p-2 rounded">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-lg">Banner Management</h2>
          <button
            onClick={() => {
              setEditData(null);
              setOpenUploadBanner(true);
            }}
            className="text-sm border border-primary-200 hover:bg-primary-200 px-3 py-1 rounded flex items-center gap-2"
          >
            <IoAdd size={20} />
            Add Banner
          </button>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="all">All Positions</option>
            <option value="homepage_side1">Homepage Side 1</option>
            <option value="homepage_side2">Homepage Side 2</option>
            <option value="footer">Footer</option>
          </select>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8">
            <p>Loading banners...</p>
          </div>
        )}

        {/* Banner Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBanners.map((banner) => (
              <div
                key={banner._id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Banner Image */}
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={banner.image}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                  />
                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">INACTIVE</span>
                    </div>
                  )}
                </div>

                {/* Banner Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg truncate">
                      {banner.title || 'No Title'}
                    </h3>
                    <div className="flex gap-1 ml-2">
                      {/* Toggle Active Status */}
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`p-1 rounded ${
                          banner.isActive
                            ? 'text-green-600 hover:bg-green-100'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={banner.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {banner.isActive ? (
                          <FiEye size={16} />
                        ) : (
                          <FiEyeOff size={16} />
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditData(banner);
                          setOpenUploadBanner(true);
                        }}
                        className="p-1 hover:bg-primary-100 text-primary-600 rounded"
                        title="Edit Banner"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteData(banner)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                        title="Delete Banner"
                      >
                        <IoTrash size={16} />
                      </button>
                    </div>
                  </div>

                  {banner.subtitle && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {banner.subtitle}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getPositionColor(
                        banner.position
                      )}`}
                    >
                      {getPositionLabel(banner.position)}
                    </span>
                  </div>

                  {banner.link && (
                    <div className="text-xs text-blue-600 truncate">
                      <span className="font-medium">Link:</span> {banner.link}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && allBanners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No banners found</p>
            <button
              onClick={() => {
                setEditData(null);
                setOpenUploadBanner(true);
              }}
              className="bg-primary-200 text-white px-4 py-2 rounded hover:bg-primary-100"
            >
              Add Your First Banner
            </button>
          </div>
        )}
      </div>

      {/* Upload/Edit Banner Modal */}
      {openUploadBanner && (
        <UploadBannerModal
          close={() => {
            setOpenUploadBanner(false);
            setEditData(null);
          }}
          fetchData={fetchBanners}
          editData={editData}
        />
      )}

      {/* Delete Confirmation */}
      {deleteData && (
        <ConfirmBox
          cancel={() => setDeleteData(null)}
          confirm={handleDeleteBanner}
          message={`Are you sure you want to delete this banner?`}
        />
      )}
    </section>
  );
};

export default BannerAdmin;
