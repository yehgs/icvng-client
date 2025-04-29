import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { useFilterState } from './useFilterState';

/**
 * Enhanced version of useUrlFilters hook that works with Redux state
 *
 * Handles various URL patterns:
 * - /shop (base shop with no filters)
 * - /category/:categorySlug (filter by category)
 * - /category/:categorySlug/subcategory/:subcategorySlug (filter by category and subcategory)
 * - /category/:categorySlug/brand/:brandSlug (filter by category and brand)
 * - /category/:categorySlug/subcategory/:subcategorySlug/brand/:brandSlug (filter by category, subcategory, and brand)
 * - /brand/:brandSlug (filter by brand only)
 */
export const useUrlFilters = () => {
  const params = useParams();
  const location = useLocation();
  const previousUrl = useRef(location.pathname);
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);

  const {
    activeFilters,
    urlState,
    setFromUrl,
    setUrlLoadingState,
    updateFilterData,
  } = useFilterState();

  // Track and handle URL changes
  useEffect(() => {
    // If the URL hasn't changed, don't process
    if (previousUrl.current === location.pathname) {
      return;
    }

    console.log(
      `URL changed from ${previousUrl.current} to ${location.pathname}`
    );

    // Update the previous URL ref
    previousUrl.current = location.pathname;

    // Process the URL filters
    const processUrlFilters = async () => {
      setIsProcessingUrl(true);
      setUrlLoadingState(true);

      const { categorySlug, subcategorySlug, brandSlug } = params;

      // Only process if we have URL filters or we're on the shop page
      const isFilterUrl = Boolean(categorySlug || subcategorySlug || brandSlug);

      try {
        if (isFilterUrl) {
          console.log(`Processing URL filters for ${location.pathname}`);

          // Resolve filter data from URL
          const result = await resolveFiltersFromUrl();

          console.log('Resolved filters from URL:', result);

          // Set URL filters in the state
          setFromUrl(result.urlFilters, {
            ...result.displayNames,
            pageTitle: generatePageTitle(result.displayNames),
            breadcrumbs: generateBreadcrumbs(result.displayNames),
          });
        } else if (location.pathname === '/shop') {
          // Reset URL-based filters for shop page
          console.log('Resetting filters for shop page');

          // Clear URL-based filters but preserve other filters
          setFromUrl(
            {
              category: '',
              categorySlug: '',
              categoryName: '',
              subCategory: '',
              subcategorySlug: '',
              subCategoryName: '',
              brand: [],
              brandSlugs: [],
              brandNames: [],
            },
            {
              pageTitle: 'Shop',
              breadcrumbs: [
                { label: 'Home', url: '/' },
                { label: 'Shop', url: '/shop' },
              ],
            }
          );
        }
      } catch (error) {
        console.error('Error processing URL filters:', error);
      } finally {
        // Mark URL processing as complete
        setUrlLoadingState(false);

        // After a short delay, allow processing again
        setTimeout(() => {
          setIsProcessingUrl(false);
        }, 300);
      }
    };

    processUrlFilters();
  }, [location.pathname, params]);

  /**
   * Resolves slugs from URL to actual database IDs.
   * Loads and returns the required filter objects and IDs.
   */
  const resolveFiltersFromUrl = async () => {
    const { categorySlug, subcategorySlug, brandSlug } = params;
    const urlFilters = {
      category: '',
      categorySlug: categorySlug || '',
      categoryName: '',
      subCategory: '',
      subcategorySlug: subcategorySlug || '',
      subCategoryName: '',
      brand: [],
      brandSlugs: brandSlug ? [brandSlug] : [],
      brandNames: [],
    };

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
          urlFilters.categoryName = category.name;

          // Update categories in filter data if available
          if (categoryResponse.data.data.length > 0) {
            updateFilterData('categories', categoryResponse.data.data);
          }
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
          urlFilters.subCategoryName = subcategory.name;

          // Update subcategories in filter data
          if (subcategoryResponse.data.data.length > 0) {
            updateFilterData('subcategories', subcategoryResponse.data.data);
          }
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
          urlFilters.brandNames = [brand.name];

          // Update brands in filter data
          if (brandResponse.data.data.length > 0) {
            updateFilterData('brands', brandResponse.data.data);
          }
        }
      }

      return {
        urlFilters,
        displayNames: {
          categoryName: urlFilters.categoryName,
          subcategoryName: urlFilters.subCategoryName,
          brandName:
            urlFilters.brandNames.length > 0 ? urlFilters.brandNames[0] : '',
        },
      };
    } catch (error) {
      console.error('Error resolving filters from URL:', error);
      return {
        urlFilters: {
          category: '',
          categorySlug: '',
          categoryName: '',
          subCategory: '',
          subcategorySlug: '',
          subCategoryName: '',
          brand: [],
          brandSlugs: [],
          brandNames: [],
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

  // Return current state and methods
  return {
    // Current state
    activeFilters,
    urlState,
    isProcessingUrl,

    // Methods for manual usage if needed
    resolveFiltersFromUrl,
    generatePageTitle,
    generateBreadcrumbs,
  };
};

export default useUrlFilters;
