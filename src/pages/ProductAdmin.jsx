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
import { FaEye, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';
import { valideURLConvert } from '../utils/valideURLConvert';

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
    const filtered = productData.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleViewProduct = (product) => {
    // Use the existing valideURLConvert function
    const productUrl = `/product/${valideURLConvert(product.name)}-${
      product._id
    }`;
    window.open(productUrl, '_blank');
  };

  // Get product status badge
  const getProductStatusBadge = (product) => {
    if (!product.productAvailability) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaTimes className="w-3 h-3 mr-1" />
          Discontinued
        </span>
      );
    } else if (product.stock <= 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FaTimes className="w-3 h-3 mr-1" />
          Out of Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheck className="w-3 h-3 mr-1" />
          Available ({product.stock})
        </span>
      );
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
      <div className="bg-white shadow-md flex items-center justify-between p-4 mb-4 rounded-lg">
        <h2 className="font-semibold text-xl">Product Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search products or SKU..."
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-medium"
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
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 text-left font-medium text-gray-700">
                      Image
                    </th>
                    <th className="p-3 text-left font-medium text-gray-700">
                      Product Details
                    </th>
                    <th className="p-3 text-left font-medium text-gray-700">
                      SKU
                    </th>
                    <th className="p-3 text-center font-medium text-gray-700">
                      Status
                    </th>
                    <th className="p-3 text-center font-medium text-gray-700">
                      Pricing
                    </th>
                    <th className="p-3 text-right font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          {product.image && product.image[0] ? (
                            <img
                              src={product.image[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="max-w-xs">
                          <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                            {product.name}
                          </h3>
                          <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                            {product.productType && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">
                                {product.productType}
                              </span>
                            )}
                            {product.weight && product.unit && (
                              <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700">
                                {product.weight}
                                {product.unit}
                              </span>
                            )}
                            {product.featured && (
                              <span className="bg-yellow-100 px-2 py-0.5 rounded text-yellow-700">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-sm">
                          {product.sku || (
                            <span className="text-gray-400 italic">No SKU</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {getProductStatusBadge(product)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="space-y-1">
                          {/* Regular Price */}
                          <div className="text-sm font-medium text-green-600">
                            {DisplayPriceInNaira(product.price)}
                          </div>

                          {/* Additional Prices */}
                          {product.price3weeksDelivery &&
                            product.price3weeksDelivery !== product.price && (
                              <div className="text-xs text-orange-600">
                                3W:{' '}
                                {DisplayPriceInNaira(
                                  product.price3weeksDelivery
                                )}
                              </div>
                            )}

                          {product.price5weeksDelivery &&
                            product.price5weeksDelivery !== product.price && (
                              <div className="text-xs text-red-600">
                                5W:{' '}
                                {DisplayPriceInNaira(
                                  product.price5weeksDelivery
                                )}
                              </div>
                            )}

                          {/* Discount Badge */}
                          {product.discount > 0 && (
                            <div className="text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded">
                              -{product.discount}%
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                            title="View Product"
                          >
                            <FaEye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setOpenEdit(true);
                              setEditData(product);
                            }}
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
                            title="Edit Product"
                          >
                            <FaEdit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setOpenConfirmBoxDelete(true);
                              setDeleteProduct(product);
                            }}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to{' '}
            {Math.min(indexOfLastItem, filteredProducts.length)} of{' '}
            {filteredProducts.length} products
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
                  className={`px-4 py-2 border rounded transition-colors ${
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
