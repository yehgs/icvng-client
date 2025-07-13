import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaTruck,
  FaShieldAlt,
  FaLeaf,
  FaClock,
  FaShippingFast,
  FaCalendarAlt,
  FaSadTear,
  FaEdit,
} from 'react-icons/fa';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import AddToCartButton from '../components/AddToCartButton';
import ProductRequestModal from '../components/ProductRequestModal';
import EditProductAdmin from '../components/EditProductAdmin';
import { useSelector } from 'react-redux';
import { useGlobalContext, useCurrency } from '../provider/GlobalProvider';

// New components
import RoastIndicator from '../components/RoastIndicator';
import IntensityMeter from '../components/IntensityMeter';
import RatingReviewComponent from '../components/RatingReviewComponent';

const ProductDisplayPage = () => {
  const params = useParams();
  let productId = params?.product?.split('-')?.slice(-1)[0];
  const [data, setData] = useState({
    name: '',
    image: [],
    brand: [],
    roastLevel: '',
    aromaticProfile: '',
    blend: '',
    intensity: '',
    coffeeOrigin: '',
    roastOrigin: '',
    productType: '',
    description: '',
    shortDescription: '',
    additionalInfo: '',
    more_details: {},
    weight: 0,
    unit: '',
    packaging: '',
    ratings: [],
    averageRating: 0,
    price: 0,
    price3weeksDelivery: 0,
    price5weeksDelivery: 0,
    discount: 0,
    stock: 0,
    productAvailability: true,
    sku: '',
    featured: false,
  });
  const [image, setImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedPriceOption, setSelectedPriceOption] = useState('regular');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  // Get user role from Redux store
  const user = useSelector((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  // Get currency context
  const { formatPrice, selectedCurrency } = useCurrency();
  const { getEffectiveStock } = useGlobalContext();

  // Get effective online stock
  const getEffectiveOnlineStock = () => {
    return getEffectiveStock(data);
  };

  // Listen for currency changes
  useEffect(() => {
    const handleCurrencyChange = () => {
      // Force re-render when currency changes
      setSelectedPriceOption(selectedPriceOption);
    };

    window.addEventListener('currency-changed', handleCurrencyChange);
    return () =>
      window.removeEventListener('currency-changed', handleCurrencyChange);
  }, [selectedPriceOption]);

  const fetchProductDetails = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: {
          productId: productId,
        },
      });

      const { data: responseData } = response;

      console.log(responseData);

      if (responseData.success) {
        setData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductDetails();
  }, [params]);

  // Fixed quantity change handler
  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  // Handle direct quantity input
  const handleQuantityInput = (e) => {
    const val = parseInt(e.target.value) || 1;
    if (val > 0) {
      setQuantity(val);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }

    return stars;
  };

  // Get selected price based on delivery option
  const getSelectedPrice = () => {
    switch (selectedPriceOption) {
      case '3weeks':
        return data.price3weeksDelivery || data.price;
      case '5weeks':
        return data.price5weeksDelivery || data.price;
      default:
        return data.price;
    }
  };

  // Price options configuration
  const priceOptions = [
    // Only show regular price if online stock > 0
    ...(getEffectiveOnlineStock() > 0
      ? [
          {
            key: 'regular',
            label: 'Regular Price',
            price: data.price,
            icon: <FaShippingFast className="text-green-600" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            description: 'Standard delivery (2-3 business days)',
            delivery: 'Fast Delivery',
          },
        ]
      : []),
    // Always show 3-week option if price exists
    ...(data.price3weeksDelivery > 0
      ? [
          {
            key: '3weeks',
            label: '3 Weeks Delivery',
            price: data.price3weeksDelivery,
            icon: <FaClock className="text-orange-600" />,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            description: 'Delivery in 3 weeks',
            delivery: '3 Week Special Order',
          },
        ]
      : []),
    // Always show 5-week option if price exists
    ...(data.price5weeksDelivery > 0
      ? [
          {
            key: '5weeks',
            label: '5 Weeks Delivery',
            price: data.price5weeksDelivery,
            icon: <FaCalendarAlt className="text-red-600" />,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            description: 'Special order delivery in 5 weeks',
            delivery: '5 Week Special Order',
          },
        ]
      : []),
  ];

  // Set default selected option based on available options
  useEffect(() => {
    if (
      priceOptions.length > 0 &&
      !priceOptions.find((opt) => opt.key === selectedPriceOption)
    ) {
      setSelectedPriceOption(priceOptions[0].key);
    }
  }, [
    data.warehouseStock,
    data.stock,
    data.price,
    data.price3weeksDelivery,
    data.price5weeksDelivery,
  ]);

  const handleRequestClick = () => {
    setShowRequestModal(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto p-4 pt-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-500">
            Home / {data.productType?.toLowerCase() || 'Products'} / {data.name}
          </div>

          {/* Admin Edit Button */}
          {isAdmin && (
            <button
              onClick={() => setOpenEditModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center"
            >
              <FaEdit className="mr-2" />
              Edit Product
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-96 flex items-center justify-center p-4">
                <img
                  src={data.image[image]}
                  alt={data.name}
                  className="max-h-full object-contain"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {data.image.map((img, index) => (
                  <div
                    key={`thumb-${index}`}
                    className={`cursor-pointer border-2 rounded p-1 min-w-20 h-20 ${
                      index === image ? 'border-green-600' : 'border-gray-200'
                    }`}
                    onClick={() => setImage(index)}
                  >
                    <img
                      src={img}
                      alt={`${data.name} - view ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Brand and Title */}
            <div>
              {data.brand && data.brand[0] && (
                <div className="flex items-center">
                  <p className="text-green-700 text-sm font-medium uppercase mb-1 mr-2">
                    {data.brand[0].name}
                  </p>
                  <img
                    src={data.brand[0].image}
                    className="w-12"
                    alt={data.brand[0].name}
                  />
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-800 capitalize">
                {data.name}
              </h1>

              {/* SKU */}
              {data.sku && (
                <p className="text-sm text-gray-500 mt-1">SKU: {data.sku}</p>
              )}

              {/* Featured Badge */}
              {data.featured && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-2">
                  Featured Product
                </span>
              )}

              {/* Rating */}
              <div className="flex items-center mt-2">
                <div className="flex mr-2">
                  {renderStars(data.averageRating)}
                </div>
                <span className="text-sm text-gray-500">
                  {data.averageRating.toFixed(1)} ({data.ratings.length}{' '}
                  reviews)
                </span>
              </div>
            </div>

            {/* Short Description */}
            {data.shortDescription && (
              <p className="text-gray-600">{data.shortDescription}</p>
            )}

            {/* Price Options */}
            {data.productAvailability ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Choose Delivery Option
                </h3>
                <div className="space-y-3">
                  {priceOptions.map((option) => (
                    <label
                      key={option.key}
                      className={`block cursor-pointer p-2 px-2 rounded-lg border-2 transition-all ${
                        selectedPriceOption === option.key
                          ? `${option.borderColor} ${option.bgColor}`
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priceOption"
                        value={option.key}
                        checked={selectedPriceOption === option.key}
                        onChange={(e) => setSelectedPriceOption(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {option.icon}
                          <div>
                            <div className="text-sm text-gray-600">
                              {option.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${option.color}`}>
                            {formatPrice(
                              pricewithDiscount(option.price, data.discount)
                            )}
                          </div>
                          {data.discount > 0 && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(option.price)}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Stock Status */}
                <div className="flex items-center text-sm">
                  <span
                    className={
                      getEffectiveOnlineStock() > 0
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }
                  >
                    {getEffectiveOnlineStock() > 0
                      ? 'In Stock'
                      : 'Available for Order'}
                  </span>
                  {getEffectiveOnlineStock() > 0 && (
                    <span className="ml-2 text-gray-500">
                      ({getEffectiveOnlineStock()} units available)
                    </span>
                  )}
                  {getEffectiveOnlineStock() === 0 && (
                    <span className="ml-2 text-orange-600 text-xs">
                      (Order will be processed by admin)
                    </span>
                  )}
                </div>

                {/* Discount Badge */}
                {data.discount > 0 && (
                  <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    {data.discount}% OFF - Save{' '}
                    {formatPrice((getSelectedPrice() * data.discount) / 100)}
                  </div>
                )}
              </div>
            ) : (
              /* Product Not Available */
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <FaSadTear className="text-yellow-600 text-3xl mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Not in Production
                </h3>
                <p className="text-yellow-700 mb-4">
                  This product is no longer being produced. You can request to
                  be notified if it becomes available again in the future.
                </p>
                <button
                  onClick={handleRequestClick}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md transition"
                >
                  Request Notification
                </button>
              </div>
            )}

            {/* Coffee attributes section */}
            {data.productType === 'COFFEE' && (
              <div className="bg-gray-50 p-4 rounded-lg grid md:grid-cols-2 gap-4">
                {data.weight && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Weight</span>
                    <span className="font-medium">
                      {data.weight} {data.unit}
                    </span>
                  </div>
                )}

                {data.packaging && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Packaging</span>
                    <span className="font-medium">{data.packaging}</span>
                  </div>
                )}

                {data.blend && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Blend</span>
                    <span className="font-medium">{data.blend}</span>
                  </div>
                )}

                {data.coffeeOrigin && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Origin</span>
                    <span className="font-medium">{data.coffeeOrigin}</span>
                  </div>
                )}

                {data.roastOrigin && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Roast Origin</span>
                    <span className="font-medium">{data.roastOrigin}</span>
                  </div>
                )}

                {data.aromaticProfile && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Profile</span>
                    <span className="font-medium">{data.aromaticProfile}</span>
                  </div>
                )}

                {data.roastLevel && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Roast Level</span>
                    <RoastIndicator level={data.roastLevel} />
                  </div>
                )}

                {data.intensity && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Intensity</span>
                    <IntensityMeter intensity={data.intensity} />
                  </div>
                )}
              </div>
            )}

            {/* Quantity and Add to Cart - Only show if product is available */}
            {data.productAvailability && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center border rounded-md w-32">
                  <button
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityInput}
                    className="w-full text-center py-2 focus:outline-none"
                    min="1"
                  />
                  <button
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
                    onClick={() => handleQuantityChange(1)}
                  >
                    +
                  </button>
                </div>

                <div className="flex-1">
                  <AddToCartButton
                    data={data}
                    quantity={quantity}
                    selectedPriceOption={selectedPriceOption}
                  />
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 border-t border-b py-4">
              <div className="flex flex-col items-center text-center">
                <FaTruck className="text-green-700 text-2xl mb-2" />
                <span className="text-sm font-medium">Fast Delivery</span>
                <span className="text-xs text-gray-500">Multiple Options</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <FaShieldAlt className="text-green-700 text-2xl mb-2" />
                <span className="text-sm font-medium">Quality Guarantee</span>
                <span className="text-xs text-gray-500">
                  100% Original Products
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <FaLeaf className="text-green-700 text-2xl mb-2" />
                <span className="text-sm font-medium">Sustainably Sourced</span>
                <span className="text-xs text-gray-500">
                  Eco-friendly options
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="border-b">
            <div className="flex flex-wrap -mb-px">
              <button
                className={`inline-block p-4 font-medium text-sm border-b-2 ${
                  activeTab === 'description'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              {/* Only show Additional Information tab if additionalInfo exists and is not empty */}
              {data.additionalInfo && data.additionalInfo.trim() !== '' && (
                <button
                  className={`inline-block p-4 font-medium text-sm border-b-2 ${
                    activeTab === 'additionalInfo'
                      ? 'border-green-700 text-green-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('additionalInfo')}
                >
                  Additional Information
                </button>
              )}
              <button
                className={`inline-block p-4 font-medium text-sm border-b-2 ${
                  activeTab === 'reviews'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({data.ratings.length})
              </button>
            </div>
          </div>

          <div className="py-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none grid md:grid-cols-2 gap-6">
                <div dangerouslySetInnerHTML={{ __html: data.description }} />
                {data.more_details &&
                  Object.keys(data.more_details).length > 0 && (
                    <div>
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="divide-y divide-gray-200">
                          {Object.keys(data.more_details).map((key) => (
                            <tr key={key}>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {key}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {data.more_details[key]}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            )}

            {activeTab === 'additionalInfo' && (
              <div className="grid md:grid-cols-2 gap-6">
                {data.additionalInfo && (
                  <div>
                    <h3 className="font-medium mb-2">Product Details</h3>
                    <div
                      dangerouslySetInnerHTML={{ __html: data.additionalInfo }}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <RatingReviewComponent
                  productId={productId}
                  onRatingAdded={fetchProductDetails}
                />
              </div>
            )}
          </div>
        </div>

        {/* Related Products would go here */}
        {data.relatedProducts && data.relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            {/* Related products grid would go here */}
            <p className="text-gray-500">
              Related products component would be rendered here
            </p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <ProductRequestModal
          product={data}
          onClose={() => setShowRequestModal(false)}
          isDiscontinued={!data.productAvailability}
        />
      )}

      {/* Admin Edit Modal */}
      {openEditModal && isAdmin && (
        <EditProductAdmin
          data={data}
          close={() => setOpenEditModal(false)}
          fetchProductData={fetchProductDetails}
        />
      )}
    </div>
  );
};

export default ProductDisplayPage;
