import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import {
  FaAngleRight,
  FaAngleLeft,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaTruck,
  FaShieldAlt,
  FaLeaf,
} from 'react-icons/fa';
import { DisplayPriceInNaira } from '../utils/DisplayPriceInNaira';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import AddToCartButton from '../components/AddToCartButton';

// New components
import RoastIndicator from '../components/RoastIndicator';
import IntensityMeter from '../components/IntensityMeter';

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
    discount: 0,
    stock: 0,
  });
  const [image, setImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const fetchProductDetails = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: {
          productId: productId,
        },
      });

      const { data: responseData } = response;

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

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0 && newQuantity <= data.stock) {
      setQuantity(newQuantity);
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
        <div className="text-sm mb-6 text-gray-500">
          Home / {data.productType?.toLowerCase() || 'Products'} / {data.name}
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
              {data.image.length > 4 && (
                <div className="absolute top-0 right-0 left-0 flex justify-between items-center h-full pointer-events-none">
                  <button
                    onClick={() => {
                      const container =
                        document.querySelector('.scrollbar-thin');
                      container.scrollLeft -= 100;
                    }}
                    className="bg-white rounded-full shadow-md p-2 hover:bg-gray-100 pointer-events-auto"
                  >
                    <FaAngleLeft />
                  </button>
                  <button
                    onClick={() => {
                      const container =
                        document.querySelector('.scrollbar-thin');
                      container.scrollLeft += 100;
                    }}
                    className="bg-white rounded-full shadow-md p-2 hover:bg-gray-100 pointer-events-auto"
                  >
                    <FaAngleRight />
                  </button>
                </div>
              )}
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

            {/* Price and Stock */}
            <div className="space-y-2">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-green-700">
                  {DisplayPriceInNaira(
                    pricewithDiscount(data.price, data.discount)
                  )}
                </span>
                {data.discount > 0 && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {DisplayPriceInNaira(data.price)}
                    </span>
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-sm font-medium">
                      {data.discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center text-sm">
                <span
                  className={data.stock > 0 ? 'text-green-600' : 'text-red-500'}
                >
                  {data.stock > 0 ? 'In Stock' : 'Available on Request'}
                </span>
                {data.stock > 0 && (
                  <span className="ml-2 text-gray-500">({data.stock})</span>
                )}
              </div>
            </div>

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

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center border rounded-md w-32">
                <button
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0 && val <= data.stock) {
                      setQuantity(val);
                    }
                  }}
                  className="w-full text-center py-2 focus:outline-none"
                  min="1"
                  max={data.stock}
                />
                <button
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= data.stock}
                >
                  +
                </button>
              </div>

              <div className="flex-1">
                <AddToCartButton data={data} quantity={quantity} />
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 border-t border-b py-4">
              <div className="flex flex-col items-center text-center">
                <FaTruck className="text-green-700 text-2xl mb-2" />
                <span className="text-sm font-medium">Fast Delivery</span>
                <span className="text-xs text-gray-500">Within 48 hours</span>
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
                {data.ratings.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="text-5xl font-bold mr-4">
                        {data.averageRating.toFixed(1)}
                      </div>
                      <div>
                        <div className="flex">
                          {renderStars(data.averageRating)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Based on {data.ratings.length} reviews
                        </div>
                      </div>
                    </div>

                    <button className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded">
                      Write a Review
                    </button>

                    {/* We'd need to fetch actual review data here */}
                    <p className="text-gray-500">
                      Reviews will be displayed here when fetched from the
                      server.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      There are no reviews yet.
                    </p>
                    <button className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded">
                      Be the first to write a review
                    </button>
                  </div>
                )}
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
    </div>
  );
};

export default ProductDisplayPage;
