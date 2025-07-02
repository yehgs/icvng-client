import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import { MdDelete } from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import { IoClose } from 'react-icons/io5';
import AddFieldComponent from '../components/AddFieldComponent';
import Axios from '../utils/Axios';
import { useNavigate } from 'react-router-dom';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';
import RichTextEditor from '../components/RichTextEditor';

const UploadProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: '',
    image: [],
    weight: '',
    brand: [],
    compatibleSystem: null,
    producer: null,
    productType: null,
    roastLevel: null,
    roastOrigin: '',
    blend: null,
    featured: false,
    aromaticProfile: '',
    alcoholLevel: '',
    coffeeOrigin: '',
    intensity: null,
    coffeeRoastAreas: null,
    category: null,
    subCategory: null,
    tags: [],
    attributes: [],
    unit: '',
    packaging: '',
    productAvailability: true,
    discount: '',
    description: '',
    shortDescription: '',
    additionalInfo: '',
    more_details: {},
    seoTitle: '',
    seoDescription: '',
    publish: 'PUBLISHED',
    relatedProducts: [],
  });

  const [imageLoading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState('');
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  // Selectors from Redux store
  const allCategory = useSelector((state) => state.product.allCategory);
  const allCoffeeRoastAreas = useSelector(
    (state) => state.product.coffeeRoastAreas
  );
  const allSubCategory = useSelector((state) => state.product.allSubCategory);
  const allBrands = useSelector((state) => state.product.allBrands);
  const allTags = useSelector((state) => state.product.allTags);
  const allAttributes = useSelector((state) => state.product.allAttributes);

  // State for selections
  const [selectBrand, setSelectBrand] = useState('');
  const [selectTag, setSelectTag] = useState('');
  const [selectAttribute, setSelectAttribute] = useState('');

  // State for additional field
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState('');

  // Filter subcategories when category changes
  useEffect(() => {
    if (data.category) {
      const filtered = allSubCategory.filter(
        (subCat) => subCat.category && subCat.category._id === data.category._id
      );
      setFilteredSubCategories(filtered);
      // Reset subcategory when category changes
      setData((prev) => ({
        ...prev,
        subCategory: null,
      }));
    } else {
      setFilteredSubCategories([]);
    }
  }, [data.category, allSubCategory]);

  // Handle change for general inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle image upload
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageLoading(true);
    const response = await uploadImage(file);
    const { data: ImageResponse } = response;
    const imageUrl = ImageResponse.data.url;

    setData((prev) => ({
      ...prev,
      image: [...prev.image, imageUrl],
    }));
    setImageLoading(false);
  };

  // Handle delete image
  const handleDeleteImage = (index) => {
    const newImages = [...data.image];
    newImages.splice(index, 1);
    setData((prev) => ({
      ...prev,
      image: newImages,
    }));
  };

  // Handle remove methods for each array field
  const handleRemoveArrayField = (field, index) => {
    const newArray = [...data[field]];
    newArray.splice(index, 1);
    setData((prev) => ({
      ...prev,
      [field]: newArray,
    }));
  };

  // Handle adding array fields
  const handleAddArrayField = (field, value) => {
    if (!value) return;
    setData((prev) => ({
      ...prev,
      [field]: [...prev[field], value],
    }));
  };

  // Handle add field for more details
  const handleAddField = () => {
    setData((prev) => ({
      ...prev,
      more_details: {
        ...prev.more_details,
        [fieldName]: '',
      },
    }));
    setFieldName('');
    setOpenAddField(false);
  };

  // Generate slug from product name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Generate slug from product name
    const slug = generateSlug(data.name);

    // Prepare submission data
    const submissionData = {
      ...data,
      slug,
      roastLevel: data.roastLevel || null,
    };

    console.log('Submitted Product Data:', submissionData);

    try {
      const response = await Axios({
        ...SummaryApi.createProduct,
        data: submissionData,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        successAlert(responseData.message);
        // Reset form
        setData({
          name: '',
          image: [],
          weight: '',
          brand: [],
          compatibleSystem: null,
          producer: null,
          productType: null,
          roastLevel: null,
          roastOrigin: '',
          blend: null,
          featured: false,
          aromaticProfile: '',
          alcoholLevel: '',
          coffeeOrigin: '',
          intensity: null,
          coffeeRoastAreas: null,
          category: null,
          subCategory: null,
          tags: [],
          attributes: [],
          unit: '',
          packaging: '',
          productAvailability: true,
          discount: '',
          description: '',
          shortDescription: '',
          additionalInfo: '',
          more_details: {},
          seoTitle: '',
          seoDescription: '',
          publish: 'PUBLISHED',
          relatedProducts: [],
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="">
      <div className="p-2 bg-white shadow-md flex items-center justify-between">
        <h2 className="font-semibold">Upload Product</h2>
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

          {/* SKU Display - Read Only */}
          <div className="grid gap-1">
            <label className="font-medium">SKU (Product Code)</label>
            <div className="bg-gray-100 p-2 border border-gray-300 rounded">
              <span className="text-gray-500">
                SKU will be auto-generated after product creation
              </span>
            </div>
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
            <label htmlFor="additionalInfo" className="font-medium">
              Additional Information
            </label>
            <RichTextEditor
              initialValue={data.additionalInfo || ''}
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
              {/**display uploaded image*/}
              <div className="flex flex-wrap gap-4">
                {data.image.map((img, index) => {
                  return (
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
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <label className="font-medium">Product Type</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              name="productType"
              value={data.productType}
              onChange={handleChange}
            >
              <option value={null}>Select Product Type</option>
              <option value="COFFEE">Coffee</option>
              <option value="MACHINE">Machine</option>
              <option value="ACCESSORIES">Accessories</option>
              <option value="COFFEE_BEANS">Coffee Beans</option>
              <option value="TEA">Tea</option>
              <option value="DRINKS">Drinks</option>
            </select>
          </div>

          {/* Featured Checkbox */}
          <div className="grid gap-1">
            <label className="font-medium flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={data.featured}
                onChange={handleChange}
                className="w-4 h-4"
              />
              Featured Product
            </label>
          </div>

          {/* Product Availability Checkbox */}
          <div className="grid gap-1">
            <label className="font-medium flex items-center gap-2">
              <input
                type="checkbox"
                name="productAvailability"
                checked={data.productAvailability}
                onChange={handleChange}
                className="w-4 h-4"
              />
              Product Available
            </label>
          </div>

          {/* Roast Origin Input */}
          <div className="grid gap-1">
            <label htmlFor="roastOrigin" className="font-medium">
              Roast Origin
            </label>
            <input
              id="roastOrigin"
              type="text"
              placeholder="Enter roast origin"
              name="roastOrigin"
              value={data.roastOrigin}
              onChange={handleChange}
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>

          <div className="grid gap-1">
            <label className="font-medium">Blend</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              name="blend"
              value={data.blend}
              onChange={handleChange}
            >
              <option value={null}>Select Blend</option>
              <option value="100% Arabica">100% Arabica</option>
              <option value="100% Robusta">100% Robusta</option>
              <option value="Arabica/Robusta Blend (70/30)">
                Arabica/Robusta Blend (70/30)
              </option>
              <option value="Arabica/Robusta Blend (30/70)">
                Arabica/Robusta Blend (30/70)
              </option>
              <option value="Arabica/Robusta Blend (80/20)">
                Arabica/Robusta Blend (80/20)
              </option>
              <option value="Arabica/Robusta Blend (40/60)">
                Arabica/Robusta Blend (40/60)
              </option>
              <option value="Arabica/Robusta Blend (60/40)">
                Arabica/Robusta Blend (60/40)
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
              <option value="Cappuccino Blend">Cappuccino Blend</option>
              <option value="African Blend">African Blend</option>
              <option value="Latin American Blend">Latin American Blend</option>
              <option value="Indonesian Blend">Indonesian Blend</option>
              <option value="Italian Roast Blend">Italian Roast Blend</option>
              <option value="French Roast Blend">French Roast Blend</option>
              <option value="Varius Blend">Varius Blend</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label className="font-medium">Intensity</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              name="intensity"
              value={data.intensity}
              onChange={handleChange}
            >
              <option value={null}>Select Intensity</option>
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

          <div className="grid gap-1">
            <label htmlFor="aromaticProfile" className="font-medium">
              Aromatic Profile
            </label>
            <input
              id="aromaticProfile"
              type="text"
              placeholder="Enter coffee aromatic profile"
              name="aromaticProfile"
              value={data.aromaticProfile}
              onChange={handleChange}
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="alcoholLevel" className="font-medium">
              Alcohol Level
            </label>
            <input
              id="alcoholLevel"
              type="text"
              placeholder="Enter alcohol level"
              name="alcoholLevel"
              value={data.alcoholLevel}
              onChange={handleChange}
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
          </div>

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

          <div className="grid gap-1">
            <label className="font-medium">Roast Level</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              name="roastLevel"
              value={data.roastLevel || ''}
              onChange={handleChange}
            >
              <option value={null}>Select Roast Level</option>
              <option value="LIGHT">Light</option>
              <option value="MEDIUM">Medium</option>
              <option value="DARK">Dark</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label className="font-medium">Coffee Roast Area</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              value={data.coffeeRoastAreas ? data.coffeeRoastAreas._id : ''}
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
                    <span>{b.city},</span>
                    <span>{b.region},</span>
                    <span>{b.country}</span>
                  </div>
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1">
            <label className="font-medium">Category</label>
            <div>
              <select
                className="bg-blue-50 border w-full p-2 rounded"
                value={data.category ? data.category._id : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    setData((prev) => ({
                      ...prev,
                      category: null,
                    }));
                    return;
                  }

                  const category = allCategory.find((el) => el._id === value);
                  setData((prev) => ({
                    ...prev,
                    category: category,
                  }));
                }}
                required
              >
                <option value={''}>Select Category</option>
                {allCategory.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-1">
            <label className="font-medium">Sub Category</label>
            <div>
              <select
                className="bg-blue-50 border w-full p-2 rounded"
                value={data.subCategory ? data.subCategory._id : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    setData((prev) => ({
                      ...prev,
                      subCategory: null,
                    }));
                    return;
                  }

                  const subCategory = allSubCategory.find(
                    (el) => el._id === value
                  );
                  setData((prev) => ({
                    ...prev,
                    subCategory: subCategory,
                  }));
                }}
                disabled={!data.category}
              >
                <option value={''}>
                  {data.category
                    ? 'Select Sub Category'
                    : 'Please select a category first'}
                </option>
                {filteredSubCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="weight" className="font-medium">
              Weight
            </label>
            <input
              id="weight"
              type="number"
              placeholder="Enter product weight in grams"
              name="weight"
              value={data.weight}
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
            <label htmlFor="unit" className="font-medium">
              Unit
            </label>
            <input
              id="unit"
              type="text"
              placeholder="Enter product unit"
              name="unit"
              value={data.unit}
              onChange={handleChange}
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
            />
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

          <div className="grid gap-1">
            <label className="font-medium">Brands</label>
            <div>
              <select
                className="bg-blue-50 border w-full p-2 rounded"
                value={selectBrand}
                onChange={(e) => {
                  const value = e.target.value;
                  const brand = allBrands.find((el) => el._id === value);
                  handleAddArrayField('brand', brand);
                  setSelectBrand('');
                }}
              >
                <option value={''}>Select Brand</option>
                {allBrands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-3">
                {data.brand.map((b, index) => (
                  <div
                    key={b._id}
                    className="text-sm flex items-center gap-1 bg-blue-50 mt-2 p-1 rounded"
                  >
                    <p>{b.name}</p>
                    <div
                      className="hover:text-red-500 cursor-pointer"
                      onClick={() => handleRemoveArrayField('brand', index)}
                    >
                      <IoClose size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <label className="font-medium">Compatible System</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              value={data.compatibleSystem ? data.compatibleSystem._id : ''}
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
              value={data.producer ? data.producer._id : ''}
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
            <label className="font-medium">Tags</label>
            <div>
              <select
                className="bg-blue-50 border w-full p-2 rounded"
                value={selectTag}
                onChange={(e) => {
                  const value = e.target.value;
                  const tag = allTags.find((el) => el._id === value);
                  handleAddArrayField('tags', tag);
                  setSelectTag('');
                }}
              >
                <option value={''}>Select Tag</option>
                {allTags.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-3">
                {data.tags.map((t, index) => (
                  <div
                    key={t._id}
                    className="text-sm flex items-center gap-1 bg-blue-50 mt-2 p-1 rounded"
                  >
                    <p>{t.name}</p>
                    <div
                      className="hover:text-red-500 cursor-pointer"
                      onClick={() => handleRemoveArrayField('tags', index)}
                    >
                      <IoClose size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <label className="font-medium">Attributes</label>
            <div>
              <select
                className="bg-blue-50 border w-full p-2 rounded"
                value={selectAttribute}
                onChange={(e) => {
                  const value = e.target.value;
                  const attribute = allAttributes.find(
                    (el) => el._id === value
                  );
                  handleAddArrayField('attributes', attribute);
                  setSelectAttribute('');
                }}
              >
                <option value={''}>Select Attribute</option>
                {allAttributes.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-3">
                {data.attributes.map((a, index) => (
                  <div
                    key={a._id}
                    className="text-sm flex items-center gap-1 bg-blue-50 mt-2 p-1 rounded"
                  >
                    <p>{a.name}</p>
                    <div
                      className="hover:text-red-500 cursor-pointer"
                      onClick={() =>
                        handleRemoveArrayField('attributes', index)
                      }
                    >
                      <IoClose size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="seoTitle" className="font-medium">
              SEO Title
            </label>
            <input
              id="seoTitle"
              type="text"
              placeholder="Enter SEO title"
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
              placeholder="Enter SEO description"
              name="seoDescription"
              value={data.seoDescription}
              onChange={handleChange}
              rows={3}
              className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none"
            />
          </div>

          <div className="grid gap-1">
            <label className="font-medium">Publish</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              name="publish"
              value={data.publish}
              onChange={handleChange}
            >
              <option value="PUBLISHED">Published</option>
              <option value="PENDING">Pending</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/**add more field**/}
          {Object.keys(data.more_details).map((k) => (
            <div className="grid gap-1" key={k}>
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
            Submit
          </button>
        </form>
      </div>

      {ViewImageURL && (
        <ViewImage url={ViewImageURL} close={() => setViewImageURL('')} />
      )}

      {openAddField && (
        <AddFieldComponent
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          submit={handleAddField}
          close={() => setOpenAddField(false)}
        />
      )}
    </section>
  );
};

export default UploadProduct;
