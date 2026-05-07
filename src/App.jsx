import { Outlet, useLocation } from "react-router-dom";
import "./App.css";
import HeaderTest from "./components/HeaderTest";
import Footer from "./components/Footer";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import fetchUserDetails from "./utils/fetchUserDetails";
import { setUserDetails } from "./store/userSlice";
import {
  setAllCategory,
  setAllSubCategory,
  setLoadingCategory,
  setAllBrands,
  setAllTags,
  setAllAttributes,
  setCategoryStructure,
  setLoadingCategoryStructure,
  setCoffeeRoastAreas,
} from "./store/productSlice";
import { useDispatch } from "react-redux";
import Axios from "./utils/Axios";
import SummaryApi from "./common/SummaryApi";
import { handleAddItemCart } from "./store/cartProduct";
import GlobalProvider from "./provider/GlobalProvider";
import { FaCartShopping } from "react-icons/fa6";
import CartMobileLink from "./components/CartMobile";

// ─── Cache helpers (module-level so they're always defined) ──────────────────
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const getCached = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL_MS) return data;
    localStorage.removeItem(key);
    return null;
  } catch { return null; }
};

const setCache = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
};
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  const fetchUser = async () => {
    try {
      const userData = await fetchUserDetails();
      if (userData && userData.data) {
        dispatch(setUserDetails(userData.data));
      }
    } catch (error) {
      console.log("User not authenticated or session expired");
      // Don't show error toast for unauthenticated users
      // This is normal for guest users
    }
  };

  const fetchCategory = async () => {
    const cached = getCached("icvng_categories");
    if (cached && cached.length > 0) {
      dispatch(setAllCategory(cached));
      Axios({ ...SummaryApi.getCategory }).then((r) => {
        if (r.data.success) {
          const sorted = r.data.data.sort((a, b) => a.name.localeCompare(b.name));
          dispatch(setAllCategory(sorted));
          setCache("icvng_categories", sorted);
        }
      }).catch(() => {});
      return;
    }
    try {
      dispatch(setLoadingCategory(true));
      const response = await Axios({ ...SummaryApi.getCategory });
      const { data: responseData } = response;
      if (responseData.success) {
        const sorted = responseData.data.sort((a, b) => a.name.localeCompare(b.name));
        dispatch(setAllCategory(sorted));
        setCache("icvng_categories", sorted);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      dispatch(setLoadingCategory(false));
    }
  };

  const fetchSubCategory = async () => {
    const cached = getCached("icvng_subCategories");
    if (cached && cached.length > 0) {
      dispatch(setAllSubCategory(cached));
      Axios({ ...SummaryApi.getSubCategory }).then((r) => {
        if (r.data.success) {
          const sorted = r.data.data.sort((a, b) => a.name.localeCompare(b.name));
          dispatch(setAllSubCategory(sorted));
          setCache("icvng_subCategories", sorted);
        }
      }).catch(() => {});
      return;
    }
    try {
      const response = await Axios({ ...SummaryApi.getSubCategory });
      const { data: responseData } = response;
      if (responseData.success) {
        const sorted = responseData.data.sort((a, b) => a.name.localeCompare(b.name));
        dispatch(setAllSubCategory(sorted));
        setCache("icvng_subCategories", sorted);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchBrands = async () => {
    const cached = getCached("icvng_brands");
    if (cached && cached.length > 0) {
      dispatch(setAllBrands(cached));
      Axios({ ...SummaryApi.getBrand }).then((r) => {
        if (r.data.success) {
          const sorted = r.data.data.sort((a, b) => a.name.localeCompare(b.name));
          dispatch(setAllBrands(sorted));
          setCache("icvng_brands", sorted);
        }
      }).catch(() => {});
      return;
    }
    try {
      const response = await Axios({ ...SummaryApi.getBrand });
      const { data: responseData } = response;
      if (responseData.success) {
        const sorted = responseData.data.sort((a, b) => a.name.localeCompare(b.name));
        dispatch(setAllBrands(sorted));
        setCache("icvng_brands", sorted);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await Axios({ ...SummaryApi.getTags });
      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(setAllTags(responseData.data.sort((a, b) => a.name.localeCompare(b.name))));
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchAttributes = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getAttribute,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(
          setAllAttributes(
            responseData.data.sort((a, b) => a.name.localeCompare(b.name)),
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
    }
  };

  const fetchCategoryStructure = async () => {
    // Return cached data immediately — avoid loading spinner on every refresh
    const cached = getCached("icvng_categoryStructure");
    if (cached && cached.length > 0) {
      dispatch(setCategoryStructure(cached));
      // Silently background-refresh so data stays current
      Axios({ ...SummaryApi.getCategoryStructure }).then((r) => {
        if (r.data.success) {
          dispatch(setCategoryStructure(r.data.data));
          setCache("icvng_categoryStructure", r.data.data);
        }
      }).catch(() => {});
      return;
    }
    try {
      dispatch(setLoadingCategoryStructure(true));
      const response = await Axios({ ...SummaryApi.getCategoryStructure });
      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(setCategoryStructure(responseData.data));
        setCache("icvng_categoryStructure", responseData.data);
      }
    } catch (error) {
      console.error("Error fetching category structure:", error);
    } finally {
      dispatch(setLoadingCategoryStructure(false));
    }
  };

  const fetchCoffeeRoastAreas = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getCoffeeRoastAreas,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setCoffeeRoastAreas(responseData.data));
      }
    } catch (error) {
      console.error("Error fetching coffee roast structure:", error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCategory();
    fetchSubCategory();
    fetchBrands();
    fetchTags();
    fetchAttributes();
    fetchCategoryStructure();
    fetchCoffeeRoastAreas();
  }, []);

  return (
    <GlobalProvider>
      <HeaderTest />
      <main className="min-h-[78vh]">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      {location.pathname !== "/checkout" && <CartMobileLink />}
    </GlobalProvider>
  );
}

export default App;
