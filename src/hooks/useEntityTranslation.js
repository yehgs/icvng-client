/**
 * hooks/useEntityTranslation.js
 *
 * Fetches a server-side translation for a given entity and merges it
 * into the source document.  Caches results in memory per (type+id+lang).
 *
 * Usage:
 *   const product = useEntityTranslation('product', product._id, rawProduct);
 *   // product.name is now in the active language if a translation exists
 *
 * When language === "en" or translation not found, returns the original doc unchanged.
 */

import { useState, useEffect, useRef } from "react";
import Axios from "../utils/Axios.js";
import { useCountry } from "../context/CountryContext.jsx";

// Module-level in-memory cache: "type:id:lang" → fields object
const CACHE = new Map();

export function useEntityTranslation(entityType, entityId, sourceDoc) {
  const { language } = useCountry();
  const [translated, setTranslated] = useState(sourceDoc);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    // English is the source — no fetch needed
    if (!entityId || !sourceDoc || language === "en") {
      setTranslated(sourceDoc);
      return;
    }

    const cacheKey = `${entityType}:${entityId}:${language}`;
    const cached = CACHE.get(cacheKey);

    if (cached) {
      setTranslated(applyFields(sourceDoc, cached));
      return;
    }

    // Fetch from server
    Axios({
      url: `/api/translations/${entityType}/${entityId}/${language}`,
      method: "get",
    })
      .then((res) => {
        if (!mounted.current) return;
        const fields = res.data?.data || {};
        CACHE.set(cacheKey, fields);
        setTranslated(applyFields(sourceDoc, fields));
      })
      .catch(() => {
        if (mounted.current) setTranslated(sourceDoc);
      });
  }, [entityType, entityId, language, sourceDoc]);

  return translated;
}

/**
 * Apply translation fields onto a document (shallow copy, dot-notation support).
 */
function applyFields(doc, fields) {
  if (!fields || Object.keys(fields).length === 0) return doc;
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

export default useEntityTranslation;
