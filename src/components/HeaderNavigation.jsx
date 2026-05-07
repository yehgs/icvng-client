// client/src/components/HeaderNavigation.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronDown, ChevronRight, X, ShoppingBag, BookOpen, Handshake, Phone } from "lucide-react";

// Dropdown rendered via portal-like approach:
// We track the hovered category and its button's bounding rect,
// then render the dropdown as position:fixed using that rect.
// This COMPLETELY escapes any overflow/stacking context of the sticky header.
function MegaMenu({ category, rect, onClose, onSubcategoryClick, onBrandClick }) {
  if (!category || !rect) return null;
  const top = rect.bottom;

  return (
    <div
      style={{
        position: "fixed",
        top: top,
        left: 0,
        right: 0,
        width: "100vw",
        zIndex: 2147483647,
        background: "white",
        boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
        borderTop: "3px solid var(--color-secondary-200, #7B3F1C)",
        padding: "32px 48px",
      }}
      onMouseLeave={onClose}
    >
      {/* Category heading */}
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase", marginBottom: 20 }}>
        {category.name}
      </p>
      {category.subcategories?.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
          {category.subcategories.map((sub) => (
            <div key={sub._id} style={{ width: "16.66%", minWidth: 160, padding: "0 16px 24px 0" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <img
                  src={sub.image || ""}
                  alt={sub.name}
                  loading="lazy"
                  style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div>
                  <button
                    onClick={(e) => { onSubcategoryClick(sub, category.slug, e); onClose(); }}
                    style={{ fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "left", marginBottom: 8, lineHeight: 1.3, display: "block" }}
                    className="hover:text-secondary-200"
                  >
                    {sub.name}
                  </button>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    {sub.brands?.slice(0, 6).map((brand) => (
                      <li key={brand._id}
                        onClick={(e) => { onBrandClick(brand, category.slug, sub.slug, e); onClose(); }}
                        style={{ fontSize: 13, color: "#6b7280", cursor: "pointer" }}
                        className="hover:text-secondary-200"
                      >
                        {brand.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : category.brands?.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
          {category.brands.map((brand) => (
            <div key={brand._id}
              onClick={(e) => { onBrandClick(brand, category.slug, null, e); onClose(); }}
              style={{ width: "10%", minWidth: 100, padding: "0 16px 16px 0", cursor: "pointer", textAlign: "center" }}
              className="hover:text-secondary-200"
            >
              <img src={brand.image || ""} alt={brand.name} loading="lazy"
                style={{ width: 64, height: 32, objectFit: "contain", margin: "0 auto 6px" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{brand.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#9ca3af", fontSize: 14 }}>No items available</p>
      )}
    </div>
  );
}

const HeaderNavigation = ({ mobileMenuOnly = false }) => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredRect, setHoveredRect] = useState(null);
  const [verticalMenuActive, setVerticalMenuActive] = useState(false);
  const [verticalCategory, setVerticalCategory] = useState(null);
  const [verticalSubcategory, setVerticalSubcategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);
  const hideTimer = useRef(null);

  const categoryStructure = useSelector((state) => state.product.categoryStructure);
  const loadingCategoryStructure = useSelector((state) => state.product.loadingCategoryStructure);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const open = () => setVerticalMenuActive(true);
    window.addEventListener("open-mobile-menu", open);
    return () => window.removeEventListener("open-mobile-menu", open);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setVerticalMenuActive(false);
    };
    if (verticalMenuActive) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [verticalMenuActive]);

  // Close dropdown on scroll (since it's fixed-positioned)
  useEffect(() => {
    const onScroll = () => { setHoveredCategory(null); setHoveredRect(null); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (path) => { navigate(path); setVerticalMenuActive(false); };
  const handleCategoryClick = (cat, e) => { e?.preventDefault(); e?.stopPropagation(); go(`/category/${cat.slug}`); };
  const handleSubcategoryClick = (sub, catSlug, e) => { e?.preventDefault(); e?.stopPropagation(); go(`/category/${catSlug}/subcategory/${sub.slug}`); };
  const handleBrandClick = (brand, catSlug, subSlug, e) => {
    e?.preventDefault(); e?.stopPropagation();
    if (subSlug) go(`/category/${catSlug}/subcategory/${subSlug}/brand/${brand.slug}`);
    else if (catSlug) go(`/category/${catSlug}/brand/${brand.slug}`);
    else go(`/brand/${brand.slug}`);
  };

  const handleButtonMouseEnter = (e, category) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredCategory(category);
    setHoveredRect(rect);
  };

  const handleButtonMouseLeave = () => {
    // Small delay so mouse can move from button into the dropdown
    hideTimer.current = setTimeout(() => {
      setHoveredCategory(null);
      setHoveredRect(null);
    }, 100);
  };

  const handleMenuMouseEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const handleMenuClose = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHoveredCategory(null);
    setHoveredRect(null);
  };

  const toggleCategoryExpansion = (id) => setExpandedCategories((p) => ({ ...p, [id]: !p[id] }));
  const toggleSubcategoryExpansion = (id) => setExpandedSubcategories((p) => ({ ...p, [id]: !p[id] }));

  return (
    <>
      {/* ── Desktop category bar ── */}
      {!mobileMenuOnly && (
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center w-full">
              {/* Hamburger */}
              <button
                className="flex-shrink-0 flex items-center gap-2 mr-3 py-3 text-sm font-medium text-gray-700 hover:text-secondary-200 transition-colors whitespace-nowrap"
                onClick={() => setVerticalMenuActive(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
                <span className="hidden lg:inline text-sm">All</span>
              </button>

              {/* Scrollable nav strip — overflow-x:auto, overflow-y:visible */}
              <div className="flex-1" style={{ overflowX: "auto", overflowY: "visible", scrollbarWidth: "none" }}>
                <div className="flex items-center" style={{ minWidth: "max-content" }}>
                  {loadingCategoryStructure ? (
                    <div className="py-3 px-4 text-sm text-gray-400">Loading...</div>
                  ) : (
                    categoryStructure.map((category) => {
                      const hasDrop = category.subcategories?.length > 0 || category.brands?.length > 0;
                      return (
                        <button
                          key={category._id}
                          onClick={(e) => handleCategoryClick(category, e)}
                          onMouseEnter={hasDrop ? (e) => handleButtonMouseEnter(e, category) : undefined}
                          onMouseLeave={hasDrop ? handleButtonMouseLeave : undefined}
                          className="py-3 px-3 text-sm font-medium text-gray-700 hover:text-secondary-200 whitespace-nowrap transition-colors flex-shrink-0"
                        >
                          {category.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed-position mega menu — rendered at document level, escapes all stacking contexts */}
      {hoveredCategory && hoveredRect && (
        <div onMouseEnter={handleMenuMouseEnter} onMouseLeave={handleMenuClose}>
          <MegaMenu
            category={hoveredCategory}
            rect={hoveredRect}
            onClose={handleMenuClose}
            onSubcategoryClick={handleSubcategoryClick}
            onBrandClick={handleBrandClick}
          />
        </div>
      )}

      {/* ── Slide-in vertical menu ── */}
      {verticalMenuActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex" style={{ zIndex: 9999 }}>
          {!isMobile ? (
            <div ref={menuRef} className="flex h-full shadow-2xl">
              <div className="w-64 bg-white h-full overflow-y-auto">
                <div className="p-4 font-bold border-b flex justify-between items-center">
                  <span>All Categories</span>
                  <X size={20} className="cursor-pointer text-gray-500 hover:text-gray-900" onClick={() => setVerticalMenuActive(false)} />
                </div>
                {categoryStructure.map((cat) => (
                  <div key={cat._id} className="p-4 hover:bg-gray-100 border-b cursor-pointer flex justify-between items-center"
                    onMouseEnter={() => { setVerticalCategory(cat); setVerticalSubcategory(null); }}
                    onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center" onClick={(e) => handleCategoryClick(cat, e)}>
                      <img src={cat.image || ""} alt={cat.name} loading="lazy" className="w-8 h-8 mr-2 rounded object-cover" onError={(e) => { e.target.style.display="none"; }} />
                      <span className="text-sm">{cat.name}</span>
                    </div>
                    {cat.subcategories?.length > 0 && <ChevronRight size={18} className="text-gray-400" />}
                  </div>
                ))}
              </div>
              {verticalCategory && (
                <div className="w-64 bg-gray-50 h-full overflow-y-auto border-l">
                  <div className="p-4 font-bold border-b text-sm">{verticalCategory.name}</div>
                  {verticalCategory.subcategories?.length > 0 ? (
                    verticalCategory.subcategories.map((sub) => (
                      <div key={sub._id} className="p-4 hover:bg-gray-100 border-b cursor-pointer flex justify-between items-center"
                        onMouseEnter={() => setVerticalSubcategory(sub)} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center" onClick={(e) => handleSubcategoryClick(sub, verticalCategory.slug, e)}>
                          <img src={sub.image || ""} alt={sub.name} loading="lazy" className="w-8 h-8 mr-2 rounded object-cover" onError={(e) => { e.target.style.display="none"; }} />
                          <span className="text-sm">{sub.name}</span>
                        </div>
                        {sub.brands?.length > 0 && <ChevronRight size={18} className="text-gray-400" />}
                      </div>
                    ))
                  ) : verticalCategory.brands?.length > 0 ? (
                    verticalCategory.brands.map((brand) => (
                      <div key={brand._id} className="p-4 hover:bg-gray-100 border-b cursor-pointer" onClick={(e) => handleBrandClick(brand, verticalCategory.slug, null, e)}>
                        <div className="flex items-center">
                          <img src={brand.image || ""} alt={brand.name} loading="lazy" className="w-12 h-6 mr-2 object-contain" onError={(e) => { e.target.style.display="none"; }} />
                          <span className="text-sm">{brand.name}</span>
                        </div>
                      </div>
                    ))
                  ) : <div className="p-4 text-gray-500 text-sm">No items</div>}
                </div>
              )}
              {verticalSubcategory && (
                <div className="w-64 bg-white h-full overflow-y-auto border-l">
                  <div className="p-4 font-bold border-b text-sm">{verticalSubcategory.name} — Brands</div>
                  {verticalSubcategory.brands?.length > 0 ? (
                    verticalSubcategory.brands.map((brand) => (
                      <div key={brand._id} className="p-4 hover:bg-gray-100 border-b cursor-pointer" onClick={(e) => handleBrandClick(brand, verticalCategory.slug, verticalSubcategory.slug, e)}>
                        <div className="flex items-center">
                          <img src={brand.image || ""} alt={brand.name} loading="lazy" className="w-8 h-8 mr-2 rounded object-cover" onError={(e) => { e.target.style.display="none"; }} />
                          <span className="text-sm">{brand.name}</span>
                        </div>
                      </div>
                    ))
                  ) : <div className="p-4 text-gray-500 text-sm">No brands available</div>}
                </div>
              )}
            </div>
          ) : (
            <div ref={menuRef} className="w-4/5 max-w-sm bg-white h-full overflow-y-auto ml-auto shadow-2xl flex flex-col">
              <div className="p-4 font-bold flex justify-between items-center bg-secondary-200 text-white flex-shrink-0">
                <span>Browse</span>
                <X size={22} className="cursor-pointer" onClick={() => setVerticalMenuActive(false)} />
              </div>
              <Link to="/shop" className="flex items-center gap-3 p-4 font-semibold text-secondary-200 border-b hover:bg-gray-50" onClick={() => setVerticalMenuActive(false)}>
                <ShoppingBag size={18} className="flex-shrink-0" />Shop All Products
              </Link>
              <div className="flex-1 overflow-y-auto">
                {categoryStructure.map((cat) => (
                  <div key={cat._id}>
                    <div className="p-4 border-b cursor-pointer flex justify-between items-center hover:bg-gray-50"
                      onClick={(e) => { e.stopPropagation(); toggleCategoryExpansion(cat._id); }}>
                      <span className="font-medium text-sm"
                        onClick={(e) => { e.stopPropagation(); handleCategoryClick(cat, e); }}>{cat.name}</span>
                      {(cat.subcategories?.length > 0 || cat.brands?.length > 0)
                        ? (expandedCategories[cat._id] ? <ChevronDown size={18}/> : <ChevronRight size={18}/>) : null}
                    </div>
                    {expandedCategories[cat._id] && (
                      <div className="bg-gray-50">
                        {cat.subcategories?.length > 0 ? cat.subcategories.map((sub) => (
                          <div key={sub._id}>
                            <div className="p-4 pl-8 border-b cursor-pointer flex justify-between items-center hover:bg-gray-100"
                              onClick={(e) => { e.stopPropagation(); toggleSubcategoryExpansion(sub._id); }}>
                              <span className="text-sm" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick(sub, cat.slug, e); }}>{sub.name}</span>
                              {sub.brands?.length > 0 ? (expandedSubcategories[sub._id] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>) : null}
                            </div>
                            {expandedSubcategories[sub._id] && sub.brands && (
                              <div className="bg-white">
                                {sub.brands.map((brand) => (
                                  <div key={brand._id} className="p-3 pl-12 border-b cursor-pointer text-xs text-gray-600 hover:bg-gray-50"
                                    onClick={(e) => handleBrandClick(brand, cat.slug, sub.slug, e)}>{brand.name}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )) : cat.brands?.length > 0 ? cat.brands.map((brand) => (
                          <div key={brand._id} className="p-4 pl-8 border-b cursor-pointer text-sm hover:bg-gray-100"
                            onClick={(e) => handleBrandClick(brand, cat.slug, null, e)}>{brand.name}</div>
                        )) : <div className="p-4 pl-8 text-xs text-gray-400">No items</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t flex-shrink-0">
                <Link to="/blogs" className="flex items-center gap-3 p-4 text-sm text-gray-700 hover:bg-gray-50 border-b" onClick={() => setVerticalMenuActive(false)}><BookOpen size={16} className="text-secondary-200 flex-shrink-0"/>Coffee Blog</Link>
                <Link to="/partner-with-us" className="flex items-center gap-3 p-4 text-sm text-gray-700 hover:bg-gray-50 border-b" onClick={() => setVerticalMenuActive(false)}><Handshake size={16} className="text-secondary-200 flex-shrink-0"/>Partner With Us</Link>
                <Link to="/contact-us" className="flex items-center gap-3 p-4 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setVerticalMenuActive(false)}><Phone size={16} className="text-secondary-200 flex-shrink-0"/>Contact Us</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default HeaderNavigation;
