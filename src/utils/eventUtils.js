export const updateWishlistCount = () => {
  window.dispatchEvent(new CustomEvent('wishlist-updated'));
};

export const updateCompareCount = () => {
  window.dispatchEvent(new CustomEvent('compare-updated'));
};

export const updateCartCount = () => {
  window.dispatchEvent(new CustomEvent('cart-updated'));
};

// Helper function to dispatch multiple events at once
export const updateMultipleCounts = (events = []) => {
  events.forEach((eventType) => {
    switch (eventType) {
      case 'wishlist':
        updateWishlistCount();
        break;
      case 'compare':
        updateCompareCount();
        break;
      case 'cart':
        updateCartCount();
        break;
      default:
        console.warn(`Unknown event type: ${eventType}`);
    }
  });
};

// Debounced version for high-frequency updates
export const debouncedUpdateCounts = (() => {
  let timeoutId;

  return (events = [], delay = 100) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      updateMultipleCounts(events);
    }, delay);
  };
})();
