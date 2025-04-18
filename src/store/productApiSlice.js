import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProductApiService from '../common/ProductApiService.js';

// Async thunks for API calls
export const fetchFilterOptions = createAsyncThunk(
  'productApi/fetchFilterOptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProductApiService.getFilterOptions();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFilteredProducts = createAsyncThunk(
  'productApi/fetchFilteredProducts',
  async ({ filters, page = 1, limit = 16 }, { rejectWithValue }) => {
    try {
      const response = await ProductApiService.getFilteredProducts(
        filters,
        page,
        limit
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'productApi/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await ProductApiService.getProductBySlug(slug);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  filterOptions: {
    brands: [],
    productTypes: [],
    roastLevels: [],
    intensityLevels: [],
    blendTypes: [],
  },
  filteredProducts: {
    data: [],
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 16,
  },
  currentProduct: null,
  loading: {
    filterOptions: false,
    products: false,
    productDetail: false,
  },
  error: {
    filterOptions: null,
    products: null,
    productDetail: null,
  },
};

// Create slice
const productApiSlice = createSlice({
  name: 'productApi',
  initialState,
  reducers: {
    resetFilteredProducts: (state) => {
      state.filteredProducts = initialState.filteredProducts;
    },
    resetCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchFilterOptions
    builder.addCase(fetchFilterOptions.pending, (state) => {
      state.loading.filterOptions = true;
      state.error.filterOptions = null;
    });
    builder.addCase(fetchFilterOptions.fulfilled, (state, action) => {
      state.loading.filterOptions = false;
      if (action.payload.success) {
        state.filterOptions = {
          brands: action.payload.brands || [],
          productTypes: action.payload.productTypes || [],
          roastLevels: action.payload.roastLevels || [],
          intensityLevels: action.payload.intensityLevels || [],
          blendTypes: action.payload.blendTypes || [],
        };
      }
    });
    builder.addCase(fetchFilterOptions.rejected, (state, action) => {
      state.loading.filterOptions = false;
      state.error.filterOptions = action.payload || action.error.message;
    });

    // Handle fetchFilteredProducts
    builder.addCase(fetchFilteredProducts.pending, (state) => {
      state.loading.products = true;
      state.error.products = null;
    });
    builder.addCase(fetchFilteredProducts.fulfilled, (state, action) => {
      state.loading.products = false;
      if (action.payload.success) {
        // If this is the first page or a filter change, replace the data
        if (action.meta.arg.page === 1) {
          state.filteredProducts = {
            data: action.payload.data || [],
            total: action.payload.total || 0,
            totalPages: action.payload.totalPages || 0,
            page: action.payload.page || 1,
            limit: action.payload.limit || 16,
          };
        } else {
          // If loading more products, append to existing data
          state.filteredProducts = {
            data: [
              ...state.filteredProducts.data,
              ...(action.payload.data || []),
            ],
            total: action.payload.total || state.filteredProducts.total,
            totalPages:
              action.payload.totalPages || state.filteredProducts.totalPages,
            page: action.payload.page || state.filteredProducts.page,
            limit: action.payload.limit || state.filteredProducts.limit,
          };
        }
      }
    });
    builder.addCase(fetchFilteredProducts.rejected, (state, action) => {
      state.loading.products = false;
      state.error.products = action.payload || action.error.message;
    });

    // Handle fetchProductBySlug
    builder.addCase(fetchProductBySlug.pending, (state) => {
      state.loading.productDetail = true;
      state.error.productDetail = null;
    });
    builder.addCase(fetchProductBySlug.fulfilled, (state, action) => {
      state.loading.productDetail = false;
      if (action.payload.success) {
        state.currentProduct = action.payload.data;
      }
    });
    builder.addCase(fetchProductBySlug.rejected, (state, action) => {
      state.loading.productDetail = false;
      state.error.productDetail = action.payload || action.error.message;
    });
  },
});

export const { resetFilteredProducts, resetCurrentProduct } =
  productApiSlice.actions;

export default productApiSlice.reducer;
