/**
 * hooks/useBulkEntityTranslation.js
 *
 * Fetches translations for a LIST of entity IDs in a single request batch,
 * then merges translated fields into each source document.
 *
 * Designed for list views (product cards, blog cards, category lists) where
 * calling useEntityTranslation() per-item would cause N individual API calls.
 *
 * Usage:
 *   const translatedPosts = useBulkEntityTranslation("blog", rawPosts);
 *   // translatedPosts[i].title is now in the active language
 *
 * When language === "en" → returns source array unchanged (no fetch).
 * Results are cached module-level by "type:id:lang".
 */

import { useState, useEffect } from "react";
import Axios from "../utils/Axios.js";
import { useCountry } from "../context/CountryContext.jsx";

// Module-level cache shared across all instances: "type:id:lang" → fields object
const CACHE = new Map();

export function useBulkEntityTranslation(entityType, sourceDocs) {
  const { language } = useCountry();
  const [translated, setTranslated] = useState(sourceDocs);

  useEffect(() => {
    setTranslated(sourceDocs);
    if (!sourceDocs?.length || language === "en") return;

    let cancelled = false;

    async function fetchAll() {
      // Split into: need-fetch vs already-cached
      const needFetch = [];
      const fromCache = {};

      for (const doc of sourceDocs) {
        if (!doc?._id) continue;
        const key = `${entityType}:${doc._id}:${language}`;
        if (CACHE.has(key)) {
          fromCache[doc._id] = CACHE.get(key);
        } else {
          needFetch.push(doc._id);
        }
      }

      // Fetch all uncached IDs in parallel (batched — up to 10 at a time)
      const fetchedFields = { ...fromCache };
      const BATCH = 10;
      for (let i = 0; i < needFetch.length; i += BATCH) {
        const slice = needFetch.slice(i, i + BATCH);
        await Promise.all(
          slice.map(async (id) => {
            try {
              const res = await Axios({
                url: `/api/translations/${entityType}/${id}/${language}`,
                method: "get",
              });
              const fields = res.data?.data || {};
              CACHE.set(`${entityType}:${id}:${language}`, fields);
              fetchedFields[id] = fields;
            } catch {
              fetchedFields[id] = {};
            }
          }),
        );
      }

      if (cancelled) return;

      // Merge translation fields into each source document
      const merged = sourceDocs.map((doc) => {
        if (!doc?._id) return doc;
        const fields = fetchedFields[doc._id];
        if (!fields || Object.keys(fields).length === 0) return doc;
        return applyFields(doc, fields);
      });

      setTranslated(merged);
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [entityType, sourceDocs, language]);

  return translated;
}

function applyFields(doc, fields) {
  const result = { ...doc };
  for (const [key, value] of Object.entries(fields)) {
    const parts = key.split(".");
    if (parts.length === 1) {
      result[key] = value;
    } else {
      result[parts[0]] = { ...(result[parts[0]] || {}), [parts[1]]: value };
    }
  }
  return result;
}

export default useBulkEntityTranslation;
