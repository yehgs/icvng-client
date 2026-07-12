// client/src/components/HeaderNavigation.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCountry } from "../context/CountryContext";
import {
  ChevronDown,
  ChevronRight,
  X,
  ShoppingBag,
  BookOpen,
  Handshake,
  Phone,
} from "lucide-react";

const BROWN = "#7B3F1C";
const BROWN_LIGHT = "#fdf4ee";

// ─── Categories that get the compatible-system dropdown instead of the standard one
// Matched primarily against the category's slug, which stays stable across
// languages (unlike cat.name, which is now server-translated per visitor
// language — matching only the English name here was silently breaking thicd s
// menu on every non-English domain, e.g. i-coffee.tg). Name matching is kept
// only as a fallback for categories that happen to be missing a slug, and
// covers EN/FR/IT so it doesn't regress the same way again.
const COMPAT_CATEGORY_SLUGS = ["coffee-capsule", "capsule-machine"];
const COMPAT_CATEGORY_NAMES = [
  "coffee capsule",
  "capsule machine",
  "capsule de café",
  "machine à capsules",
  "machine a capsules",
  "capsula caffè",
  "capsula caffe",
  "macchina a capsule",
];

function isCapsuleOrCompatCategory(cat) {
  const slugLow = (cat?.slug || "").toLowerCase();
  if (COMPAT_CATEGORY_SLUGS.some((s) => slugLow.includes(s))) return true;

  const nameLow = (cat?.name || "").toLowerCase();
  return COMPAT_CATEGORY_NAMES.some((n) => nameLow.includes(n));
}

