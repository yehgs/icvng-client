import React, { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import ConfirmBox from '../components/ConfirmBox';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import SliderForm from '../components/SliderForm';

const SliderPage = () => {
  const [openAddSlider, setOpenAddSlider] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sliderData, setSliderData] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    url: '',
    isActive: true,
    order: 0,
  });
  const [openConfirmBoxDelete, setOpenConfirmBoxDelete] = useState(false);
  const [deleteSlider, setDeleteSlider] = useState({
    _id: '',
  });

  // Fetch sliders
  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getAllSliders,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        setSliderData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // Handle slider deletion
  const handleDeleteSlider = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteSlider,
        data: deleteSlider,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchSliders();
        setOpenConfirmBoxDelete(false);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Toggle slider active status
  const toggleSliderStatus = async (slider) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateSlider,
        data: {
          _id: slider._id,
          isActive: !slider.isActive,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(
          `Slider ${slider.isActive ? 'deactivated' : 'activated'} successfully`
        );
        fetchSliders();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="p-4">
      <div className="bg-white shadow-md flex items-center justify-between p-4 mb-4">
        <h2 className="font-semibold text-xl">Homepage Sliders</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setOpenAddSlider(true)}
            className="bg-secondary-200 text-white px-4 py-1 rounded hover:bg-secondary-100 transition-colors"
          >
            Add Slider
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : sliderData.length === 0 ? (
        <NoData message="No sliders available" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">URL</th>
                <th className="p-3 text-center">Order</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sliderData.map((slider) => (
                <tr
                  key={slider._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3">
                    <img
                      src={slider.imageUrl}
                      alt={slider.title}
                      className="w-32 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="p-3">{slider.title}</td>
                  <td className="p-3">
                    <div className="max-w-xs truncate">
                      {slider.description}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="max-w-xs truncate">{slider.url}</div>
                  </td>
                  <td className="p-3 text-center">{slider.order}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleSliderStatus(slider)}
                      className={`${
                        slider.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      } py-1 px-2 rounded-full text-xs font-medium`}
                    >
                      {slider.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setOpenEdit(true);
                        setEditData(slider);
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setOpenConfirmBoxDelete(true);
                        setDeleteSlider(slider);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {openAddSlider && (
        <SliderForm
          fetchData={fetchSliders}
          close={() => setOpenAddSlider(false)}
          isEdit={false}
        />
      )}

      {openEdit && (
        <SliderForm
          data={editData}
          close={() => setOpenEdit(false)}
          fetchData={fetchSliders}
          isEdit={true}
        />
      )}

      {openConfirmBoxDelete && (
        <ConfirmBox
          title="Delete Slider"
          message={`Are you sure you want to delete the slider "${deleteSlider.title}"?`}
          close={() => setOpenConfirmBoxDelete(false)}
          cancel={() => setOpenConfirmBoxDelete(false)}
          confirm={handleDeleteSlider}
        />
      )}
    </section>
  );
};

export default SliderPage;
