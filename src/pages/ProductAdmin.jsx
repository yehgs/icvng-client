import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import EditProductAdmin from '../components/EditProductAdmin';
import ConfirmBox from '../components/ConfirmBox';
import toast from 'react-hot-toast';
import { IoSearchOutline } from 'react-icons/io5';

const ProductAdmin = () => {
  const navigate = useNavigate();
  const [productData, setProductData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openConfirmBoxDelete, setOpenConfirmBoxDelete] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState({
    _id: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: 1,
          limit: 100, // Fetch more to handle client-side pagination
          search: '',
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        setProductData(responseData.data);
        setFilteredProducts(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    const filtered = productData.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, productData]);

  const handleDeleteProduct = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteProduct,
        data: {
          _id: deleteProduct._id,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchProductData();
        setOpenConfirmBoxDelete(false);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProducts.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <section className="p-4">
      <div className="bg-white shadow-md flex items-center justify-between p-4 mb-4">
        <h2 className="font-semibold text-xl">Product Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 pl-8 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <IoSearchOutline
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
          <button
            onClick={() => navigate('/dashboard/upload-product')}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredProducts.length === 0 ? (
        <NoData />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-center">Unit</th>
                  <th className="p-3 text-center">Price</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">
                      <img
                        src={product.image[0]}
                        alt={product.name}
                        className="w-24 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs">
                        <p className="line-clamp-2">{product.name}</p>
                      </div>
                    </td>
                    <td className="p-3 text-center">{product.unit}</td>
                    <td className="p-3 text-center">
                      ₦{product.price?.toFixed(2)}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setOpenEdit(true);
                          setEditData(product);
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setOpenConfirmBoxDelete(true);
                          setDeleteProduct(product);
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
          {filteredProducts.length > itemsPerPage && (
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
      {openEdit && (
        <EditProductAdmin
          data={editData}
          close={() => setOpenEdit(false)}
          fetchProductData={fetchProductData}
        />
      )}

      {openConfirmBoxDelete && (
        <ConfirmBox
          close={() => setOpenConfirmBoxDelete(false)}
          cancel={() => setOpenConfirmBoxDelete(false)}
          confirm={handleDeleteProduct}
        />
      )}
    </section>
  );
};

export default ProductAdmin;
