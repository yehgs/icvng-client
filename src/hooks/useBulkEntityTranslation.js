/**
 * hooks/useBulkEntityTranslation.js
 *
 * Fetches translations for a LIST of entity IDs in a single request,
 * then merges translated fields into each source document.
 *
 * Designed for list views (product cards, blog cards, category lists) where
 * calling useEntityTranslation() per-item would cause N individual API calls.
 *
 * Uses the server's dedicated POST /translations/bulk endpoint (built
 * specifically to fix that N+1 pattern) — one request per (entityType,
 * language) per render, not one per item.
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

  // Stable key so the effect doesn't refire every render just because the
  // caller passed a new array/object reference with the same ids.
  const idsKey = (sourceDocs || []).map((d) => d?._id).filter(Boolean).join(",");

  useEffect(() => {
    setTranslated(sourceDocs);
    if (!sourceDocs?.length || language === "en") return;

    let cancelled = false;

    async function fetchAll() {
      const needFetch = [];
      const fetchedFields = {};

      for (const doc of sourceDocs) {
        if (!doc?._id) continue;
        const key = `${entityType}:${doc._id}:${language}`;
        if (CACHE.has(key)) {
          fetchedFields[doc._id] = CACHE.get(key);
        } else {
          needFetch.push(doc._id);
        }
      }

      if (needFetch.length > 0) {
        try {
          // One request for the whole list, regardless of size (server caps
          // at 500 ids per call — chunk if we ever exceed that).
          const CHUNK = 500;
          for (let i = 0; i < needFetch.length; i += CHUNK) {
            const idsChunk = needFetch.slice(i, i + CHUNK);
            const res = await Axios({
              url: `/api/translations/bulk`,
              method: "post",
              data: { entityType, entityIds: idsChunk, language },
            });
            const map = res.data?.data || {};
            for (const id of idsChunk) {
              const fields = map[id] || {};
              CACHE.set(`${entityType}:${id}:${language}`, fields);
              fetchedFields[id] = fields;
            }
          }
        } catch {
          // Non-fatal — items without fetched translations just fall back
          // to source text below.
        }
      }

      if (cancelled) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, idsKey, language]);

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
