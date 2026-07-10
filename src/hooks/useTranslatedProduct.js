/**
 * hooks/useTranslatedProduct.js
 *
 * A product page/card doesn't just show the product's own name/description —
 * it also shows the names of things the product REFERENCES: brand,
 * category, subCategory, tags, attributes. Each of those already has its
 * own translation support (Admin → Translations → Brands/Categories/etc,
 * or Admin → Products → Categories/Subcategories/Tags/Attributes tabs), but
 * nothing was actually applying those translations when a product renders —
 * only the product's own fields (name/description/...) were being merged.
 *
 * This hook composes useEntityTranslation/useBulkEntityTranslation for the
 * product itself plus every translatable reference it carries, and returns
 * one fully-merged object so display components don't need to wire up five
 * separate translation hooks each.
 *
 * Usage:
 *   const translated = useTranslatedProduct(rawProduct);
 *   translated.name                 // translated product name
 *   translated.brand[0].name        // translated brand name
 *   translated.category.name        // translated category name
 *   translated.subCategory.name     // translated subcategory name
 *   translated.tags[i].name         // translated tag names
 *   translated.attributes[i].name   // translated attribute names
 */

import { useEntityTranslation } from "./useEntityTranslation.js";
import { useBulkEntityTranslation } from "./useBulkEntityTranslation.js";

export function useTranslatedProduct(product) {
  // Product's own fields (name, description, shortDescription, roastOrigin, ...)
  const translatedProduct = useEntityTranslation("product", product?._id, product);

  // Referenced entities — each translated independently, then stitched back in.
  const translatedBrands = useBulkEntityTranslation("brand", product?.brand || []);
  const translatedTags = useBulkEntityTranslation("tag", product?.tags || []);
  const translatedAttributes = useBulkEntityTranslation("attribute", product?.attributes || []);

  const categoryArr = product?.category ? [product.category] : [];
  const subCategoryArr = product?.subCategory ? [product.subCategory] : [];
  const translatedCategoryArr = useBulkEntityTranslation("category", categoryArr);
  const translatedSubCategoryArr = useBulkEntityTranslation("subCategory", subCategoryArr);

  if (!product) return product;

  return {
    ...translatedProduct,
    brand: translatedBrands,
    tags: translatedTags,
    attributes: translatedAttributes,
    category: translatedCategoryArr[0] || product.category,
    subCategory: translatedSubCategoryArr[0] || product.subCategory,
  };
}

export default useTranslatedProduct;
