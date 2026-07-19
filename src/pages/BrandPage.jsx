import React, { useEffect, useState } from 'react';
import UploadBrandModel from '../components/UploadBrandModel';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import EditBrand from '../components/EditBrand';
import ConfirmBox from '../components/ConfirmBox';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const BrandPage = () => {
  const [openUploadBrand, setOpenUploadBrand] = useState(false);
  const [loading, setLoading] = useState(false);
  const [brandData, setBrandData] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    image: '',
  });
  const [openConfimBoxDelete, setOpenConfirmBoxDelete] = useState(false);
  const [deleteBrand, setDeleteBrand] = useState({
    _id: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const fetchBrand = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getBrand,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        setBrandData(responseData.data);
        setFilteredBrands(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrand();
  }, []);

  // Filter brands based on search term
  useEffect(() => {
    const filtered = brandData.filter((brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBrands(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, brandData]);

  const handleDeleteBrand = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteBrand,
        data: deleteBrand,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchBrand();
        setOpenConfirmBoxDelete(false);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrands = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredBrands.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <section className="p-4">
      <div className="bg-white shadow-md flex items-center justify-between p-4 mb-4">
        <h2 className="font-semibold text-xl">Brand Management</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setOpenUploadBrand(true)}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            Add Brand
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredBrands.length === 0 ? (
        <NoData />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-center">Compatible System</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBrands.map((brand) => (
                  <tr
                    key={brand._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">
                      <img
                        src={brand.image}
                        alt={brand.name}
                        className="w-32 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-3">{brand.name}</td>
                    <td className="p-3 text-center">
                      {brand.compatibleSystem ? (
                        <span className="bg-green-100 text-green-800 py-1 px-2 rounded-full text-xs font-medium">
                          Yes
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded-full text-xs font-medium">
                          No
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setOpenEdit(true);
                          setEditData(brand);
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setOpenConfirmBoxDelete(true);
                          setDeleteBrand(brand);
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

          {/* Pagination */}
          {filteredBrands.length > itemsPerPage && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`px-4 py-2 border rounded ${
                    number === currentPage
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, pageNumbers.length)
                  )
                }
                disabled={currentPage === pageNumbers.length}
                className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {openUploadBrand && (
        <UploadBrandModel
          fetchData={fetchBrand}
          close={() => setOpenUploadBrand(false)}
        />
      )}

      {openEdit && (
        <EditBrand
          data={editData}
          close={() => setOpenEdit(false)}
          fetchData={fetchBrand}
        />
      )}

      {openConfimBoxDelete && (
        <ConfirmBox
          close={() => setOpenConfirmBoxDelete(false)}
          cancel={() => setOpenConfirmBoxDelete(false)}
          confirm={handleDeleteBrand}
        />
      )}
    </section>
  );
};

export default BrandPage;
