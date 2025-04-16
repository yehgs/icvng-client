import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import { MdDelete } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { IoClose } from 'react-icons/io5';
import AddFieldComponent from '../components/AddFieldComponent';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';
import RichTextEditor from './RichTextEditor';

const EditProductAdmin = ({ close, data: propsData, fetchProductData }) => {
  const [data, setData] = useState({
    _id: propsData._id,
    name: propsData.name || '',
    image: propsData.image || [],
    weight: propsData.weight || '',
    blend: propsData.blend || '',
    aromaticProfile: propsData.aromaticProfile || '',
    coffeeOrigin: propsData.coffeeOrigin || '',
    intensity: propsData.intensity || '',
    coffeeRoastAreas: propsData.coffeeRoastAreas || null,
    category: propsData.category || null,
    subCategory: propsData.subCategory || null,
    brand: propsData.brand || [],
    tags: propsData.tags || [],
    attributes: propsData.attributes || [],
    compatibleSystem: propsData.compatibleSystem || null,
    producer: propsData.producer || null,
    productType: propsData.productType || '',
    roastLevel: propsData.roastLevel || null,
    unit: propsData.unit || '',
    packaging: propsData.packaging || '',
    stock: propsData.stock || 0,
    price: propsData.price || 0,
    salePrice: propsData.salePrice || 0,
    btbPrice: propsData.btbPrice || 0,
    btcPrice: propsData.btcPrice || 0,
    discount: propsData.discount || 0,
    description: propsData.description || '',
    shortDescription: propsData.shortDescription || '',
    additionalInfo: propsData.additionalInfo || '',
    more_details: propsData.more_details || {},
    seoTitle: propsData.seoTitle || '',
    seoDescription: propsData.seoDescription || '',
    publish: propsData.publish || 'PENDING',
    slug: propsData.slug || '',
  });

  const [imageLoading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState('');
  const allCategory = useSelector((state) => state.product.allCategory);
  const allSubCategory = useSelector((state) => state.product.allSubCategory);
  const allBrands = useSelector((state) => state.product.allBrands) || [];
  const allTags = useSelector((state) => state.product.allTags) || [];
  const allAttributes =
    useSelector((state) => state.product.allAttributes) || [];
  const allCoffeeRoastAreas =
    useSelector((state) => state.product.coffeeRoastAreas) || [];

  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState('');

  // Initialize filtered subcategories based on the initial category
  useEffect(() => {
    if (data.category) {
      const categoryId = data.category._id || data.category;
      const filtered = allSubCategory.filter(
        (subCat) =>
          subCat.category &&
          (subCat.category._id === categoryId || subCat.category === categoryId)
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories([]);
    }
  }, [data.category, allSubCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }
    setImageLoading(true);
    const response = await uploadImage(file);
    const { data: ImageResponse } = response;
    const imageUrl = ImageResponse.data.url;

    setData((prev) => {
      return {
        ...prev,
        image: [...prev.image, imageUrl],
      };
    });
    setImageLoading(false);
  };

  const handleDeleteImage = async (index) => {
    const updatedImages = [...data.image];
    updatedImages.splice(index, 1);
    setData((prev) => ({
      ...prev,
      image: updatedImages,
    }));
  };

  const handleArrayChange = (field, value, action) => {
    if (action === 'add') {
      setData((prev) => ({
        ...prev,
        [field]: Array.isArray(prev[field]) ? [...prev[field], value] : [value],
      }));
    } else if (action === 'remove') {
      const updatedItems = Array.isArray(data[field]) ? [...data[field]] : [];
      updatedItems.splice(value, 1);
      setData((prev) => ({
        ...prev,
        [field]: updatedItems,
      }));
    }
  };

  const handleAddField = () => {
    if (!fieldName.trim()) return;

    setData((prev) => {
      return {
        ...prev,
        more_details: {
          ...prev.more_details,
          [fieldName]: '',
        },
      };
    });
    setFieldName('');
    setOpenAddField(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios({
        ...SummaryApi.updateProductDetails,
        data: data,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        successAlert(responseData.message);
        if (close) {
          close();
        }
        fetchProductData();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Helper function to get ID regardless of object or string format
  const getEntityId = (entity) => {
    if (!entity) return '';
    return typeof entity === 'object' ? entity._id : entity;
  };

  return (
    <section className="fixed top-0 right-0 left-0 bottom-0 bg-black z-50 bg-opacity-70 p-4">
      <div className="bg-white w-full p-4 max-w-2xl mx-auto rounded overflow-y-auto h-full max-h-[95vh]">
        <section className="">
          <div className="p-2 bg-white shadow-md flex items-center justify-between">
            <h2 className="font-semibold">Edit Product</h2>
            <button onClick={close}>
              <IoClose size={20} />
            </button>
          </div>
          <div className="grid p-3">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-1">
                <label htmlFor="name" className="font-medium">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter product name"
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  required
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="slug" className="font-medium">
                  Slug (auto-generated if left empty)
                </label>
                <input
                  id="slug"
                  type="text"
                  placeholder="product-slug"
                  name="slug"
                  value={data.slug}
                  onChange={handleChange}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="shortDescription" className="font-medium">
                  Short Description
                </label>
                <textarea
                  id="shortDescription"
                  type="text"
                  placeholder="Enter product short description"
                  name="shortDescription"
                  value={data.shortDescription}
                  onChange={handleChange}
                  required
                  multiple
                  rows={3}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="description" className="font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  type="text"
                  placeholder="Enter product description"
                  name="description"
                  value={data.description}
                  onChange={handleChange}
                  multiple
                  rows={3}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="shortDescription" className="font-medium">
                  Additional Information
                </label>
                <RichTextEditor
                  initialValue={data.additionalInfo}
                  onChange={(content) => {
                    setData((prev) => ({
                      ...prev,
                      additionalInfo: content,
                    }));
                  }}
                />
              </div>
              <div>
                <p className="font-medium">Image</p>
                <div>
                  <label
                    htmlFor="productImage"
                    className="bg-blue-50 h-24 border rounded flex justify-center items-center cursor-pointer"
                  >
                    <div className="text-center flex justify-center items-center flex-col">
                      {imageLoading ? (
                        <Loading />
                      ) : (
                        <>
                          <FaCloudUploadAlt size={35} />
                          <p>Upload Image</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      id="productImage"
                      className="hidden"
                      accept="image/*"
                      onChange={handleUploadImage}
                    />
                  </label>
                  {/* display uploaded images */}
                  <div className="flex flex-wrap gap-4">
                    {data.image.map((img, index) => (
                      <div
                        key={img + index}
                        className="h-20 mt-1 w-20 min-w-20 bg-blue-50 border relative group"
                      >
                        <img
                          src={img}
                          alt={img}
                          className="w-full h-full object-scale-down cursor-pointer"
                          onClick={() => setViewImageURL(img)}
                        />
                        <div
                          onClick={() => handleDeleteImage(index)}
                          className="absolute bottom-0 right-0 p-1 bg-red-600 hover:bg-red-600 rounded text-white hidden group-hover:block cursor-pointer"
                        >
                          <MdDelete />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Type Selection */}
              <div className="grid gap-1">
                <label htmlFor="productType" className="font-medium">
                  Product Type
                </label>
                <select
                  id="productType"
                  name="productType"
                  className="bg-blue-50 border w-full p-2 rounded"
                  value={data.productType}
                  onChange={handleChange}
                >
                  <option value="">Select Product Type</option>
                  <option value="COFFEE">Coffee</option>
                  <option value="MACHINE">Machine</option>
                  <option value="ACCESSORIES">Accessories</option>
                  <option value="COFFEE BEANS">Coffee Bean</option>
                  <option value="TEA">Tea</option>
                </select>
              </div>

              {/* Blend Selection */}
              <div className="grid gap-1">
                <label className="font-medium">Blend</label>
                <select
                  className="bg-blue-50 border w-full p-2 rounded"
                  name="blend"
                  value={data.blend}
                  onChange={handleChange}
                >
                  <option value="">Select Blend</option>
                  <option value="100% Arabica">100% Arabica</option>
                  <option value="100% Robusta">100% Robusta</option>
                  <option value="Arabica/Robusta Blend (70/30)">
                    Arabica/Robusta Blend (70/30)
                  </option>
                  <option value="Arabica/Robusta Blend (80/20)">
                    Arabica/Robusta Blend (80/20)
                  </option>
                  <option value="Arabica/Robusta Blend (40/60)">
                    Arabica/Robusta Blend (40/60)
                  </option>
                  <option value="Single Origin Arabica">
                    Single Origin Arabica
                  </option>
                  <option value="Estate Blend">Estate Blend</option>
                  <option value="House Blend">House Blend</option>
                  <option value="Breakfast Blend">Breakfast Blend</option>
                  <option value="Espresso Blend">Espresso Blend</option>
                  <option value="Mocha-Java Blend">Mocha-Java Blend</option>
                  <option value="Mocha Italia">Mocha Italia</option>
                  <option value="African Blend">African Blend</option>
                  <option value="Latin American Blend">
                    Latin American Blend
                  </option>
                  <option value="Indonesian Blend">Indonesian Blend</option>
                  <option value="Italian Roast Blend">
                    Italian Roast Blend
                  </option>
                  <option value="French Roast Blend">French Roast Blend</option>
                  <option value="Varius Blend">Varius Blend</option>
                </select>
              </div>

              {/* Intensity Selection */}
              <div className="grid gap-1">
                <label className="font-medium">Intensity</label>
                <select
                  className="bg-blue-50 border w-full p-2 rounded"
                  name="intensity"
                  value={data.intensity}
                  onChange={handleChange}
                >
                  <option value="">Select Intensity</option>
                  {[...Array(10)].map((_, i) => {
                    const value = `${i + 1}/10`;
                    return (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Aromatic Profile Input */}
              <div className="grid gap-1">
                <label htmlFor="aromaticProfile" className="font-medium">
                  Aromatic Profile
                </label>
                <input
                  id="aromaticProfile"
                  type="text"
                  placeholder="Enter coffee Aromatic profile"
                  name="aromaticProfile"
                  value={data.aromaticProfile}
                  onChange={handleChange}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>

              {/* Coffee Origin Input */}
              <div className="grid gap-1">
                <label htmlFor="coffeeOrigin" className="font-medium">
                  Coffee Origin
                </label>
                <input
                  id="coffeeOrigin"
                  type="text"
                  placeholder="Enter Coffee Origin"
                  name="coffeeOrigin"
                  value={data.coffeeOrigin}
                  onChange={handleChange}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>

              {/* Coffee Roast Area Selection */}
              <div className="grid gap-1">
                <label className="font-medium">Coffee Roast Area</label>
                <select
                  className="bg-blue-50 border w-full p-2 rounded"
                  value={
                    data.coffeeRoastAreas
                      ? getEntityId(data.coffeeRoastAreas)
                      : ''
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      setData((prev) => ({
                        ...prev,
                        coffeeRoastAreas: null,
                      }));
                      return;
                    }

                    const coffeeRoastArea = allCoffeeRoastAreas.find(
                      (el) => el._id === value
                    );
                    setData((prev) => ({
                      ...prev,
                      coffeeRoastAreas: coffeeRoastArea,
                    }));
                  }}
                >
                  <option value={''}>Select Coffee Roast Area</option>
                  {allCoffeeRoastAreas.map((b) => (
                    <option key={b._id} value={b._id}>
                      <div className="flex gap-1">
                        <span className="uppercase">{b.city},</span>
                        <span className="uppercase">{b.region},</span>
                        <span className="uppercase">{b.country}</span>
                      </div>
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selection */}
              <div className="grid gap-1">
                <label htmlFor="category" className="font-medium">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="bg-blue-50 border w-full p-2 rounded"
                  value={getEntityId(data.category)}
                  onChange={(e) => {
                    const selectedCategory = allCategory.find(
                      (cat) => cat._id === e.target.value
                    );
                    setData((prev) => ({
                      ...prev,
                      category: selectedCategory || null,
                      subCategory: null, // Reset subcategory when category changes
                    }));
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  {allCategory.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category Selection */}
              <div className="grid gap-1">
                <label htmlFor="subCategory" className="font-medium">
                  Sub Category
                </label>
                <select
                  id="subCategory"
                  name="subCategory"
                  className="bg-blue-50 border w-full p-2 rounded"
                  value={getEntityId(data.subCategory)}
                  onChange={(e) => {
                    const selectedSubCategory = allSubCategory.find(
                      (sub) => sub._id === e.target.value
                    );
                    setData((prev) => ({
                      ...prev,
                      subCategory: selectedSubCategory || null,
                    }));
                  }}
                >
                  <option value="">Select Sub Category</option>
                  {filteredSubCategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* weight */}
              <div className="grid gap-1">
                <label htmlFor="weight" className="font-medium">
                  Weight
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  className="bg-blue-50 border w-full p-2 rounded"
                  value={data.weight}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="unit" className="font-medium">
                  Unit
                </label>
                <input
                  id="unit"
                  type="text"
                  placeholder="Enter product Unit"
                  name="unit"
                  value={data.unit}
                  onChange={handleChange}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="packaging" className="font-medium">
                  Packaging
                </label>
                <input
                  id="packaging"
                  type="text"
                  placeholder="Enter product packaging"
                  name="packaging"
                  value={data.packaging}
                  onChange={handleChange}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="stock" className="font-medium">
                  Number of Stock
                </label>
                <input
                  id="stock"
                  type="number"
                  placeholder="Enter product stock"
                  name="stock"
                  value={data.stock}
                  onChange={handleChange}
                  required
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label htmlFor="price" className="font-medium">
                    Regular Price
                  </label>
                  <input
                    id="price"
                    type="number"
                    placeholder="Enter product price"
                    name="price"
                    value={data.price}
                    onChange={handleChange}
                    required
                    className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                  />
                </div>

                <div className="grid gap-1">
                  <label htmlFor="salePrice" className="font-medium">
                    Sale Price
                  </label>
                  <input
                    id="salePrice"
                    type="number"
                    placeholder="Enter sale price"
                    name="salePrice"
                    value={data.salePrice}
                    onChange={handleChange}
                    className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label htmlFor="btbPrice" className="font-medium">
                    Business to Business Price
                  </label>
                  <input
                    id="btbPrice"
                    type="number"
                    placeholder="Enter B2B price"
                    name="btbPrice"
                    value={data.btbPrice}
                    onChange={handleChange}
                    className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                  />
                </div>

                <div className="grid gap-1">
                  <label htmlFor="btcPrice" className="font-medium">
                    Business to Customer Price
                  </label>
                  <input
                    id="btcPrice"
                    type="number"
                    placeholder="Enter B2C price"
                    name="btcPrice"
                    value={data.btcPrice}
                    onChange={handleChange}
                    className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <label htmlFor="discount" className="font-medium">
                  Discount
                </label>
                <input
                  id="discount"
                  type="number"
                  placeholder="Enter product discount"
                  name="discount"
                  value={data.discount}
                  onChange={handleChange}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>

              {/* Brand Selection */}
              <div className="grid gap-1">
                <label className="font-medium">Brand</label>
                <select
                  className="bg-blue-50 border w-full p-2 rounded"
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const selectedBrand = allBrands.find(
                      (b) => b._id === e.target.value
                    );
                    if (
                      selectedBrand &&
                      !data.brand.some(
                        (b) => getEntityId(b) === selectedBrand._id
                      )
                    ) {
                      handleArrayChange('brand', selectedBrand, 'add');
                    }
                  }}
                >
                  <option value="">Select Brand</option>
                  {allBrands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-3 mt-2">
                  {Array.isArray(data.brand) &&
                    data.brand.map((b, index) => (
                      <div
                        key={getEntityId(b) + index}
                        className="text-sm flex items-center gap-1 bg-blue-50 p-1 rounded"
                      >
                        <p>{b.name}</p>
                        <div
                          className="hover:text-red-500 cursor-pointer"
                          onClick={() =>
                            handleArrayChange('brand', index, 'remove')
                          }
                        >
                          <IoClose size={20} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Tags Selection */}
              <div className="grid gap-1">
                <label className="font-medium">Tags</label>
                <select
                  className="bg-blue-50 border w-full p-2 rounded"
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const selectedTag = allTags.find(
                      (t) => t._id === e.target.value
                    );
                    if (
                      selectedTag &&
                      !data.tags.some((t) => getEntityId(t) === selectedTag._id)
                    ) {
                      handleArrayChange('tags', selectedTag, 'add');
                    }
                  }}
                >
                  <option value="">Select Tag</option>
                  {allTags.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-3 mt-2">
                  {Array.isArray(data.tags) &&
                    data.tags.map((t, index) => (
                      <div
                        key={getEntityId(t) + index}
                        className="text-sm flex items-center gap-1 bg-blue-50 p-1 rounded"
                      >
                        <p>{t.name}</p>
                        <div
                          className="hover:text-red-500 cursor-pointer"
                          onClick={() =>
                            handleArrayChange('tags', index, 'remove')
                          }
                        >
                          <IoClose size={20} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Attributes Selection */}
              <div className="grid gap-1">
                <label className="font-medium">Attributes</label>
                <select
                  className="bg-blue-50 border w-full p-2 rounded"
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const selectedAttr = allAttributes.find(
                      (a) => a._id === e.target.value
                    );
                    if (
                      selectedAttr &&
                      !data.attributes.some(
                        (a) => getEntityId(a) === selectedAttr._id
                      )
                    ) {
                      handleArrayChange('attributes', selectedAttr, 'add');
                    }
                  }}
                >
                  <option value="">Select Attribute</option>
                  {allAttributes.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-3 mt-2">
                  {Array.isArray(data.attributes) &&
                    data.attributes.map((a, index) => (
                      <div
                        key={getEntityId(a) + index}
                        className="text-sm flex items-center gap-1 bg-blue-50 p-1 rounded"
                      >
                        <p>{a.name}</p>
                        <div
                          className="hover:text-red-500 cursor-pointer"
                          onClick={() =>
                            handleArrayChange('attributes', index, 'remove')
                          }
                        >
                          <IoClose size={20} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Compatible System Selection */}
              <div className="grid gap-1">
                <label className="font-medium">Compatible System</label>
                <select
                  className="bg-blue-50 border w-full p-2 rounded"
                  value={getEntityId(data.compatibleSystem)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      setData((prev) => ({
                        ...prev,
                        compatibleSystem: null,
                      }));
                      return;
                    }

                    const compatibleSystem = allBrands.find(
                      (el) => el._id === value
                    );
                    setData((prev) => ({
                      ...prev,
                      compatibleSystem: compatibleSystem,
                    }));
                  }}
                >
                  <option value={''}>Select Compatible System</option>
                  {allBrands
                    .filter((brand) => brand.compatibleSystem === true)
                    .map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid gap-1">
                <label className="font-medium">Producer</label>
                <select
                  className="bg-blue-50 border w-full p-2 rounded"
                  value={getEntityId(data.producer)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      setData((prev) => ({
                        ...prev,
                        producer: null,
                      }));
                      return;
                    }

                    const producer = allBrands.find((el) => el._id === value);
                    setData((prev) => ({
                      ...prev,
                      producer: producer,
                    }));
                  }}
                >
                  <option value={''}>Select Producer</option>
                  {allBrands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1">
                <label className="font-medium">Roast Level</label>
                <select
                  className="bg-blue-50 border w-full p-2 rounded"
                  name="roastLevel"
                  value={data.roastLevel || ''}
                  onChange={handleChange}
                >
                  <option value={''}>Select Roast Level</option>
                  <option value="LIGHT">Light</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="DARK">Dark</option>
                </select>
              </div>

              {/* Remove duplicate stock field */}

              {/* Remove duplicate price field */}

              {/* Remove duplicate discount field */}

              {/* Publish Status */}
              <div className="grid gap-1">
                <label htmlFor="publish" className="font-medium">
                  Publish Status
                </label>
                <select
                  id="publish"
                  name="publish"
                  className="bg-blue-50 border w-full p-2 rounded"
                  value={data.publish}
                  onChange={handleChange}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>

              {/* SEO Fields */}
              <div className="grid gap-1">
                <label htmlFor="seoTitle" className="font-medium">
                  SEO Title
                </label>
                <input
                  id="seoTitle"
                  type="text"
                  placeholder="SEO Title"
                  name="seoTitle"
                  value={data.seoTitle}
                  onChange={handleChange}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="seoDescription" className="font-medium">
                  SEO Description
                </label>
                <textarea
                  id="seoDescription"
                  placeholder="SEO Description"
                  name="seoDescription"
                  value={data.seoDescription}
                  onChange={handleChange}
                  rows={2}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none"
                />
              </div>

              {/* Additional Custom Fields */}
              {Object.keys(data.more_details || {}).map((k, index) => (
                <div key={k + index} className="grid gap-1">
                  <label htmlFor={k} className="font-medium">
                    {k}
                  </label>
                  <input
                    id={k}
                    type="text"
                    value={data.more_details[k]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setData((prev) => ({
                        ...prev,
                        more_details: {
                          ...prev.more_details,
                          [k]: value,
                        },
                      }));
                    }}
                    className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                  />
                </div>
              ))}

              <div
                onClick={() => setOpenAddField(true)}
                className="hover:bg-primary-200 bg-white py-1 px-3 w-32 text-center font-semibold border border-primary-200 hover:text-neutral-900 cursor-pointer rounded"
              >
                Add Fields
              </div>

              <button className="bg-primary-100 hover:bg-primary-200 py-2 rounded font-semibold">
                Update Product
              </button>
            </form>
          </div>

          {/* View Image Modal */}
          {ViewImageURL && (
            <ViewImage url={ViewImageURL} close={() => setViewImageURL('')} />
          )}

          {/* Add Field Modal */}
          {openAddField && (
            <AddFieldComponent
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              submit={handleAddField}
              close={() => setOpenAddField(false)}
            />
          )}
        </section>
      </div>
    </section>
  );
};

export default EditProductAdmin;
