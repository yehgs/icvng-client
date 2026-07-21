import React from "react";
import { FaTimes } from "react-icons/fa";
import { useCountry } from "../context/CountryContext";

const ActiveFilterChips = ({
  filters,
  onRemoveFilter,
  categoryMap = {},
  subCategoryMap = {},
  brandMap = {},
  compatibleSystemMap = {},
}) => {
  const { t, country } = useCountry();
  const currencySymbol = country?.currency?.symbol || "₦";

  // Convert filter types to readable labels
  const getFilterTypeLabel = (type) => {
    const labels = {
      productType: t("shop.chipType"),
      category: t("shop.chipCategory"),
      subCategory: t("shop.chipSubcategory"),
      brand: t("shop.chipBrand"),
      compatibleSystem: t("shop.chipCompatible"),
      roastLevel: t("shop.chipRoast"),
      intensity: t("shop.chipIntensity"),
      blend: t("shop.chipBlend"),
      priceRange: t("shop.chipPriceRange"),
    };
    return labels[type] || type;
  };

  // Format filter values for display
  const formatFilterValue = (type, value) => {
    if (type === "roastLevel") {
      const labels = {
        LIGHT: t("shop.roastLight"),
        MEDIUM: t("shop.roastMedium"),
        DARK: t("shop.roastDark"),
      };
      return labels[value] || value;
    }

    if (type === "productType") {
      const labels = {
        COFFEE: t("shop.typeCoffee"),
        COFFEE_BEANS: t("shop.typeCoffeeBeans"),
        MACHINE: t("shop.typeMachine"),
        ACCESSORIES: t("shop.typeAccessories"),
        TEA: t("shop.typeTea"),
        DRINKS: t("shop.typeDrinks"),
      };
      return labels[value] || value;
    }

    if (type === "intensity") {
      return t("shop.chipIntensityValue", { value: value.split("/")[0] });
    }

    if (type === "category" && categoryMap[value]) {
      return categoryMap[value];
    }

    if (type === "subCategory" && subCategoryMap[value]) {
      return subCategoryMap[value];
    }

    if (type === "brand" && brandMap[value]) {
      return brandMap[value];
    }

    if (type === "compatibleSystem") {
      // value here is the name string (stored in filters.compatibleSystemName)
      return (
        compatibleSystemMap[value] || filters.compatibleSystemName || value
      );
    }

    // For price range
    if (type === "priceRange") {
      const { min, max } = value;
      if (min && max) return t("shop.chipPriceMinMax", { symbol: currencySymbol, min, max });
      if (min) return t("shop.chipPriceMinOnly", { symbol: currencySymbol, min });
      if (max) return t("shop.chipPriceMaxOnly", { symbol: currencySymbol, max });
    }

    return value;
  };

  // Generate active filter chips
  const getActiveFilterChips = () => {
    const chips = [];

    // Add array type filters (checkboxes)
    ["productType", "roastLevel", "intensity", "blend", "brand"].forEach(
      (type) => {
        if (filters[type]?.length > 0) {
          filters[type].forEach((value) => {
            chips.push({
              type,
              value,
              label: formatFilterValue(type, value),
            });
          });
        }
      },
    );

    // Compatible system (single value)
    if (filters.compatibleSystem) {
      chips.push({
        type: "compatibleSystem",
        value: filters.compatibleSystem,
        label: filters.compatibleSystemName || filters.compatibleSystem,
      });
    }

    // Add single-value filters
    ["category", "subCategory"].forEach((type) => {
      if (filters[type]) {
        chips.push({
          type,
          value: filters[type],
          label: formatFilterValue(type, filters[type]),
        });
      }
    });

    // Add price range filter
    if (filters.minPrice || filters.maxPrice) {
      chips.push({
        type: "priceRange",
        value: { min: filters.minPrice, max: filters.maxPrice },
        label: t("shop.chipPriceLabel", {
          min: filters.minPrice ? `${currencySymbol}${filters.minPrice}` : `${currencySymbol}0`,
          max: filters.maxPrice ? `${currencySymbol}${filters.maxPrice}` : t("shop.chipPriceAny"),
        }),
      });
    }

    return chips;
  };

  const activeChips = getActiveFilterChips();

  if (activeChips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 my-3">
      {activeChips.map((chip, index) => (
        <div
          key={`${chip.type}-${chip.value}-${index}`}
          className="inline-flex items-center bg-green-50 text-green-800 rounded-full px-3 py-1 text-sm"
        >
          <span className="mr-1 font-medium">
            {getFilterTypeLabel(chip.type)}:
          </span>
          <span>{chip.label}</span>
          <button
            onClick={() => onRemoveFilter(chip.type, chip.value)}
            className="ml-1 text-green-600 hover:text-green-800"
          >
            <FaTimes size={12} />
          </button>
        </div>
      ))}

      {activeChips.length > 0 && (
        <button
          onClick={() => onRemoveFilter("all")}
          className="text-blue-600 hover:text-blue-800 text-xs underline"
        >
          {t("shop.clearAll")}
        </button>
      )}
    </div>
  );
};

export default ActiveFilterChips;
