import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  setActiveFilters,
  setFilter,
  clearFilter,
  resetFilters,
  setCategoryFilter,
  setSubCategoryFilter,
  setBrandFilter,
  removeBrandFilter,
  setPriceRange,
  setSearchTerm,
  setFilterCategories,
  setFilterSubCategories,
  setFilterBrands,
  setFilterLoading,
  setUrlFilterActive,
  setUrlLoading,
  setBreadcrumbs,
  setPageTitle,
  toggleExpandedSection,
  setExpandedSection,
  toggleFilterDrawer,
  setFilterDrawer,
  setFiltersFromUrl,
} from '../store/filterSlice';

// Add this line to your filterSlice.js if setUrlLoading isn't already defined:
// setUrlLoading: (state, action) => {
//   state.urlState.isLoading = action.payload;
// },

/**
 * Custom hook to easily work with filter state across the application
 */
export const useFilterState = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get all filter state from Redux
  const activeFilters = useSelector((state) => state.filter.activeFilters);
  const filterData = useSelector((state) => state.filter.filterData);
  const urlState = useSelector((state) => state.filter.urlState);
  const uiState = useSelector((state) => state.filter.uiState);

  // Helper methods for working with filters

  /**
   * Apply a new set of filters and navigate if needed
   */
  const applyFilters = (filters) => {
    dispatch(setActiveFilters(filters));
  };

  /**
   * Set a single filter value
   */
  const updateFilter = (filterType, value) => {
    dispatch(setFilter({ filterType, value }));
  };

  /**
   * Handle price range changes
   */
  const updatePriceRange = (min, max) => {
    dispatch(setPriceRange({ min, max }));
  };

  /**
   * Handle category selection and navigation
   * This is one of the main functions that needs improvement
   */
  const selectCategory = (
    categoryId,
    categoryName,
    categorySlug,
    shouldNavigate = false
  ) => {
    // Important! Set URL loading state to true BEFORE navigation
    if (shouldNavigate) {
      dispatch(setUrlLoading(true));
    }

    // Dispatch category filter action
    dispatch(setCategoryFilter({ categoryId, categoryName, categorySlug }));

    if (shouldNavigate && categorySlug) {
      console.log(`Navigating to category: ${categoryName}`);

      // Set a small timeout to allow the state update to complete first
      setTimeout(() => {
        // Generate clean navigation URL
        // Preserve search parameters when navigating
        const searchParams = new URLSearchParams(location.search).toString();
        const queryString = searchParams ? `?${searchParams}` : '';
        const url = `/category/${categorySlug}${queryString}`;

        // Use navigate with { replace: false } to create a new history entry
        navigate(url, { replace: false });
      }, 50);
    }
  };

  /**
   * Handle subcategory selection and navigation
   */
  const selectSubCategory = (
    subCategoryId,
    subCategoryName,
    subCategorySlug,
    categorySlug,
    shouldNavigate = false
  ) => {
    // Important! Set URL loading state to true BEFORE navigation
    if (shouldNavigate) {
      dispatch(setUrlLoading(true));
    }

    // Update filter state
    dispatch(
      setSubCategoryFilter({ subCategoryId, subCategoryName, subCategorySlug })
    );

    if (shouldNavigate && categorySlug && subCategorySlug) {
      console.log(`Navigating to subcategory: ${subCategoryName}`);

      // Set a small timeout to allow the state update to complete first
      setTimeout(() => {
        // Preserve search parameters when navigating
        const searchParams = new URLSearchParams(location.search).toString();
        const queryString = searchParams ? `?${searchParams}` : '';
        const url = `/category/${categorySlug}/subcategory/${subCategorySlug}${queryString}`;

        // Use navigate with { replace: false } to create a new history entry
        navigate(url, { replace: false });
      }, 50);
    }
  };

  /**
   * Handle brand selection and navigation
   */
  const selectBrand = (
    brandId,
    brandName,
    brandSlug,
    categorySlug,
    subCategorySlug,
    shouldNavigate = false,
    replace = false
  ) => {
    // Important! Set URL loading state to true BEFORE navigation
    if (shouldNavigate) {
      dispatch(setUrlLoading(true));
    }

    // Update filter state
    dispatch(setBrandFilter({ brandId, brandName, brandSlug, replace }));

    if (shouldNavigate && brandSlug) {
      console.log(`Navigating to brand: ${brandName}`);

      // Build the appropriate URL based on category and subcategory
      let url = '';
      const searchParams = new URLSearchParams(location.search).toString();
      const queryString = searchParams ? `?${searchParams}` : '';

      if (subCategorySlug && categorySlug) {
        url = `/category/${categorySlug}/subcategory/${subCategorySlug}/brand/${brandSlug}`;
      } else if (categorySlug) {
        url = `/category/${categorySlug}/brand/${brandSlug}`;
      } else {
        url = `/brand/${brandSlug}`;
      }

      // Set a small timeout to allow the state update to complete first
      setTimeout(() => {
        // Use navigate with { replace: false } to create a new history entry
        navigate(`${url}${queryString}`, { replace: false });
      }, 50);
    }
  };

  /**
   * Remove filter and navigate if necessary
   */
  const removeFilter = (filterType, value) => {
    const currentSearch = location.search;

    // Important! Set URL loading state to true BEFORE navigation if we're going to navigate
    const willNavigate =
      (filterType === 'all' && urlState.isUrlFilterActive) ||
      (filterType === 'category' && activeFilters.categorySlug) ||
      (filterType === 'subCategory' &&
        activeFilters.subCategorySlug &&
        activeFilters.categorySlug) ||
      (filterType === 'brand' &&
        activeFilters.brandSlugs.includes(value) &&
        activeFilters.brandSlugs.length === 1);

    if (willNavigate) {
      dispatch(setUrlLoading(true));
    }

    if (filterType === 'all') {
      dispatch(resetFilters());

      // If we're on a filtered URL, go back to shop
      if (urlState.isUrlFilterActive) {
        // Use setTimeout to ensure state is updated first
        setTimeout(() => {
          navigate(`/shop${currentSearch}`, { replace: true });
        }, 50);
      }
      return;
    }

    if (filterType === 'priceRange') {
      dispatch(setPriceRange({ min: '', max: '' }));
      return;
    }

    if (filterType === 'category') {
      // If we're on a URL-filtered page by category, navigate back to shop
      if (activeFilters.categorySlug) {
        dispatch(
          setCategoryFilter({
            categoryId: '',
            categoryName: '',
            categorySlug: '',
          })
        );

        setTimeout(() => {
          navigate(`/shop${currentSearch}`, { replace: true });
        }, 50);
        return;
      }

      dispatch(
        setCategoryFilter({
          categoryId: '',
          categoryName: '',
          categorySlug: '',
        })
      );
      return;
    }

    if (filterType === 'subCategory') {
      // If we're on a URL-filtered page by subcategory, navigate back to category
      if (activeFilters.subCategorySlug && activeFilters.categorySlug) {
        // First update the filter state
        dispatch(
          setSubCategoryFilter({
            subCategoryId: '',
            subCategoryName: '',
            subCategorySlug: '',
          })
        );

        // Then navigate with a slight delay
        setTimeout(() => {
          navigate(`/category/${activeFilters.categorySlug}${currentSearch}`, {
            replace: true,
          });
        }, 50);
        return;
      }

      dispatch(
        setSubCategoryFilter({
          subCategoryId: '',
          subCategoryName: '',
          subCategorySlug: '',
        })
      );
      return;
    }

    if (filterType === 'brand') {
      if (activeFilters.brandSlugs.includes(value)) {
        // First update the state
        dispatch(removeBrandFilter({ brandId: value }));

        // If we're on a URL-filtered page by brand, navigate appropriately
        if (activeFilters.brandSlugs.length === 1) {
          let targetUrl = '';

          if (activeFilters.subCategorySlug && activeFilters.categorySlug) {
            targetUrl = `/category/${activeFilters.categorySlug}/subcategory/${activeFilters.subCategorySlug}${currentSearch}`;
          } else if (activeFilters.categorySlug) {
            targetUrl = `/category/${activeFilters.categorySlug}${currentSearch}`;
          } else {
            targetUrl = `/shop${currentSearch}`;
          }

          // Navigate with delay to allow state to update
          setTimeout(() => {
            navigate(targetUrl, { replace: true });
          }, 50);
        }
      }
      return;
    }

    dispatch(clearFilter(filterType));
  };

  /**
   * Update search term
   */
  const updateSearchTerm = (term) => {
    dispatch(setSearchTerm(term));
  };

  /**
   * Toggle filter sections in UI
   */
  const toggleSection = (section) => {
    dispatch(toggleExpandedSection(section));
  };

  /**
   * Toggle mobile filter drawer
   */
  const toggleFilterDrawer = () => {
    dispatch(toggleFilterDrawer());
  };

  /**
   * Set filters from URL parameters
   */
  const setFromUrl = (urlFilters, displayNames) => {
    dispatch(setFiltersFromUrl({ urlFilters, displayNames }));
  };

  /**
   * Set URL loading state
   */
  const setUrlLoadingState = (isLoading) => {
    dispatch(setUrlLoading(isLoading));
  };

  /**
   * Update filter data (categories, subcategories, brands)
   */
  const updateFilterData = (type, data) => {
    switch (type) {
      case 'categories':
        dispatch(setFilterCategories(data));
        break;
      case 'subcategories':
        dispatch(setFilterSubCategories(data));
        break;
      case 'brands':
        dispatch(setFilterBrands(data));
        break;
      case 'isLoading':
        dispatch(setFilterLoading(data));
        break;
      default:
        break;
    }
  };

  return {
    // State
    activeFilters,
    filterData,
    urlState,
    uiState,

    // Methods
    applyFilters,
    updateFilter,
    updatePriceRange,
    selectCategory,
    selectSubCategory,
    selectBrand,
    removeFilter,
    updateSearchTerm,
    toggleSection,
    toggleFilterDrawer,
    setFilterDrawer: (isOpen) => dispatch(setFilterDrawer(isOpen)),
    setFromUrl,
    setUrlLoadingState,
    updateFilterData,
  };
};

export default useFilterState;
