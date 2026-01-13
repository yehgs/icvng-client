// client/src/components/ShippingMethodSelector.jsx
import React, { useState, useEffect } from "react";
import {
  Truck,
  Clock,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { useCurrency } from "../provider/GlobalProvider";
import { SHIPPING_METHOD_PRIORITY } from "../config/shippingConfig";

const ShippingMethodSelector = ({
  selectedAddress,
  cartItems,
  orderValue,
  onMethodSelect,
  selectedMethodId,
  loading = false,
  methods = [],
  error = "",
}) => {
  const { formatPrice } = useCurrency();
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    if (methods.length > 0 && !selectedMethodId) {
      let autoSelected = null;

      console.log("=== 🔍 AUTO-SELECTING SHIPPING METHOD ===");
      console.log("📋 Configuration:", SHIPPING_METHOD_PRIORITY);
      console.log(
        "📦 Available methods:",
        methods.map((m) => ({
          name: m.name,
          type: m.type,
          cost: m.cost,
          _id: m._id,
        }))
      );

      // STRICT MODE: Only select the preferred type, ignore everything else
      if (SHIPPING_METHOD_PRIORITY.strictMode) {
        console.log(
          `🎯 STRICT MODE ACTIVE: Looking for type "${SHIPPING_METHOD_PRIORITY.defaultType}"`
        );

        autoSelected = methods.find(
          (m) => m.type === SHIPPING_METHOD_PRIORITY.defaultType
        );

        if (autoSelected) {
          console.log(
            `✅ STRICT: Selected ${autoSelected.name} (${autoSelected.type}) - Cost: ${autoSelected.cost}`
          );
        } else {
          console.warn(
            `⚠️ STRICT MODE: Preferred type "${SHIPPING_METHOD_PRIORITY.defaultType}" not found`
          );
          console.log(
            "📌 Available types:",
            methods.map((m) => m.type)
          );
          console.log("⚠️ Falling back to first available method");
          autoSelected = methods[0];
          console.log(
            `✅ Fallback: Selected ${autoSelected.name} (${autoSelected.type})`
          );
        }
      } else {
        // NORMAL MODE: Priority-based selection
        console.log("📊 NORMAL MODE: Using priority-based selection");

        // Priority 1: Select free shipping FIRST (if enabled in config)
        if (SHIPPING_METHOD_PRIORITY.selectFreeIfAvailable) {
          console.log("🔍 Priority 1: Checking for free shipping...");
          const freeMethod = methods.find((m) => m.cost === 0);

          if (freeMethod) {
            autoSelected = freeMethod;
            console.log(
              `✅ Priority 1 HIT: Selected free shipping - ${autoSelected.name} (${autoSelected.type})`
            );
          } else {
            console.log("❌ Priority 1 MISS: No free shipping found");
          }
        } else {
          console.log("⏭️ Priority 1 SKIPPED: selectFreeIfAvailable = false");
        }

        // Priority 2: Select preferred type (if not already selected)
        if (!autoSelected && SHIPPING_METHOD_PRIORITY.defaultType) {
          console.log(
            `🔍 Priority 2: Looking for preferred type "${SHIPPING_METHOD_PRIORITY.defaultType}"...`
          );

          const preferredMethod = methods.find(
            (m) => m.type === SHIPPING_METHOD_PRIORITY.defaultType
          );

          if (preferredMethod) {
            autoSelected = preferredMethod;
            console.log(
              `✅ Priority 2 HIT: Selected preferred type - ${autoSelected.name} (${autoSelected.type}) - Cost: ${autoSelected.cost}`
            );
          } else {
            console.warn(
              `❌ Priority 2 MISS: Preferred type "${SHIPPING_METHOD_PRIORITY.defaultType}" not found`
            );
            console.log(
              "📌 Available types:",
              methods.map((m) => m.type)
            );
          }
        } else if (!autoSelected) {
          console.log("⏭️ Priority 2 SKIPPED: No defaultType configured");
        }

        // Priority 3: Free shipping as fallback (if not already checked)
        if (!autoSelected && !SHIPPING_METHOD_PRIORITY.selectFreeIfAvailable) {
          console.log(
            "🔍 Priority 3: Checking for free shipping as fallback..."
          );
          const freeMethod = methods.find((m) => m.cost === 0);

          if (freeMethod) {
            autoSelected = freeMethod;
            console.log(
              `✅ Priority 3 HIT: Selected free shipping fallback - ${autoSelected.name} (${autoSelected.type})`
            );
          } else {
            console.log("❌ Priority 3 MISS: No free shipping available");
          }
        } else if (!autoSelected) {
          console.log(
            "⏭️ Priority 3 SKIPPED: Free shipping already checked or selected"
          );
        }

        // Priority 4: Cheapest method (if enabled in config)
        if (
          !autoSelected &&
          SHIPPING_METHOD_PRIORITY.selectCheapestAsFallback
        ) {
          console.log("🔍 Priority 4: Selecting cheapest method...");

          autoSelected = methods.reduce((prev, current) => {
            console.log(
              `   Comparing: ${prev.name} (${prev.cost}) vs ${current.name} (${current.cost})`
            );
            return prev.cost < current.cost ? prev : current;
          });

          console.log(
            `✅ Priority 4 HIT: Selected cheapest - ${autoSelected.name} (${autoSelected.type}) - Cost: ${autoSelected.cost}`
          );
        } else if (!autoSelected) {
          console.log(
            "⏭️ Priority 4 SKIPPED: selectCheapestAsFallback = false"
          );
        }

        // Last resort: Select first method
        if (!autoSelected && methods.length > 0) {
          console.warn(
            "⚠️ All priorities failed, selecting first available method"
          );
          autoSelected = methods[0];
          console.log(
            `✅ Last Resort: Selected ${autoSelected.name} (${autoSelected.type})`
          );
        }
      }

      // Final selection
      if (autoSelected) {
        console.log("=== 🎯 FINAL SELECTION ===");
        console.log(`Name: ${autoSelected.name}`);
        console.log(`Type: ${autoSelected.type}`);
        console.log(`Cost: ${autoSelected.cost}`);
        console.log(`ID: ${autoSelected._id}`);
        console.log("========================");

        setSelectedMethod(autoSelected);
        onMethodSelect(autoSelected);
      } else {
        console.error(
          "❌ CRITICAL: No shipping method could be auto-selected!"
        );
        console.error("This should never happen. Available methods:", methods);
      }
    } else if (selectedMethodId) {
      // User has already selected a method or it's pre-selected
      const selected = methods.find((m) => m._id === selectedMethodId);

      if (selected) {
        console.log("=== ✅ USING PRE-SELECTED METHOD ===");
        console.log(`Name: ${selected.name}`);
        console.log(`Type: ${selected.type}`);
        console.log(`Cost: ${selected.cost}`);
        console.log("===================================");
        setSelectedMethod(selected);
      } else {
        console.warn(
          `⚠️ Pre-selected method ID ${selectedMethodId} not found in available methods`
        );
      }
    } else if (methods.length === 0) {
      console.warn("⚠️ No shipping methods available");
    }
  }, [methods, selectedMethodId, onMethodSelect]);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    onMethodSelect(method);
  };

  const getMethodIcon = (type) => {
    const icons = {
      free: Package,
      flat_rate: Truck,
      table_shipping: Package, // ✅ FIXED: was "table_rate"
      weight_based: Package,
      zone_based: MapPin,
      pickup: MapPin,
    };
    return icons[type] || Truck;
  };

  const getMethodColor = (type) => {
    const colors = {
      free: "text-green-600 bg-green-50 border-green-200",
      flat_rate: "text-blue-600 bg-blue-50 border-blue-200",
      table_shipping: "text-indigo-600 bg-indigo-50 border-indigo-200", // ✅ FIXED
      weight_based: "text-purple-600 bg-purple-50 border-purple-200",
      zone_based: "text-orange-600 bg-orange-50 border-orange-200",
      pickup: "text-gray-600 bg-gray-50 border-gray-200",
    };
    return colors[type] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getMethodDescription = (method) => {
    const descriptions = {
      free: "Free shipping on qualifying orders",
      flat_rate: "Standard flat rate shipping",
      table_shipping: "Weight-based shipping rates", // ✅ FIXED
      weight_based: "Shipping cost based on package weight",
      zone_based: "Shipping cost varies by delivery zone",
      pickup: "Pick up your order at our location",
    };
    return (
      method.description || descriptions[method.type] || "Shipping available"
    );
  };

  const getDeliveryEstimate = (method) => {
    if (!method.estimatedDelivery) return "To be confirmed";

    const { minDays, maxDays } = method.estimatedDelivery;
    if (minDays === maxDays) {
      return `${minDays} day${minDays !== 1 ? "s" : ""}`;
    }
    return `${minDays}-${maxDays} days`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Truck className="mr-2" />
          Shipping Method
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">
            Loading shipping options...
          </span>
        </div>
      </div>
    );
  }

  if (error || methods.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Truck className="mr-2" />
          Shipping Method
        </h3>
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {error ? "Shipping Error" : "No Shipping Available"}
          </h4>
          <p className="text-gray-600 mb-4">
            {error || "No shipping methods available for your location"}
          </p>
          {selectedAddress && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>
                  {selectedAddress.city}, {selectedAddress.state},{" "}
                  {selectedAddress.country}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Truck className="mr-2 text-blue-600" />
        Shipping Method
      </h3>

      {/* Shipping Zone Info */}
      {selectedAddress && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Shipping to: {selectedAddress.city}, {selectedAddress.state}
              </p>
              <p className="text-xs text-blue-700">
                {methods.length} shipping option{methods.length > 1 ? "s" : ""}{" "}
                available
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {methods.map((method) => {
          const Icon = getMethodIcon(method.type);
          const isSelected = selectedMethod?._id === method._id;
          const isFree = method.cost === 0;
          const isRecommended =
            method.type === "free" ||
            (method.cost === 0 && method.type === "flat_rate");

          return (
            <div
              key={method._id}
              className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => handleMethodSelect(method)}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  RECOMMENDED
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="radio"
                  name="shipping-method"
                  checked={isSelected}
                  onChange={() => handleMethodSelect(method)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />

                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-base font-medium text-gray-900 mr-2">
                            {method.name}
                          </h4>
                          {isFree && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              FREE
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {getMethodDescription(method)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {isFree ? "Free" : formatPrice(method.cost)}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{getDeliveryEstimate(method)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Method Details */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Method Type Badge */}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMethodColor(
                          method.type
                        )}`}
                      >
                        {method.type.replace("_", " ").toUpperCase()}
                      </span>

                      {/* Additional Info */}
                      {method.type === "weight_based" && (
                        <span className="text-xs text-gray-500">
                          Based on package weight
                        </span>
                      )}
                      {method.type === "zone_based" && (
                        <span className="text-xs text-gray-500">
                          Zone-specific rate
                        </span>
                      )}
                    </div>

                    {/* Estimated Delivery Date */}
                    {method.estimatedDelivery && (
                      <div className="text-xs text-gray-500">
                        Est.{" "}
                        {new Date(
                          Date.now() +
                            method.estimatedDelivery.maxDays *
                              24 *
                              60 *
                              60 *
                              1000
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </div>

                  {/* Pickup Locations */}
                  {method.type === "pickup" &&
                    method.pickupLocations &&
                    method.pickupLocations.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Pickup Locations:
                        </h5>
                        <div className="space-y-2">
                          {method.pickupLocations
                            .slice(0, 2)
                            .map((location, index) => (
                              <div
                                key={index}
                                className="text-sm text-gray-600"
                              >
                                <p className="font-medium">{location.name}</p>
                                <p className="text-xs">
                                  {location.address}, {location.city},{" "}
                                  {location.state}
                                </p>
                                {location.phone && (
                                  <p className="text-xs text-blue-600">
                                    📞 {location.phone}
                                  </p>
                                )}
                              </div>
                            ))}
                          {method.pickupLocations.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{method.pickupLocations.length - 2} more location
                              {method.pickupLocations.length > 3 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Special Instructions */}
                  {isSelected && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <div className="flex items-start">
                        <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">
                            Selected Shipping Method
                          </p>
                          <p>
                            {method.type === "pickup"
                              ? "You can pick up your order at any of the listed locations during business hours."
                              : `Your order will be shipped via ${
                                  method.name
                                } and should arrive within ${getDeliveryEstimate(
                                  method
                                )}.`}
                          </p>
                          {method.type !== "pickup" && (
                            <p className="mt-1 text-xs">
                              You&apos;ll receive tracking information once your
                              order is shipped.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {selectedMethod && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Shipping method selected
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-700">{selectedMethod.name}</p>
              <p className="text-lg font-bold text-green-800">
                {selectedMethod.cost === 0
                  ? "Free"
                  : formatPrice(selectedMethod.cost)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* General Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start">
          <Info className="h-4 w-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Shipping Information</p>
            <ul className="text-xs space-y-1">
              <li>• All orders are carefully packaged for safe delivery</li>
              <li>• Tracking information will be provided once shipped</li>
              <li>
                • Delivery times may vary based on location and external factors
              </li>
              <li>• Contact support for any shipping questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingMethodSelector;