// ─── Compatible-System Dropdown for specific categories ───────────────────────
// Layout (reversed from old):
//   Compatible brands shown HORIZONTALLY across the top as column headers
//   Below each compatible brand: its product brands listed vertically
// ──────────────────────────────────────────────────────────────────────────────
function CompatCategoryMegaMenu({
  category,
  rect,
  compatStructure,
  onClose,
  onNavigate,
}) {
  const { t } = useCountry();
  if (!category || !rect || !compatStructure?.length) return null;

  // Match by the category's stable _id (falling back to slug) — matching by
  // name broke this menu entirely on non-English domains, since category.name
  // here is the server-translated name (e.g. French on i-coffee.tg) while
  // compatBrand.categories[].name from /api/compatible/structure is always
  // English, so the two would never line up once translated.
  const relevantBrands = compatStructure
    .map((compatBrand) => {
      const matchedCat = compatBrand.categories?.find(
        (c) =>
          (category._id && c._id && String(c._id) === String(category._id)) ||
          (category.slug && c.slug && category.slug === c.slug),
      );
      if (!matchedCat) return null;
      return { compatBrand, productBrands: matchedCat.brands || [] };
    })
    .filter(Boolean);

  if (!relevantBrands.length) return null;

  const shopUrl = (params) => `/shop?${new URLSearchParams(params).toString()}`;

  const goCompatBrand = (compatBrand) => {
    onNavigate(
      shopUrl({
        compatibleSystem: compatBrand._id,
        compatibleSystemName: compatBrand.name,
        category: category._id,
        categoryName: category.name,
      }),
    );
    onClose();
  };

  const goProductBrand = (productBrand, compatBrand) => {
    onNavigate(
      shopUrl({
        compatibleSystem: compatBrand._id,
        compatibleSystemName: compatBrand.name,
        category: category._id,
        categoryName: category.name,
        brand: productBrand._id,
        brandName: productBrand.name,
      }),
    );
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: rect.bottom,
        left: 0,
        right: 0,
        width: "100vw",
        zIndex: 2147483647,
        background: "white",
        boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
        borderTop: `3px solid ${BROWN}`,
        maxHeight: "72vh",
        overflowY: "auto",
      }}
      onMouseLeave={onClose}
    >
      {/* Panel label */}
      <div
        style={{ padding: "16px 48px 0", borderBottom: `1px solid #f0ebe6` }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#9ca3af",
            textTransform: "uppercase",
            paddingBottom: 12,
          }}
        >
          {category.name} — {t("nav.compatibleSystems")}
        </p>
      </div>

      {/* Columns: one per compatible brand, laid out horizontally */}
      <div
        style={{
          display: "flex",
          flexWrap: "nowrap",
          overflowX: "auto",
          padding: "24px 48px 32px",
          gap: 0,
          alignItems: "flex-start",
          scrollbarWidth: "thin",
          scrollbarColor: `${BROWN} #f3ede8`,
        }}
      >
        {relevantBrands.map(({ compatBrand, productBrands }, idx) => (
          <div
            key={compatBrand._id}
            style={{
              minWidth: 160,
              flex: "1 1 160px",
              maxWidth: 220,
              paddingRight: 28,
              marginRight: idx < relevantBrands.length - 1 ? 4 : 0,
              borderRight:
                idx < relevantBrands.length - 1 ? `1px solid #ede9e4` : "none",
              flexShrink: 0,
            }}
          >
            {/* Compatible brand header — logo + name, clickable */}
            <button
              onClick={() => goCompatBrand(compatBrand)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 6,
                width: "100%",
                marginBottom: 14,
                cursor: "pointer",
                textAlign: "left",
                transition: "opacity 0.15s",
                paddingBottom: 12,
                borderBottom: `2px solid ${BROWN_LIGHT}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.72";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {compatBrand.image ? (
                <img
                  src={compatBrand.image}
                  alt={compatBrand.name}
                  style={{
                    width: 80,
                    height: 44,
                    objectFit: "contain",
                    borderRadius: 4,
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 44,
                    background: BROWN_LIGHT,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 10, color: BROWN, fontWeight: 700 }}>
                    LOGO
                  </span>
                </div>
              )}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: BROWN,
                  lineHeight: 1.2,
                }}
              >
                {compatBrand.name}
              </span>
            </button>

            {/* Product brands — vertical list below the compatible brand */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {productBrands.length === 0 ? (
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  No brands
                </span>
              ) : (
                productBrands.map((pb) => (
                  <button
                    key={pb._id}
                    onClick={() => goProductBrand(pb, compatBrand)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "5px 8px",
                      borderRadius: 6,
                      cursor: "pointer",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      width: "100%",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = BROWN_LIGHT;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {pb.image && (
                      <img
                        src={pb.image}
                        alt={pb.name}
                        style={{
                          width: 38,
                          height: 20,
                          objectFit: "contain",
                          flexShrink: 0,
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#374151",
                        lineHeight: 1.3,
                      }}
                    >
                      {pb.name}
                    </span>
                  </button>
                ))
              )}

              {/* See all link */}
              <button
                onClick={() => goCompatBrand(compatBrand)}
                style={{
                  fontSize: 11,
                  color: BROWN,
                  fontWeight: 700,
                  textDecoration: "underline",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  padding: "4px 8px",
                  marginTop: 2,
                }}
              >
                {t("nav.seeAll")} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Standard Category Mega Menu ─────────────────────────────────────────────
function MegaMenu({
  category,
  rect,
  onClose,
  onSubcategoryClick,
  onBrandClick,
}) {
  if (!category || !rect) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: rect.bottom,
        left: 0,
        right: 0,
        width: "100vw",
        zIndex: 2147483647,
        background: "white",
        boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
        borderTop: `3px solid ${BROWN}`,
        padding: "28px 48px 36px",
      }}
      onMouseLeave={onClose}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "#9ca3af",
          textTransform: "uppercase",
          marginBottom: 22,
        }}
      >
        {category.name}
      </p>

      {category.subcategories?.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          {category.subcategories.map((sub) => (
            <div
              key={sub._id}
              style={{
                minWidth: 180,
                flex: "1 1 180px",
                maxWidth: 240,
                padding: "0 32px 24px 0",
              }}
            >
              {/* Subcategory header: icon + bold name */}
              <button
                onClick={(e) => {
                  onSubcategoryClick(sub, category.slug, e);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "opacity 0.12s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {sub.image ? (
                  <img
                    src={sub.image}
                    alt={sub.name}
                    loading="lazy"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 6,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      background: BROWN_LIGHT,
                      borderRadius: 6,
                      flexShrink: 0,
                    }}
                  />
                )}
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#111827",
                    lineHeight: 1.3,
                  }}
                >
                  {sub.name}
                </span>
              </button>

              {/* Brand list — logo + name with hover highlight */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {sub.brands?.slice(0, 8).map((brand) => (
                  <li
                    key={brand._id}
                    onClick={(e) => {
                      onBrandClick(brand, category.slug, sub.slug, e);
                      onClose();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "4px 6px",
                      borderRadius: 6,
                      cursor: "pointer",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = BROWN_LIGHT;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {brand.image ? (
                      <img
                        src={brand.image}
                        alt={brand.name}
                        loading="lazy"
                        style={{
                          width: 36,
                          height: 18,
                          objectFit: "contain",
                          flexShrink: 0,
                          borderRadius: 2,
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div style={{ width: 36, height: 18, flexShrink: 0 }} />
                    )}
                    <span
                      style={{
                        fontSize: 13,
                        color: "#4b5563",
                        lineHeight: 1.4,
                        fontWeight: 500,
                      }}
                    >
                      {brand.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : category.brands?.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px" }}>
          {category.brands.map((brand) => (
            <button
              key={brand._id}
              onClick={(e) => {
                onBrandClick(brand, category.slug, null, e);
                onClose();
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                minWidth: 90,
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                border: "1px solid #f0ebe6",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = BROWN;
                e.currentTarget.style.background = BROWN_LIGHT;
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 3px 10px rgba(123,63,28,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#f0ebe6";
                e.currentTarget.style.background = "white";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <img
                src={brand.image || ""}
                alt={brand.name}
                loading="lazy"
                style={{ width: 64, height: 32, objectFit: "contain" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p style={{ color: "#9ca3af", fontSize: 14 }}>No items available</p>
      )}
    </div>
  );
}

// ─── Mobile: CompatCategory accordion rows ────────────────────────────────────
function MobileCompatCategoryRows({
  category,
  compatStructure,
  onNavigate,
  onClose,
}) {
  const [expandedCompat, setExpandedCompat] = useState({});
  const { t } = useCountry();

  const relevantBrands = (compatStructure || [])
    .map((compatBrand) => {
      const matchedCat = compatBrand.categories?.find(
        (c) =>
          (category?._id && c._id && String(c._id) === String(category._id)) ||
          (category?.slug && c.slug && category.slug === c.slug),
      );
      if (!matchedCat) return null;
      return { compatBrand, productBrands: matchedCat.brands || [] };
    })
    .filter(Boolean);

  if (!relevantBrands.length) return null;

  const shopUrl = (params) => `/shop?${new URLSearchParams(params).toString()}`;

  return (
    <div className="bg-amber-50">
      <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-800 border-b border-amber-200">
        {t("nav.compatibleSystems")}
      </div>
      {relevantBrands.map(({ compatBrand, productBrands }) => (
        <div key={compatBrand._id}>
          {/* Compatible brand row */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-amber-100 cursor-pointer hover:bg-amber-100"
            onClick={() =>
              setExpandedCompat((p) => ({
                ...p,
                [compatBrand._id]: !p[compatBrand._id],
              }))
            }
          >
            <div
              className="flex items-center gap-3 flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(
                  shopUrl({
                    compatibleSystem: compatBrand._id,
                    compatibleSystemName: compatBrand.name,
                    category: category._id,
                    categoryName: category.name,
                  }),
                );
                onClose();
              }}
            >
              {compatBrand.image && (
                <img
                  src={compatBrand.image}
                  alt={compatBrand.name}
                  className="w-12 h-7 object-contain flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <span className="text-sm font-semibold" style={{ color: BROWN }}>
                {compatBrand.name}
              </span>
            </div>
            {productBrands.length > 0 &&
              (expandedCompat[compatBrand._id] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              ))}
          </div>

          {/* Product brands — horizontal chips */}
          {expandedCompat[compatBrand._id] && productBrands.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 py-3 bg-white border-b border-amber-100">
              {productBrands.map((pb) => (
                <button
                  key={pb._id}
                  onClick={() => {
                    onNavigate(
                      shopUrl({
                        compatibleSystem: compatBrand._id,
                        compatibleSystemName: compatBrand.name,
                        category: category._id,
                        categoryName: category.name,
                        brand: pb._id,
                        brandName: pb.name,
                      }),
                    );
                    onClose();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium hover:bg-amber-50"
                  style={{ borderColor: "#d1b99a", color: "#374151" }}
                >
                  {pb.image && (
                    <img
                      src={pb.image}
                      alt={pb.name}
                      className="w-8 h-4 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  {pb.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main HeaderNavigation ────────────────────────────────────────────────────
const HeaderNavigation = ({ mobileMenuOnly = false }) => {
  const navigate = useNavigate();
  const { t } = useCountry();
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

  const categoryStructure = useSelector(
    (state) => state.product.categoryStructure,
  );
  const loadingCategoryStructure = useSelector(
    (state) => state.product.loadingCategoryStructure,
  );
  const compatibleSystemStructure = useSelector(
    (state) => state.product.compatibleSystemStructure,
  );

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
      if (menuRef.current && !menuRef.current.contains(e.target))
        setVerticalMenuActive(false);
    };
    if (verticalMenuActive)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [verticalMenuActive]);

  useEffect(() => {
    const onScroll = () => {
      setHoveredCategory(null);
      setHoveredRect(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (path) => {
    navigate(path);
    setVerticalMenuActive(false);
  };
  const handleCategoryClick = (cat, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    go(`/category/${cat.slug}`);
  };
  const handleSubcategoryClick = (sub, catSlug, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    go(`/category/${catSlug}/subcategory/${sub.slug}`);
  };
  const handleBrandClick = (brand, catSlug, subSlug, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (subSlug)
      go(`/category/${catSlug}/subcategory/${subSlug}/brand/${brand.slug}`);
    else if (catSlug) go(`/category/${catSlug}/brand/${brand.slug}`);
    else go(`/brand/${brand.slug}`);
  };

  // Decide which dropdown to show for a category
  const isCompatCat = (cat) =>
    isCapsuleOrCompatCategory(cat) && compatibleSystemStructure.length > 0;

  // Hover handlers
  const handleButtonMouseEnter = (e, category) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredCategory(category);
    setHoveredRect(rect);
  };
  const handleButtonMouseLeave = () => {
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

  const toggleCategoryExpansion = (id) =>
    setExpandedCategories((p) => ({ ...p, [id]: !p[id] }));
  const toggleSubcategoryExpansion = (id) =>
    setExpandedSubcategories((p) => ({ ...p, [id]: !p[id] }));

  return (
    <>
      {/* ── Desktop category bar ── */}
      {!mobileMenuOnly && (
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center w-full">
              {/* Scrollable category nav strip */}
              <div
                className="flex-1"
                style={{
                  overflowX: "auto",
                  overflowY: "visible",
                  scrollbarWidth: "none",
                }}
              >
                <div
                  className="flex items-center"
                  style={{ minWidth: "max-content" }}
                >
                  {loadingCategoryStructure ? (
                    <div className="py-3 px-4 text-sm text-gray-400">
                      Loading...
                    </div>
                  ) : (
                    categoryStructure.map((category) => {
                      const isCompat = isCompatCat(category);
                      const hasStdDrop =
                        !isCompat &&
                        (category.subcategories?.length > 0 ||
                          category.brands?.length > 0);
                      return (
                        <button
                          key={category._id}
                          onClick={(e) => handleCategoryClick(category, e)}
                          onMouseEnter={(e) =>
                            handleButtonMouseEnter(e, category)
                          }
                          onMouseLeave={handleButtonMouseLeave}
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

      {/* Dropdown — compat-category OR standard, based on which category is hovered */}
      {hoveredCategory &&
        hoveredRect &&
        (() => {
          if (isCompatCat(hoveredCategory)) {
            return (
              <div
                onMouseEnter={handleMenuMouseEnter}
                onMouseLeave={handleMenuClose}
              >
                <CompatCategoryMegaMenu
                  category={hoveredCategory}
                  rect={hoveredRect}
                  compatStructure={compatibleSystemStructure}
                  onClose={handleMenuClose}
                  onNavigate={(path) => navigate(path)}
                />
              </div>
            );
          }
          return (
            <div
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuClose}
            >
              <MegaMenu
                category={hoveredCategory}
                rect={hoveredRect}
                onClose={handleMenuClose}
                onSubcategoryClick={handleSubcategoryClick}
                onBrandClick={handleBrandClick}
              />
            </div>
          );
        })()}

      {/* ── Slide-in vertical menu ── */}
      {verticalMenuActive && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex"
          style={{ zIndex: 9999 }}
        >
          {
            /* ── Mobile slide-in panel ── */
            <div
              ref={menuRef}
              className="w-4/5 max-w-sm bg-white h-full overflow-y-auto ml-auto shadow-2xl flex flex-col"
            >
              <div className="p-4 font-bold flex justify-between items-center bg-secondary-200 text-white flex-shrink-0">
                <span>{t("header.browse")}</span>
                <X
                  size={22}
                  className="cursor-pointer"
                  onClick={() => setVerticalMenuActive(false)}
                />
              </div>

              {/* Shop All */}
              <Link
                to="/shop"
                className="flex items-center gap-3 p-4 font-semibold text-secondary-200 border-b hover:bg-gray-50"
                onClick={() => setVerticalMenuActive(false)}
              >
                <ShoppingBag size={18} className="flex-shrink-0" />
                {t("header.shopAllProducts")}
              </Link>

              {/* Categories */}
              <div className="flex-1 overflow-y-auto">
                {categoryStructure.map((cat) => (
                  <div key={cat._id}>
                    <div
                      className="p-4 border-b cursor-pointer flex justify-between items-center hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategoryExpansion(cat._id);
                      }}
                    >
                      <span
                        className="font-medium text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(cat, e);
                        }}
                      >
                        {cat.name}
                      </span>
                      {cat.subcategories?.length > 0 ||
                      cat.brands?.length > 0 ||
                      isCompatCat(cat) ? (
                        expandedCategories[cat._id] ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )
                      ) : null}
                    </div>

                    {expandedCategories[cat._id] &&
                      (isCompatCat(cat) ? (
                        // Compat category mobile accordion
                        <MobileCompatCategoryRows
                          category={cat}
                          compatStructure={compatibleSystemStructure}
                          onNavigate={(path) => navigate(path)}
                          onClose={() => setVerticalMenuActive(false)}
                        />
                      ) : (
                        <div className="bg-gray-50">
                          {cat.subcategories?.length > 0 ? (
                            cat.subcategories.map((sub) => (
                              <div key={sub._id}>
                                <div
                                  className="p-4 pl-8 border-b cursor-pointer flex justify-between items-center hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSubcategoryExpansion(sub._id);
                                  }}
                                >
                                  <span
                                    className="text-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSubcategoryClick(sub, cat.slug, e);
                                    }}
                                  >
                                    {sub.name}
                                  </span>
                                  {sub.brands?.length > 0 ? (
                                    expandedSubcategories[sub._id] ? (
                                      <ChevronDown size={16} />
                                    ) : (
                                      <ChevronRight size={16} />
                                    )
                                  ) : null}
                                </div>
                                {expandedSubcategories[sub._id] &&
                                  sub.brands && (
                                    <div className="bg-white">
                                      {sub.brands.map((brand) => (
                                        <div
                                          key={brand._id}
                                          className="p-3 pl-12 border-b cursor-pointer text-xs text-gray-600 hover:bg-gray-50"
                                          onClick={(e) =>
                                            handleBrandClick(
                                              brand,
                                              cat.slug,
                                              sub.slug,
                                              e,
                                            )
                                          }
                                        >
                                          {brand.name}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            ))
                          ) : cat.brands?.length > 0 ? (
                            cat.brands.map((brand) => (
                              <div
                                key={brand._id}
                                className="p-4 pl-8 border-b cursor-pointer text-sm hover:bg-gray-100"
                                onClick={(e) =>
                                  handleBrandClick(brand, cat.slug, null, e)
                                }
                              >
                                {brand.name}
                              </div>
                            ))
                          ) : (
                            <div className="p-4 pl-8 text-xs text-gray-400">
                              No items
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ))}
              </div>

              <div className="border-t flex-shrink-0">
                <Link
                  to="/blogs"
                  className="flex items-center gap-3 p-4 text-sm text-gray-700 hover:bg-gray-50 border-b"
                  onClick={() => setVerticalMenuActive(false)}
                >
                  <BookOpen
                    size={16}
                    className="text-secondary-200 flex-shrink-0"
                  />
                  {t("header.coffeeBlog")}
                </Link>
                <Link
                  to="/partner-with-us"
                  className="flex items-center gap-3 p-4 text-sm text-gray-700 hover:bg-gray-50 border-b"
                  onClick={() => setVerticalMenuActive(false)}
                >
                  <Handshake
                    size={16}
                    className="text-secondary-200 flex-shrink-0"
                  />
                  {t("footer.partnerWithUs")}
                </Link>
                <Link
                  to="/contact-us"
                  className="flex items-center gap-3 p-4 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setVerticalMenuActive(false)}
                >
                  <Phone
                    size={16}
                    className="text-secondary-200 flex-shrink-0"
                  />
                  {t("footer.contactUs")}
                </Link>
              </div>
            </div>
          }
        </div>
      )}
    </>
  );
};

export default HeaderNavigation;
