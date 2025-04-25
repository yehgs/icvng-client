import React from 'react';
import { FaTimes } from 'react-icons/fa';

export default function ActiveFilterChips({ filters, onRemoveFilter }) {
  // Convert filter types to readable labels
  const getFilterTypeLabel = (type) => {
    const labels = {
      roastLevel: 'Roast',
      intensity: 'Intensity',
      blend: 'Blend',
      priceRange: 'Price Range',
    };
    return labels[type] || type;
  };

  // Format filter values for display
  const formatFilterValue = (type, value) => {
    if (type === 'roastLevel') {
      const labels = {
        LIGHT: 'Light Roast',
        MEDIUM: 'Medium Roast',
        DARK: 'Dark Roast',
      };
      return labels[value] || value;
    }

    if (type === 'intensity') {
      return `Intensity ${value.split('/')[0]}`;
    }

    // For price range
    if (type === 'priceRange') {
      const { min, max } = value;
      if (min && max) return `₦${min} - ₦${max}`;
      if (min) return `Min: ₦${min}`;
      if (max) return `Max: ₦${max}`;
    }

    return value;
  };

  // Generate active filter chips
  const getActiveFilterChips = () => {
    const chips = [];

    // Add array type filters (checkboxes)
    ['roastLevel', 'intensity', 'blend'].forEach((type) => {
      if (filters[type]?.length > 0) {
        filters[type].forEach((value) => {
          chips.push({
            type,
            value,
            label: formatFilterValue(type, value),
          });
        });
      }
    });

    // Add price range filter
    if (filters.minPrice || filters.maxPrice) {
      chips.push({
        type: 'priceRange',
        value: { min: filters.minPrice, max: filters.maxPrice },
        label: `Price: ${filters.minPrice ? '₦' + filters.minPrice : '₦0'} - ${
          filters.maxPrice ? '₦' + filters.maxPrice : 'Any'
        }`,
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
          onClick={() => onRemoveFilter('all')}
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
