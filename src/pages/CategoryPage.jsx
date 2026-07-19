import React, { useEffect, useState } from 'react';
import UploadCategoryModel from '../components/UploadCategoryModel';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import EditCategory from '../components/EditCategory';
import ConfirmBox from '../components/ConfirmBox';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const CategoryPage = () => {
  const [openUploadCategory, setOpenUploadCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    image: '',
  });
  const [openConfimBoxDelete, setOpenConfirmBoxDelete] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState({
    _id: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getCategory,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        setCategoryData(responseData.data);
        setFilteredCategories(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    const filtered = categoryData.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, categoryData]);

  const handleDeleteCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteCategory,
        data: deleteCategory,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchCategory();
        setOpenConfirmBoxDelete(false);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(filteredCategories.length / itemsPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }

  return (
    <section className="p-4">
      <div className="bg-white shadow-md flex items-center justify-between p-4 mb-4">
        <h2 className="font-semibold text-xl">Category Management</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setOpenUploadCategory(true)}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredCategories.length === 0 ? (
        <NoData />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-3">{category.name}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setOpenEdit(true);
                          setEditData(category);
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setOpenConfirmBoxDelete(true);
                          setDeleteCategory(category);
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
          {filteredCategories.length > itemsPerPage && (
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
      {openUploadCategory && (
        <UploadCategoryModel
          fetchData={fetchCategory}
          close={() => setOpenUploadCategory(false)}
        />
      )}

      {openEdit && (
        <EditCategory
          data={editData}
          close={() => setOpenEdit(false)}
          fetchData={fetchCategory}
        />
      )}

      {openConfimBoxDelete && (
        <ConfirmBox
          close={() => setOpenConfirmBoxDelete(false)}
          cancel={() => setOpenConfirmBoxDelete(false)}
          confirm={handleDeleteCategory}
        />
      )}
    </section>
  );
};

export default CategoryPage;
