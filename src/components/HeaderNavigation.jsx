import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, ChevronDown, ChevronRight, X } from 'lucide-react';

/**
 * A completely simplified HeaderNavigation component that uses direct URL navigation
 * No Redux filtering, no state management - just pure URL navigation
 */
const HeaderNavigation = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [verticalMenuActive, setVerticalMenuActive] = useState(false);
  const [verticalCategory, setVerticalCategory] = useState(null);
  const [verticalSubcategory, setVerticalSubcategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);

  // Get category structure from Redux store
  const categoryStructure = useSelector(
    (state) => state.product.categoryStructure
  );
  const loadingCategoryStructure = useSelector(
    (state) => state.product.loadingCategoryStructure
  );

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Close menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setVerticalMenuActive(false);
      }
    };

    if (verticalMenuActive) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [verticalMenuActive]);

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId],
    });

    // Reset subcategory expansions when closing a category
    if (expandedCategories[categoryId]) {
      const newExpandedSubcategories = { ...expandedSubcategories };

      // Find the category and clear its subcategories
      const category = categoryStructure.find((cat) => cat._id === categoryId);
      if (category && category.subcategories) {
        category.subcategories.forEach((sub) => {
          delete newExpandedSubcategories[sub._id];
        });
      }

      setExpandedSubcategories(newExpandedSubcategories);
    }
  };

  const toggleSubcategoryExpansion = (subcategoryId) => {
    setExpandedSubcategories({
      ...expandedSubcategories,
      [subcategoryId]: !expandedSubcategories[subcategoryId],
    });
  };

  // Simple direct navigation methods - no Redux state involved
  const handleCategoryClick = (category, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log(`Navigating to category: ${category.name} (${category.slug})`);
    navigate(`/category/${category.slug}`);
    setVerticalMenuActive(false);
  };

  const handleSubcategoryClick = (subcategory, categorySlug, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log(
      `Navigating to subcategory: ${subcategory.name} (${subcategory.slug})`
    );
    navigate(`/category/${categorySlug}/subcategory/${subcategory.slug}`);
    setVerticalMenuActive(false);
  };

  const handleBrandClick = (
    brand,
    categorySlug,
    subcategorySlug = null,
    event
  ) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (subcategorySlug) {
      console.log(`Navigating to brand: ${brand.name} in subcategory route`);
      navigate(
        `/category/${categorySlug}/subcategory/${subcategorySlug}/brand/${brand.slug}`
      );
    } else if (categorySlug) {
      console.log(`Navigating to brand: ${brand.name} in category route`);
      navigate(`/category/${categorySlug}/brand/${brand.slug}`);
    } else {
      console.log(`Navigating to brand: ${brand.name} directly`);
      navigate(`/brand/${brand.slug}`);
    }

    setVerticalMenuActive(false);
  };

  return (
    <div className="bg-gray-100 border-b border-gray-200 relative z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          {/* Hamburger Menu for Vertical Menu */}
          <div
            className="mr-6 cursor-pointer"
            onClick={() => setVerticalMenuActive(true)}
          >
            <Menu size={24} className="text-gray-700" />
          </div>

          {/* Horizontal Categories */}
          <div className="flex overflow-x-auto hide-scrollbar space-x-4">
            {loadingCategoryStructure ? (
              <div className="whitespace-nowrap">Loading categories...</div>
            ) : (
              categoryStructure.map((category) => (
                <div
                  key={category._id}
                  className="whitespace-nowrap cursor-pointer font-medium py-3"
                  onMouseEnter={() => setActiveCategory(category)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <div
                    onClick={(e) => handleCategoryClick(category, e)}
                    className="flex flex-col items-center justify-center min-w-[70px] text-center hover:text-secondary-200 transition-colors cursor-pointer"
                  >
                    <span className="text-sm truncate">{category.name}</span>
                  </div>

                  {/* Mega Menu on Hover */}
                  {activeCategory && activeCategory._id === category._id && (
                    <div className="absolute left-0 right-0 bg-white shadow-lg z-20 mt-3 p-6">
                      {category.subcategories &&
                      category.subcategories.length > 0 ? (
                        // Type A: With Subcategories
                        <div className="flex flex-wrap">
                          {category.subcategories.map((subcategory) => (
                            <div
                              key={subcategory._id}
                              className="w-full md:w-1/3 lg:w-1/4 p-4"
                            >
                              <div className="flex items-start">
                                <img
                                  src={
                                    subcategory.image ||
                                    `/api/placeholder/120/120`
                                  }
                                  alt={subcategory.name}
                                  className="w-16 h-16 object-cover rounded mr-4"
                                />
                                <div>
                                  <div
                                    onClick={(e) =>
                                      handleSubcategoryClick(
                                        subcategory,
                                        category.slug,
                                        e
                                      )
                                    }
                                    className="font-bold hover:text-secondary-200 cursor-pointer"
                                  >
                                    {subcategory.name}
                                  </div>
                                  <ul className="mt-2">
                                    {subcategory.brands &&
                                    subcategory.brands.length > 0 ? (
                                      subcategory.brands
                                        .slice(0, 5)
                                        .map((brand) => (
                                          <li
                                            key={brand._id}
                                            className="text-gray-600 hover:text-gray-900 py-1 cursor-pointer text-sm"
                                            onClick={(e) =>
                                              handleBrandClick(
                                                brand,
                                                category.slug,
                                                subcategory.slug,
                                                e
                                              )
                                            }
                                          >
                                            {brand.name}
                                          </li>
                                        ))
                                    ) : (
                                      <li className="text-gray-500 py-1">
                                        No brands available
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : category.brands && category.brands.length > 0 ? (
                        // Type B: No Subcategories, but has brands
                        <div className="flex flex-wrap">
                          {category.brands.map((brand) => (
                            <div
                              key={brand._id}
                              className="w-full md:w-1/4 lg:w-1/5 p-4"
                            >
                              <div
                                onClick={(e) =>
                                  handleBrandClick(
                                    brand,
                                    category.slug,
                                    null,
                                    e
                                  )
                                }
                                className="flex items-center text-center cursor-pointer hover:text-secondary-200"
                              >
                                <img
                                  src={
                                    brand.image || `/api/placeholder/120/120`
                                  }
                                  alt={brand.name}
                                  className="w-20 h-10 object-cover rounded-full mr-2"
                                />
                                <span className="font-medium text-xs">
                                  {brand.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // No subcategories or brands
                        <div className="p-4 text-center text-gray-500">
                          No subcategories or brands available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Vertical Menu - Desktop & Mobile */}
      {verticalMenuActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex">
          {!isMobile ? (
            // Desktop Version - Multi-column layout
            <div ref={menuRef} className="flex h-full">
              {/* First Layer - Categories */}
              <div className="w-64 bg-white h-full overflow-y-auto">
                <div className="p-4 font-bold border-b flex justify-between items-center">
                  <span>All Categories</span>
                  <X
                    size={20}
                    className="cursor-pointer text-gray-600 hover:text-gray-900"
                    onClick={() => setVerticalMenuActive(false)}
                  />
                </div>
                {loadingCategoryStructure ? (
                  <div className="p-4">Loading categories...</div>
                ) : (
                  categoryStructure.map((category) => (
                    <div
                      key={category._id}
                      className="p-4 hover:bg-gray-100 border-b cursor-pointer flex justify-between items-center"
                      onMouseEnter={() => setVerticalCategory(category)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className="flex items-center"
                        onClick={(e) => handleCategoryClick(category, e)}
                      >
                        <img
                          src={category.image || '/api/placeholder/40/40'}
                          alt={category.name}
                          className="w-8 h-8 mr-2"
                        />
                        <span>{category.name}</span>
                      </div>
                      {category.subcategories &&
                        category.subcategories.length > 0 && (
                          <ChevronRight size={20} />
                        )}
                    </div>
                  ))
                )}
              </div>

              {/* Second Layer - Subcategories or Brands */}
              {verticalCategory && (
                <div className="w-64 bg-gray-50 h-full overflow-y-auto">
                  <div className="p-4 font-bold border-b">
                    {verticalCategory.name}
                  </div>
                  {verticalCategory.subcategories &&
                  verticalCategory.subcategories.length > 0 ? (
                    // Display subcategories
                    verticalCategory.subcategories.map((subcategory) => (
                      <div
                        key={subcategory._id}
                        className="p-4 hover:bg-gray-100 border-b cursor-pointer flex justify-between items-center"
                        onMouseEnter={() => setVerticalSubcategory(subcategory)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="flex items-center"
                          onClick={(e) =>
                            handleSubcategoryClick(
                              subcategory,
                              verticalCategory.slug,
                              e
                            )
                          }
                        >
                          <img
                            src={subcategory.image || '/api/placeholder/40/40'}
                            alt={subcategory.name}
                            className="w-8 h-8 mr-2"
                          />
                          <span>{subcategory.name}</span>
                        </div>
                        {subcategory.brands &&
                          subcategory.brands.length > 0 && (
                            <ChevronRight size={20} />
                          )}
                      </div>
                    ))
                  ) : verticalCategory.brands &&
                    verticalCategory.brands.length > 0 ? (
                    // Display brands directly if no subcategories
                    verticalCategory.brands.map((brand) => (
                      <div
                        key={brand._id}
                        className="p-4 hover:bg-gray-100 border-b cursor-pointer"
                        onClick={(e) =>
                          handleBrandClick(
                            brand,
                            verticalCategory.slug,
                            null,
                            e
                          )
                        }
                      >
                        <div className="flex items-center">
                          <img
                            src={brand.image || '/api/placeholder/60/40'}
                            alt={brand.name}
                            className="w-16 h-8 mr-2"
                          />
                          <span>{brand.name}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-gray-500">
                      No subcategories or brands available
                    </div>
                  )}
                </div>
              )}

              {/* Third Layer - Brands */}
              {verticalSubcategory && (
                <div className="w-64 bg-white h-full overflow-y-auto">
                  <div className="p-4 font-bold border-b">
                    {verticalSubcategory.name} Brands
                  </div>
                  {verticalSubcategory.brands &&
                  verticalSubcategory.brands.length > 0 ? (
                    verticalSubcategory.brands.map((brand) => (
                      <div
                        key={brand._id}
                        className="p-4 hover:bg-gray-100 border-b cursor-pointer"
                        onClick={(e) =>
                          handleBrandClick(
                            brand,
                            verticalCategory.slug,
                            verticalSubcategory.slug,
                            e
                          )
                        }
                      >
                        <div className="flex items-center">
                          <img
                            src={brand.image || '/api/placeholder/40/40'}
                            alt={brand.name}
                            className="w-8 h-8 mr-2"
                          />
                          <span>{brand.name}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-gray-500">No brands available</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Mobile Version - Single column with expandable sections
            <div
              ref={menuRef}
              className="w-4/5 bg-white h-full overflow-y-auto ml-auto"
            >
              <div className="p-4 font-bold border-b flex justify-between items-center">
                <span>Menu</span>
                <X
                  size={20}
                  className="cursor-pointer text-gray-600 hover:text-gray-900"
                  onClick={() => setVerticalMenuActive(false)}
                />
              </div>

              {loadingCategoryStructure ? (
                <div className="p-4">Loading categories...</div>
              ) : (
                // Categories with expandable sections
                categoryStructure.map((category) => (
                  <div key={category._id}>
                    <div
                      className="p-4 border-b cursor-pointer flex justify-between items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategoryExpansion(category._id);
                      }}
                    >
                      <span
                        className="font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(category, e);
                        }}
                      >
                        {category.name}
                      </span>
                      {(category.subcategories &&
                        category.subcategories.length > 0) ||
                      (category.brands && category.brands.length > 0) ? (
                        expandedCategories[category._id] ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )
                      ) : null}
                    </div>

                    {/* Expanded category content */}
                    {expandedCategories[category._id] && (
                      <div className="bg-gray-50">
                        {category.subcategories &&
                        category.subcategories.length > 0 ? (
                          // Show subcategories
                          category.subcategories.map((subcategory) => (
                            <div key={subcategory._id}>
                              <div
                                className="p-4 pl-8 border-b cursor-pointer flex justify-between items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubcategoryExpansion(subcategory._id);
                                }}
                              >
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubcategoryClick(
                                      subcategory,
                                      category.slug,
                                      e
                                    );
                                  }}
                                >
                                  {subcategory.name}
                                </span>
                                {subcategory.brands &&
                                  subcategory.brands.length > 0 &&
                                  (expandedSubcategories[subcategory._id] ? (
                                    <ChevronDown size={18} />
                                  ) : (
                                    <ChevronRight size={18} />
                                  ))}
                              </div>

                              {/* Brands for this subcategory */}
                              {expandedSubcategories[subcategory._id] &&
                                subcategory.brands && (
                                  <div className="bg-white">
                                    {subcategory.brands.length > 0 ? (
                                      subcategory.brands.map((brand) => (
                                        <div
                                          key={brand._id}
                                          className="p-3 pl-12 border-b cursor-pointer text-sm"
                                          onClick={(e) =>
                                            handleBrandClick(
                                              brand,
                                              category.slug,
                                              subcategory.slug,
                                              e
                                            )
                                          }
                                        >
                                          {brand.name}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="p-3 pl-12 border-b text-sm text-gray-500">
                                        No brands available
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          ))
                        ) : category.brands && category.brands.length > 0 ? (
                          // Show brands directly
                          category.brands.map((brand) => (
                            <div
                              key={brand._id}
                              className="p-4 pl-8 border-b cursor-pointer"
                              onClick={(e) =>
                                handleBrandClick(brand, category.slug, null, e)
                              }
                            >
                              {brand.name}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 pl-8 border-b text-gray-500">
                            No subcategories or brands available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Custom styles */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default HeaderNavigation;
