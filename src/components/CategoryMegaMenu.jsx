import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const CategoryMegaMenu = ({ category }) => {
  const [categoryData, setCategoryData] = useState({
    subCategories: [],
    brands: [],
    loading: true,
  });

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await axios.get(`/api/mega-menu/${category._id}`);
        if (response.data.success) {
          setCategoryData({
            subCategories: response.data.subCategories || [],
            brands: response.data.brands || [],
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching mega menu data:', error);
        setCategoryData({
          subCategories: [],
          brands: [],
          loading: false,
        });
      }
    };

    fetchCategoryData();
  }, [category._id]);

  const { subCategories, brands, loading } = categoryData;
  const hasSubcategories = subCategories.length > 0;

  if (loading) {
    return (
      <div className="absolute left-0 w-full bg-white shadow-lg z-50 p-6 mt-2">
        <div className="container mx-auto">Loading...</div>
      </div>
    );
  }

  return (
    <div className="absolute left-0 w-full bg-white shadow-lg z-50 mt-2 border-t-2 border-secondary-200">
      <div className="container mx-auto p-6">
        {hasSubcategories ? (
          // First component: Category with subcategories
          <div className="grid grid-cols-4 gap-6">
            {subCategories.map((subCategory) => (
              <div key={subCategory._id} className="flex flex-col">
                <div className="mb-4">
                  <Link
                    to={`/category/${category.slug}/${subCategory.slug}`}
                    className="block"
                  >
                    <div className="relative h-40 w-full overflow-hidden rounded mb-2">
                      <img
                        src={subCategory.image || '/api/placeholder/200/200'}
                        alt={subCategory.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-medium text-sm">{subCategory.name}</h3>
                  </Link>
                </div>
                <div className="flex flex-col space-y-1">
                  {subCategory.brands &&
                    subCategory.brands.map((brand) => (
                      <Link
                        key={brand._id}
                        to={`/category/${category.slug}/${subCategory.slug}/brand/${brand.slug}`}
                        className="text-xs text-gray-600 hover:text-secondary-200 hover:underline"
                      >
                        {brand.name}
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Second component: Category without subcategories, showing only brands
          <div className="grid grid-cols-6 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                to={`/category/${category.slug}/brand/${brand.slug}`}
                className="block"
              >
                <div className="h-24 flex items-center justify-center bg-gray-50 p-2 rounded">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-16 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-center text-sm font-medium">
                      {brand.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-6">
          <Link
            to={`/category/${category.slug}`}
            className="inline-block px-4 py-2 bg-secondary-200 text-white rounded hover:bg-secondary-100 text-sm"
          >
            View All {category.name}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryMegaMenu;
