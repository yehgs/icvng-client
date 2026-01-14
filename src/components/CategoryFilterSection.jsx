import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CardProduct from "./CardProduct";

/**
 * Category Filter Section - Uses SAME API logic as Shop Page
 *
 * Key difference from previous version:
 * - Calls searchProduct API with category filter (backend filtering)
 * - NOT client-side filtering of pre-loaded products
 */
const CategoryFilterSection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [responsiveItemsPerSlide, setResponsiveItemsPerSlide] = useState(12);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when selected category changes
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  // Responsive items per slide
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setResponsiveItemsPerSlide(4); // Mobile: 2x2 = 4 items
      } else if (window.innerWidth < 1024) {
        setResponsiveItemsPerSlide(8); // Tablet: 4x2 = 8 items
      } else {
        setResponsiveItemsPerSlide(12); // Desktop: 6x2 = 12 items
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCategories = async () => {
    try {
      const categoryResponse = await Axios({
        ...SummaryApi.getCategory,
      });

      if (categoryResponse.data.success) {
        const categoryData = categoryResponse.data.data || [];
        console.log(
          "CategoryFilterSection: Loaded categories:",
          categoryData.length
        );
        setCategories(
          categoryData.sort((a, b) => a.name.localeCompare(b.name))
        );
      }
    } catch (error) {
      console.error("CategoryFilterSection: Error fetching categories", error);
      AxiosToastError(error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // ✅ USE SAME API CALL AS SHOP PAGE - searchProduct with category filter
      const response = await Axios({
        ...SummaryApi.searchProduct, // Same API as shop page
        data: {
          page: 1,
          limit: 100, // Fetch 100 products
          // ✅ CRITICAL: Send category filter to backend (just like shop page)
          category: selectedCategory === "all" ? undefined : selectedCategory,
        },
      });

      if (response.data.success && response.data.data) {
        const productsData = response.data.data;

        console.log(
          `CategoryFilterSection: Loaded ${productsData.length} products for category: ${selectedCategory}`
        );

        // ✅ RANDOMIZE: Use Fisher-Yates shuffle for better randomization
        const shuffledProducts = [...productsData];
        for (let i = shuffledProducts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledProducts[i], shuffledProducts[j]] = [
            shuffledProducts[j],
            shuffledProducts[i],
          ];
        }

        console.log(
          `CategoryFilterSection: Randomized ${shuffledProducts.length} products`
        );
        setProducts(shuffledProducts);

        // Reset to first slide when category changes
        setCurrentSlide(0);
      }
    } catch (error) {
      console.error("CategoryFilterSection: Error fetching products", error);
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (
    categoryId,
    categorySlug = "",
    categoryName = ""
  ) => {
    console.log("Category clicked:", categoryId, categorySlug, categoryName);
    setSelectedCategory(categoryId);
    setSelectedCategorySlug(categorySlug);
    setSelectedCategoryName(categoryName);
  };

  // Navigate to shop page with category filter
  const handleSeeMore = () => {
    if (selectedCategory === "all") {
      navigate("/shop");
    } else if (selectedCategorySlug) {
      // Use the category slug to navigate (matching shop page URL structure)
      navigate(`/category/${selectedCategorySlug}`);
    }
  };

  // Calculate the number of slides needed
  const slidesCount = Math.max(
    Math.ceil(products.length / responsiveItemsPerSlide) - 1,
    0
  );

  // Navigation functions
  const nextSlide = () => {
    if (!products || products.length === 0) return;
    setCurrentSlide((prev) => (prev >= slidesCount ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (!products || products.length === 0) return;
    setCurrentSlide((prev) => (prev <= 0 ? slidesCount : prev - 1));
  };

  // Grid configuration for 2-row layout
  const getGridConfig = () => {
    if (window.innerWidth < 640) {
      return { gridClass: "grid-cols-2" }; // 2 products per row
    } else if (window.innerWidth < 1024) {
      return { gridClass: "grid-cols-4" }; // 4 products per row
    } else {
      return { gridClass: "grid-cols-6" }; // 6 products per row
    }
  };

  const gridConfig = getGridConfig();

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 my-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>

          {/* Category Filter Buttons - Horizontal scroll on mobile */}
          <div className="w-full md:w-auto overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-2 pb-2 md:pb-0 whitespace-nowrap">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-full flex-shrink-0 ${
                  selectedCategory === "all"
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                } transition-colors`}
                onClick={() => handleCategoryClick("all", "", "All Products")}
              >
                All Products
              </button>
              {categories &&
                categories.length > 0 &&
                categories.map((cat) => (
                  <button
                    key={cat._id}
                    className={`px-4 py-2 text-sm font-medium rounded-full flex-shrink-0 ${
                      selectedCategory === cat._id
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    } transition-colors`}
                    onClick={() =>
                      handleCategoryClick(cat._id, cat.slug, cat.name)
                    }
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            {loading ? (
              <div className={`grid ${gridConfig.gridClass} gap-4`}>
                {Array.from({ length: responsiveItemsPerSlide }).map(
                  (_, item) => (
                    <div
                      key={`loading-${item}`}
                      className="border rounded-lg p-4 h-80 animate-pulse"
                    >
                      <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  )
                )}
              </div>
            ) : products.length > 0 ? (
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {Array.from({
                  length: Math.max(
                    Math.ceil(products.length / responsiveItemsPerSlide),
                    1
                  ),
                }).map((_, slideIndex) => (
                  <div
                    key={`category-slide-${slideIndex}`}
                    className="w-full flex-shrink-0"
                  >
                    {/* 2-Row Grid Layout */}
                    <div className={`grid ${gridConfig.gridClass} gap-4`}>
                      {products
                        .slice(
                          slideIndex * responsiveItemsPerSlide,
                          slideIndex * responsiveItemsPerSlide +
                            responsiveItemsPerSlide
                        )
                        .map((product) => (
                          <CardProduct key={product._id} data={product} />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No products found in this category.
                </p>
              </div>
            )}
          </div>

          {/* Navigation buttons - only show if we have multiple slides */}
          {products.length > responsiveItemsPerSlide && (
            <>
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 md:-translate-x-4 bg-white shadow rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 md:translate-x-4 bg-white shadow rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* Slide indicators */}
        {products.length > responsiveItemsPerSlide && (
          <div className="flex justify-center mt-4 space-x-1">
            {Array.from({ length: slidesCount + 1 }).map((_, index) => (
              <button
                key={`indicator-${index}`}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full ${
                  currentSlide === index ? "bg-green-700" : "bg-gray-300"
                } transition-colors`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* See More Button - Show only when a specific category is selected */}
        {selectedCategory !== "all" && products.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSeeMore}
              className="inline-flex items-center px-6 py-3 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors shadow-md hover:shadow-lg"
            >
              <span>See More {selectedCategoryName}</span>
              <ChevronRight size={18} className="ml-2" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryFilterSection;
