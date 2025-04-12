import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { toast } from 'react-hot-toast';

const CompatibleSys = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [compatibleSystem, setCompatibleSystem] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {}, // Fetch all products
      });

      if (response.data.success) {
        setProducts(response.data.data);
        setFilteredProducts(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setCompatibleSystem(product.compatibleSystem || '');
  };

  const handleUpdateCompatibleSystem = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.updateCompatibleSystem,
        data: {
          productId: selectedProduct._id,
          compatibleSystem,
        },
      });

      if (response.data.success) {
        toast.success('Compatible system updated successfully');
        fetchProducts();
        // Update the local state
        const updatedProducts = products.map((p) =>
          p._id === selectedProduct._id ? { ...p, compatibleSystem } : p
        );
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
      }
    } catch (error) {
      toast.error('Failed to update compatible system');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Compatible System Management</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Product List</h3>
          <div className="max-h-[500px] overflow-y-auto border rounded">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Brand</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedProduct?._id === product._id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <td className="p-2 border">{product.name}</td>
                    <td className="p-2 border">{product.brand.name}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => handleProductSelect(product)}
                        className="text-blue-500"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">
            Compatible System Details
          </h3>
          {selectedProduct ? (
            <div className="border rounded p-4">
              <h4 className="text-lg font-bold mb-2">{selectedProduct.name}</h4>
              <div className="mb-4">
                <label className="block mb-2">Compatible System</label>
                <textarea
                  value={compatibleSystem}
                  onChange={(e) => setCompatibleSystem(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="5"
                  placeholder="Enter compatible system details..."
                />
              </div>
              <button
                onClick={handleUpdateCompatibleSystem}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Update Compatible System
              </button>
            </div>
          ) : (
            <div className="border rounded p-4 text-center text-gray-500">
              Select a product to view/edit compatible system
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompatibleSys;
