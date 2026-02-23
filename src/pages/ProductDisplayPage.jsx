// icvng-client/src/pages/ProductListPage.jsx
import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { Link, useParams } from "react-router-dom";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import CardProduct from "../components/CardProduct";
import { useSelector } from "react-redux";
import { valideURLConvert } from "../utils/valideURLConvert";
import { isFiveWeekDeliveryCategory } from "../config/deliveryCategories";

const ProductListPage = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(1);
  const [categoryInfo, setCategoryInfo] = useState(null); // populated category object

  const params = useParams();
  const AllSubCategory = useSelector((state) => state.product.allSubCategory);
  const [DisplaySubCategory, setDisplaySubCategory] = useState([]);

  // ── Parse IDs from URL params ─────────────────────────────────────────────
  const categoryId = params.category.split("-").slice(-1)[0];
  const subCategoryId = params.subCategory.split("-").slice(-1)[0];

  const subCategoryParts = params?.subCategory?.split("-");
  const subCategoryName = subCategoryParts
    ?.slice(0, subCategoryParts.length - 1)
    ?.join(" ");

  // ── Determine delivery pricing mode for the current category page ─────────
  // This drives the column header / info banner so users know what to expect
  // before they even look at individual cards.
  // CardProduct uses the same isFiveWeekDeliveryCategory() on each product's
  // own populated category, so they always stay in sync.
  const showFiveWeekDelivery = isFiveWeekDeliveryCategory(categoryInfo);

  // ─────────────────────────────────────────────────────────────────────────

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProductByCategoryAndSubCategory,
        data: {
          categoryId,
          subCategoryId,
          page,
          limit: 8,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        if (page === 1) {
          setData(responseData.data);
        } else {
          setData((prev) => [...prev, ...responseData.data]);
        }
        setTotalPage(responseData.totalPage || 1);

        // Grab populated category object from first product so we can
        // derive the delivery pricing mode for the page header.
        if (responseData.data?.length > 0 && responseData.data[0].category) {
          setCategoryInfo(responseData.data[0].category);
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when URL params change; reset page to 1
  useEffect(() => {
    setPage(1);
    setData([]);
    setCategoryInfo(null);
  }, [params.category, params.subCategory]);

  useEffect(() => {
    fetchProductData();
  }, [page, params.category, params.subCategory]);

  // Filter sidebar subcategories to those belonging to this category
  useEffect(() => {
    const sub = AllSubCategory.filter((s) =>
      s.category.some((el) => el._id === categoryId),
    );
    setDisplaySubCategory(sub);
  }, [params, AllSubCategory, categoryId]);

  // Load more on scroll (infinite scroll trigger)
  const handleLoadMore = () => {
    if (page < totalPage) setPage((prev) => prev + 1);
  };

  return (
    <section className="sticky top-24 lg:top-20">
      <div className="container sticky top-24 mx-auto grid grid-cols-[90px,1fr] md:grid-cols-[200px,1fr] lg:grid-cols-[280px,1fr]">
        {/* ── Subcategory Sidebar ── */}
        <div className="min-h-[88vh] max-h-[88vh] overflow-y-scroll grid gap-1 shadow-md scrollbarCustom bg-white py-2">
          {DisplaySubCategory.map((s) => {
            const link = `/${valideURLConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/${valideURLConvert(s.name)}-${s._id}`;
            return (
              <Link
                key={s._id}
                to={link}
                className={`w-full p-2 lg:flex items-center lg:w-full lg:h-16 box-border lg:gap-4 border-b hover:bg-green-100 cursor-pointer ${
                  subCategoryId === s._id ? "bg-green-100" : ""
                }`}
              >
                <div className="w-fit max-w-28 mx-auto lg:mx-0 bg-white rounded box-border">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-14 lg:h-14 lg:w-12 h-full object-scale-down"
                  />
                </div>
                <p className="-mt-6 lg:mt-0 text-xs text-center lg:text-left lg:text-base">
                  {s.name}
                </p>
              </Link>
            );
          })}
        </div>

        {/* ── Product Grid ── */}
        <div className="sticky top-20">
          {/* Header bar */}
          <div className="bg-white shadow-md p-4 z-10 flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold capitalize">{subCategoryName}</h3>

            {/* Delivery mode badge — tells the user what delivery option
                applies to this category before they read individual cards */}
            {categoryInfo && (
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 ${
                  showFiveWeekDelivery
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-orange-50 text-orange-700 border border-orange-200"
                }`}
              >
                {showFiveWeekDelivery ? (
                  <>
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Delivery: up to 5 weeks
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Delivery: up to 3 weeks
                  </>
                )}
              </span>
            )}
          </div>

          <div>
            <div className="min-h-[80vh] max-h-[80vh] overflow-y-auto relative">
              {/* Empty state */}
              {!loading && data.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <svg
                    className="w-16 h-16 mb-4 opacity-40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-sm">No products found in this category.</p>
                </div>
              )}

              {/* Product cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 p-4 gap-4">
                {data.map((p, index) => (
                  <CardProduct
                    data={p}
                    key={p._id + "productSubCategory" + index}
                  />
                ))}
              </div>

              {/* Load more button */}
              {!loading && page < totalPage && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-md transition"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>

            {loading && <Loading />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductListPage;
