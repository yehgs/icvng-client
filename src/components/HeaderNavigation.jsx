// client/src/components/HeaderNavigation.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronDown, ChevronRight, X, ShoppingBag, BookOpen, Handshake, Phone, Cpu } from "lucide-react";

// ─── Compatible Systems Mega Menu (Desktop) ──────────────────────────────────
// Three-column layout:
//   Col 1 — Compatible brands (logo + name, horizontal pills)
//   Col 2 — Categories of the selected compatible brand
//   Col 3 — Product brands within the selected category
// ──────────────────────────────────────────────────────────────────────────────
function CompatibleMegaMenu({ structure, rect, onClose, onNavigate }) {
  if (!structure?.length || !rect) return null;

  const BROWN = "#7B3F1C";
  const BROWN_BG = "#fdf4ee"; // very light warm brown for L1 header band
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [canScrollDown, setCanScrollDown] = React.useState(false);
  const scrollRef = React.useRef(null);

  const updateScrollIndicators = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  };

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollIndicators();
    el.addEventListener("scroll", updateScrollIndicators);
    const ro = new ResizeObserver(updateScrollIndicators);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateScrollIndicators); ro.disconnect(); };
  }, [structure]);

  const shopUrl = (params) => `/shop?${new URLSearchParams(params).toString()}`;
  const goCompatibleBrand = (brand) => { onNavigate(shopUrl({ compatibleSystem: brand._id, compatibleSystemName: brand.name })); onClose(); };
  const goCategory = (cat, brand) => { onNavigate(shopUrl({ compatibleSystem: brand._id, compatibleSystemName: brand.name, category: cat._id, categoryName: cat.name })); onClose(); };
  const goBrand = (productBrand, cat, compatBrand) => { onNavigate(shopUrl({ compatibleSystem: compatBrand._id, compatibleSystemName: compatBrand.name, category: cat._id, categoryName: cat.name, brand: productBrand._id, brandName: productBrand.name })); onClose(); };

  // Inline keyframe style injected once
  const styleTag = `
    @keyframes bounceX { 0%,100%{transform:translateX(0)} 50%{transform:translateX(6px)} }
    @keyframes bounceY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
    .compat-item-hover { transition: background 0.15s, opacity 0.15s; }
    .compat-item-hover:hover { background: rgba(123,63,28,0.06) !important; opacity: 0.88; }
    .compat-brand-hover { transition: background 0.15s; }
    .compat-brand-hover:hover { background: rgba(123,63,28,0.08) !important; }
  `;

  return (
    <div
      style={{ position: "fixed", top: rect.bottom, left: 0, right: 0, width: "100vw", zIndex: 2147483647, background: "white", boxShadow: "0 16px 56px rgba(0,0,0,0.18)", borderTop: `3px solid ${BROWN}` }}
      onMouseLeave={onClose}
    >
      <style>{styleTag}</style>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        style={{ maxHeight: "78vh", overflowX: "auto", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${BROWN} #f3ede8` }}
      >
        <div style={{ display: "flex", flexWrap: "nowrap", gap: 0, alignItems: "flex-start", minWidth: "max-content" }}>
          {structure.map((brand, idx) => (
            <div
              key={brand._id}
              style={{ width: 290, flexShrink: 0, borderRight: idx < structure.length - 1 ? `1px solid #ede9e4` : "none" }}
            >
              {/* ── Level 1: Compatible Brand — light brown header row ── */}
              <button
                className="compat-brand-hover"
                onClick={() => goCompatibleBrand(brand)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  width: "100%", padding: "20px 24px 18px", cursor: "pointer", textAlign: "left",
                  background: BROWN_BG, borderBottom: `2px solid #e8d5c4`,
                }}
              >
                {brand.image ? (
                  <img src={brand.image} alt={brand.name}
                    style={{ width: 82, height: 54, objectFit: "contain", flexShrink: 0, borderRadius: 6 }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div style={{ width: 82, height: 54, background: "#e8d5c4", borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, color: BROWN, fontWeight: 700 }}>LOGO</span>
                  </div>
                )}
                <span style={{ fontSize: 17, fontWeight: 800, color: BROWN, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                  {brand.name}
                </span>
              </button>

              {/* ── Level 2 & 3: Categories + Brands ── */}
              <div style={{ padding: "16px 24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
                {brand.categories?.map((cat) => (
                  <div key={cat._id}>
                    <button
                      className="compat-item-hover"
                      onClick={() => goCategory(cat, brand)}
                      style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer", textAlign: "left", width: "100%", borderRadius: 6, padding: "4px 4px 4px 0" }}
                    >
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name}
                          style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div style={{ width: 36, height: 36, background: BROWN, borderRadius: 6, flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: 12, fontWeight: 800, color: BROWN, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {cat.name}
                      </span>
                    </button>

                    {/* Product brands — 2-col grid */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", paddingLeft: 4 }}>
                      {cat.brands?.map((productBrand) => (
                        <button
                          key={productBrand._id}
                          className="compat-item-hover"
                          onClick={() => goBrand(productBrand, cat, brand)}
                          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textAlign: "left", minWidth: "calc(50% - 6px)", flex: "1 1 calc(50% - 6px)", maxWidth: "100%", padding: "4px 6px", borderRadius: 6 }}
                        >
                          {productBrand.image ? (
                            <img src={productBrand.image} alt={productBrand.name}
                              style={{ width: 46, height: 26, objectFit: "contain", flexShrink: 0, borderRadius: 4 }}
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div style={{ width: 46, height: 26, background: "#e5e7eb", borderRadius: 4, flexShrink: 0 }} />
                          )}
                          <span style={{ fontSize: 12, color: "#4b5563", fontWeight: 500, lineHeight: 1.3 }}>
                            {productBrand.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll RIGHT indicator — animated bounce */}
      {canScrollRight && (
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0,
          background: `linear-gradient(to left, rgba(253,244,238,0.98) 40%, transparent)`,
          width: 80, display: "flex", alignItems: "center", justifyContent: "flex-end",
          paddingRight: 14, pointerEvents: "none",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <ChevronRight
              size={34}
              color={BROWN}
              strokeWidth={2.5}
              style={{ animation: "bounceX 0.9s ease-in-out infinite", filter: `drop-shadow(0 0 4px rgba(123,63,28,0.3))` }}
            />
            <span style={{ fontSize: 9, color: BROWN, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.8 }}>scroll</span>
          </div>
        </div>
      )}

      {/* Scroll DOWN indicator — animated bounce */}
      {canScrollDown && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: `linear-gradient(to top, rgba(253,244,238,0.98) 50%, transparent)`,
          height: 60, display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: 8, pointerEvents: "none",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            <span style={{ fontSize: 9, color: BROWN, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.8 }}>scroll</span>
            <ChevronDown
              size={32}
              color={BROWN}
              strokeWidth={2.5}
              style={{ animation: "bounceY 0.9s ease-in-out infinite", filter: `drop-shadow(0 0 4px rgba(123,63,28,0.3))` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Standard Category Mega Menu ─────────────────────────────────────────────
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

// ─── Mobile: Compatible System accordion item ─────────────────────────────────
function MobileCompatibleItem({ structure, onNavigate, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedBrand, setExpandedBrand] = useState({});
  const [expandedCategory, setExpandedCategory] = useState({});

  if (!structure?.length) return null;

  const toggle = (id, map, setter) => setter((p) => ({ ...p, [id]: !p[id] }));

  const goCompatibleBrand = (brand) => {
    onNavigate(`/shop?compatibleSystem=${brand._id}&compatibleSystemName=${encodeURIComponent(brand.name)}`);
    onClose();
  };
  const goCategory = (cat, brand) => {
    onNavigate(`/shop?compatibleSystem=${brand._id}&compatibleSystemName=${encodeURIComponent(brand.name)}&category=${cat._id}&categoryName=${encodeURIComponent(cat.name)}`);
    onClose();
  };
  const goBrand = (productBrand, cat, compatBrand) => {
    onNavigate(`/shop?compatibleSystem=${compatBrand._id}&compatibleSystemName=${encodeURIComponent(compatBrand.name)}&category=${cat._id}&categoryName=${encodeURIComponent(cat.name)}&brand=${productBrand._id}&brandName=${encodeURIComponent(productBrand.name)}`);
    onClose();
  };

  return (
    <>
      {/* Top-level "Compatible Systems" row */}
      <div
        className="p-4 border-b cursor-pointer flex justify-between items-center hover:bg-gray-50"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-secondary-200 flex-shrink-0" />
          <span className="font-medium text-sm">Compatible Systems</span>
        </div>
        {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </div>

      {expanded && (
        <div className="bg-gray-50">
          {structure.map((brand) => (
            <div key={brand._id}>
              {/* Level 1: Compatible brand */}
              <div
                className="p-4 pl-6 border-b flex justify-between items-center hover:bg-gray-100 cursor-pointer"
                onClick={() => toggle(brand._id, expandedBrand, setExpandedBrand)}
              >
                <div
                  className="flex items-center gap-2 flex-1"
                  onClick={(e) => { e.stopPropagation(); goCompatibleBrand(brand); }}
                >
                  {brand.image && (
                    <img src={brand.image} alt={brand.name} className="w-10 h-6 object-contain flex-shrink-0"
                      onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                  <span className="text-sm font-semibold">{brand.name}</span>
                </div>
                {brand.categories?.length > 0
                  ? (expandedBrand[brand._id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />)
                  : null}
              </div>

              {expandedBrand[brand._id] && brand.categories?.length > 0 && (
                <div className="bg-white">
                  {brand.categories.map((cat) => (
                    <div key={cat._id}>
                      {/* Level 2: Category */}
                      <div
                        className="p-3 pl-10 border-b flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggle(cat._id, expandedCategory, setExpandedCategory)}
                      >
                        <div
                          className="flex items-center gap-2 flex-1"
                          onClick={(e) => { e.stopPropagation(); goCategory(cat, brand); }}
                        >
                          {cat.image && (
                            <img src={cat.image} alt={cat.name} className="w-7 h-7 object-cover rounded flex-shrink-0"
                              onError={(e) => { e.target.style.display = "none"; }} />
                          )}
                          <span className="text-sm">{cat.name}</span>
                        </div>
                        {cat.brands?.length > 0
                          ? (expandedCategory[cat._id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />)
                          : null}
                      </div>

                      {expandedCategory[cat._id] && cat.brands?.length > 0 && (
                        <div className="bg-gray-50">
                          {cat.brands.map((productBrand) => (
                            <div
                              key={productBrand._id}
                              className="p-3 pl-14 border-b flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => goBrand(productBrand, cat, brand)}
                            >
                              {productBrand.image && (
                                <img src={productBrand.image} alt={productBrand.name}
                                  className="w-10 h-5 object-contain flex-shrink-0"
                                  onError={(e) => { e.target.style.display = "none"; }} />
                              )}
                              <span className="text-xs text-gray-700">{productBrand.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Main HeaderNavigation ────────────────────────────────────────────────────
const HeaderNavigation = ({ mobileMenuOnly = false }) => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredRect, setHoveredRect] = useState(null);
  const [compatMenuActive, setCompatMenuActive] = useState(false);
  const [compatMenuRect, setCompatMenuRect] = useState(null);
  const [verticalMenuActive, setVerticalMenuActive] = useState(false);
  const [verticalCategory, setVerticalCategory] = useState(null);
  const [verticalSubcategory, setVerticalSubcategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);
  const hideTimer = useRef(null);
  const compatHideTimer = useRef(null);

  const categoryStructure = useSelector((state) => state.product.categoryStructure);
  const loadingCategoryStructure = useSelector((state) => state.product.loadingCategoryStructure);
  const compatibleSystemStructure = useSelector((state) => state.product.compatibleSystemStructure);

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

  useEffect(() => {
    const onScroll = () => {
      setHoveredCategory(null); setHoveredRect(null);
      setCompatMenuActive(false); setCompatMenuRect(null);
    };
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

  // Category mega menu hover
  const handleButtonMouseEnter = (e, category) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    // Close compat menu if open
    setCompatMenuActive(false);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredCategory(category);
    setHoveredRect(rect);
  };
  const handleButtonMouseLeave = () => {
    hideTimer.current = setTimeout(() => { setHoveredCategory(null); setHoveredRect(null); }, 100);
  };
  const handleMenuMouseEnter = () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  const handleMenuClose = () => { if (hideTimer.current) clearTimeout(hideTimer.current); setHoveredCategory(null); setHoveredRect(null); };

  // Compatible Systems hover
  const handleCompatMouseEnter = (e) => {
    if (compatHideTimer.current) clearTimeout(compatHideTimer.current);
    // Close category mega menu if open
    setHoveredCategory(null); setHoveredRect(null);
    const rect = e.currentTarget.getBoundingClientRect();
    setCompatMenuActive(true);
    setCompatMenuRect(rect);
  };
  const handleCompatMouseLeave = () => {
    compatHideTimer.current = setTimeout(() => { setCompatMenuActive(false); setCompatMenuRect(null); }, 100);
  };
  const handleCompatMenuMouseEnter = () => { if (compatHideTimer.current) clearTimeout(compatHideTimer.current); };
  const handleCompatMenuClose = () => { if (compatHideTimer.current) clearTimeout(compatHideTimer.current); setCompatMenuActive(false); setCompatMenuRect(null); };

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
              </button>

              {/* Compatible Systems button — dark brown to stand out from category nav */}
              {compatibleSystemStructure.length > 0 && (
                <button
                  onMouseEnter={handleCompatMouseEnter}
                  onMouseLeave={handleCompatMouseLeave}
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginRight: 12,
                    padding: "6px 14px",
                    background: compatMenuActive ? "#5c2e11" : "#7B3F1C",
                    color: "white",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "background 0.15s",
                    border: "none",
                  }}
                >
                  Compatible Systems
                  <ChevronDown size={13} style={{ transition: "transform 0.2s", transform: compatMenuActive ? "rotate(180deg)" : "rotate(0deg)" }} />
                </button>
              )}

              {/* Scrollable category nav strip */}
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

      {/* Compatible Systems Mega Menu */}
      {compatMenuActive && compatMenuRect && compatibleSystemStructure.length > 0 && (
        <div onMouseEnter={handleCompatMenuMouseEnter} onMouseLeave={handleCompatMenuClose}>
          <CompatibleMegaMenu
            structure={compatibleSystemStructure}
            rect={compatMenuRect}
            onClose={handleCompatMenuClose}
            onNavigate={(path) => { navigate(path); }}
          />
        </div>
      )}

      {/* Standard Category Mega Menu */}
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
            /* ── Mobile slide-in panel ── */
            <div ref={menuRef} className="w-4/5 max-w-sm bg-white h-full overflow-y-auto ml-auto shadow-2xl flex flex-col">
              <div className="p-4 font-bold flex justify-between items-center bg-secondary-200 text-white flex-shrink-0">
                <span>Browse</span>
                <X size={22} className="cursor-pointer" onClick={() => setVerticalMenuActive(false)} />
              </div>

              {/* Shop All */}
              <Link to="/shop" className="flex items-center gap-3 p-4 font-semibold text-secondary-200 border-b hover:bg-gray-50" onClick={() => setVerticalMenuActive(false)}>
                <ShoppingBag size={18} className="flex-shrink-0" />Shop All Products
              </Link>

              {/* Compatible Systems (mobile) */}
              <MobileCompatibleItem
                structure={compatibleSystemStructure}
                onNavigate={(path) => navigate(path)}
                onClose={() => setVerticalMenuActive(false)}
              />

              {/* Categories */}
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
