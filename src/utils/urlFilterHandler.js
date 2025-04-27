import { useParams, useLocation } from 'react-router-dom';
import Axios from './Axios';
import SummaryApi from '../common/SummaryApi';

/**
 * Custom hook to extract and process filter parameters from URL.
 *
 * Handles various URL patterns:
 * - /shop (base shop with no filters)
 * - /category/:categorySlug (filter by category)
 * - /category/:categorySlug/subcategory/:subcategorySlug (filter by category and subcategory)
 * - /category/:categorySlug/brand/:brandSlug (filter by category and brand)
 * - /category/:categorySlug/subcategory/:subcategorySlug/brand/:brandSlug (filter by category, subcategory, and brand)
 * - /brand/:brandSlug (filter by brand only)
 *
 * @returns {Object} An object containing:
 *   - urlFilters: The extracted filter objects with IDs
 *   - isLoading: Loading state
 *   - error: Any error that occurred
 *   - resolveFiltersFromUrl: Function to fetch and resolve slug values to IDs
 */
export const useUrlFilters = () => {
  const params = useParams();
  const location = useLocation();

  /**
   * Resolves slugs from URL to actual database IDs.
   * Loads and returns the required filter objects and IDs.
   */
  const resolveFiltersFromUrl = async () => {
    const { categorySlug, subcategorySlug, brandSlug } = params;
    const urlFilters = {
      category: '',
      subCategory: '',
      brand: [],
    };

    let categoryName = '';
    let subcategoryName = '';
    let brandName = '';

    try {
      // Step 1: Resolve category if present
      if (categorySlug) {
        const categoryResponse = await Axios({
          ...SummaryApi.getCategory,
          params: { slug: categorySlug },
        });

        if (
          categoryResponse.data.success &&
          categoryResponse.data.data.length > 0
        ) {
          const category = categoryResponse.data.data[0];
          urlFilters.category = category._id;
          categoryName = category.name;
        }
      }

      // Step 2: Resolve subcategory if present
      if (subcategorySlug && urlFilters.category) {
        const subcategoryResponse = await Axios({
          ...SummaryApi.getSubCategory,
          data: {
            category: urlFilters.category,
            slug: subcategorySlug,
          },
        });

        if (
          subcategoryResponse.data.success &&
          subcategoryResponse.data.data.length > 0
        ) {
          const subcategory = subcategoryResponse.data.data[0];
          urlFilters.subCategory = subcategory._id;
          subcategoryName = subcategory.name;
        }
      }

      // Step 3: Resolve brand if present
      if (brandSlug) {
        const brandResponse = await Axios({
          ...SummaryApi.getBrand,
          params: { slug: brandSlug },
        });

        if (brandResponse.data.success && brandResponse.data.data.length > 0) {
          const brand = brandResponse.data.data[0];
          urlFilters.brand = [brand._id];
          brandName = brand.name;
        }
      }

      return {
        urlFilters,
        displayNames: {
          categoryName,
          subcategoryName,
          brandName,
        },
      };
    } catch (error) {
      console.error('Error resolving filters from URL:', error);
      return {
        urlFilters: {
          category: '',
          subCategory: '',
          brand: [],
        },
        displayNames: {
          categoryName: '',
          subcategoryName: '',
          brandName: '',
        },
        error,
      };
    }
  };

  /**
   * Generates a page title based on the current URL filters
   */
  const generatePageTitle = (displayNames) => {
    const { categoryName, subcategoryName, brandName } = displayNames;

    if (brandName && subcategoryName && categoryName) {
      return `${brandName} ${subcategoryName} - ${categoryName}`;
    } else if (brandName && categoryName) {
      return `${brandName} - ${categoryName}`;
    } else if (subcategoryName && categoryName) {
      return `${subcategoryName} - ${categoryName}`;
    } else if (categoryName) {
      return categoryName;
    } else if (brandName) {
      return brandName;
    }

    return 'All Products';
  };

  /**
   * Builds breadcrumbs based on the current URL filters
   */
  const generateBreadcrumbs = (displayNames) => {
    const { categoryName, subcategoryName, brandName } = displayNames;
    const breadcrumbs = [
      { label: 'Home', url: '/' },
      { label: 'Shop', url: '/shop' },
    ];

    if (categoryName) {
      breadcrumbs.push({
        label: categoryName,
        url: `/category/${params.categorySlug}`,
      });
    }

    if (subcategoryName) {
      breadcrumbs.push({
        label: subcategoryName,
        url: `/category/${params.categorySlug}/subcategory/${params.subcategorySlug}`,
      });
    }

    if (brandName) {
      if (subcategoryName) {
        breadcrumbs.push({
          label: brandName,
          url: `/category/${params.categorySlug}/subcategory/${params.subcategorySlug}/brand/${params.brandSlug}`,
        });
      } else if (categoryName) {
        breadcrumbs.push({
          label: brandName,
          url: `/category/${params.categorySlug}/brand/${params.brandSlug}`,
        });
      } else {
        breadcrumbs.push({
          label: brandName,
          url: `/brand/${params.brandSlug}`,
        });
      }
    }

    return breadcrumbs;
  };

  return {
    resolveFiltersFromUrl,
    generatePageTitle,
    generateBreadcrumbs,
  };
};

export default useUrlFilters;
