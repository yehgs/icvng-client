//client/src/route/index.jsx
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "../App";
import Home from "../pages/Home";
const SearchPage = lazy(() => import("../pages/SearchPage"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const OtpVerification = lazy(() => import("../pages/OtpVerification"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const UserMenuMobile = lazy(() => import("../pages/UserMenuMobile"));
import Dashboard from "../layouts/Dashboard";
const Profile = lazy(() => import("../pages/Profile"));
const MyOrders = lazy(() => import("../pages/MyOrders"));
const Address = lazy(() => import("../pages/Address"));
const CategoryPage = lazy(() => import("../pages/CategoryPage"));
const BrandPage = lazy(() => import("../pages/BrandPage"));
const SliderPage = lazy(() => import("../pages/SliderPage"));
const CoffeeRoastAreas = lazy(() => import("../components/CoffeeRoastAreas"));
const SubCategoryPage = lazy(() => import("../pages/SubCategoryPage"));
const UploadProduct = lazy(() => import("../pages/UploadProduct"));
const ProductAdmin = lazy(() => import("../pages/ProductAdmin"));
import AdminPermision from "../layouts/AdminPermision";
const ProductDisplayPage = lazy(() => import("../pages/ProductDisplayPage"));
const CartMobile = lazy(() => import("../pages/CartMobile"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const Success = lazy(() => import("../pages/Success"));
const Cancel = lazy(() => import("../pages/Cancel"));
// Phase 4: Google OAuth callback page
const GoogleAuthSuccess = lazy(() => import("../pages/GoogleAuthSuccess"));
const Attributes = lazy(() => import("../components/Attributes"));
const Tags = lazy(() => import("../components/Tags"));
const WishlistPage = lazy(() => import("../pages/WishListPage"));
const ShopPage = lazy(() => import("../pages/EnhancedShopPage"));
const CategoryDetailPage = lazy(() => import("../components/CategoryDetailPage"));
const NotFoundPage = lazy(() => import("../components/NotFoundPage"));
const ProductRequestPage = lazy(() => import("../pages/ProductRequestPage"));
const UserProductRequests = lazy(() => import("../pages/UserProductRequests.jsx"));
const AdminRatingsPage = lazy(() => import("../pages/AdminRatingsPage.jsx"));
const BannerAdmin = lazy(() => import("../pages/BannerAdmin.jsx"));
const WishListPage = lazy(() => import("../pages/WishListPage.jsx"));
const ComparePage = lazy(() => import("../pages/ComparePage.jsx"));
const BankTransferInstructionsPage = lazy(() => import("../pages/BankTransferInstructionPage.jsx"));
const TrackingPage = lazy(() => import("../pages/TrackingPage"));
const BlogPage = lazy(() => import("../pages/BlogPage.jsx"));
const SingleBlogPost = lazy(() => import("../pages/SingleBlogPost.jsx"));
const PaymentSuccessPage = lazy(() => import("../pages/PaymentSuccessPage"));
const PaymentCancelPage = lazy(() => import("../pages/PaymentCancelPage"));
const PaystackCallbackPage = lazy(() => import("../pages/PaystackCallbackPage"));

// New Pages
const PartnerWithUs = lazy(() => import("../pages/PartnerWithUs"));
const AboutUs = lazy(() => import("../pages/AboutUs.jsx"));
const OurStory = lazy(() => import("../pages/Ourstory.jsx"));
const ReturnPolicy = lazy(() => import("../pages/ReturnPolicy"));
const ContactUs = lazy(() => import("../pages/Contactus.jsx"));
const FAQ = lazy(() => import("../pages/Faq.jsx"));
const ShippingPolicy = lazy(() => import("../pages/ShippingPolicy"));
const TermsConditions = lazy(() => import("../pages/TermsConditions"));
const PrivacyPolicy = lazy(() => import("../pages/Privacypolicy.jsx"));
const AdminBlogManagement = lazy(() => import("../pages/admin/AdminBlogManagement"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "wishlist",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><WishlistPage  /></Suspense>,
      },
      {
        path: "search",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><SearchPage  /></Suspense>,
      },
      {
        path: "login",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><Login  /></Suspense>,
      },
      {
        path: "register",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><Register  /></Suspense>,
      },
      {
        // Phase 4: Google OAuth callback landing page
        path: "auth/google/success",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><GoogleAuthSuccess /></Suspense>,
      },
      {
        path: "forgot-password",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><ForgotPassword  /></Suspense>,
      },
      {
        path: "verification-otp",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><OtpVerification  /></Suspense>,
      },
      {
        path: "/bank-transfer-instructions",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><BankTransferInstructionsPage  /></Suspense>,
      },
      {
        path: "reset-password",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><ResetPassword  /></Suspense>,
      },
      {
        path: "user",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><UserMenuMobile  /></Suspense>,
      },
      {
        path: "shop",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><ShopPage  /></Suspense>,
      },
      // Company & Information Pages
      {
        path: "partner-with-us",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><PartnerWithUs  /></Suspense>,
      },
      {
        path: "about-us",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><AboutUs  /></Suspense>,
      },
      {
        path: "our-story",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><OurStory  /></Suspense>,
      },
      {
        path: "contact-us",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><ContactUs  /></Suspense>,
      },
      {
        path: "faq",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><FAQ  /></Suspense>,
      },
      // Policy Pages
      {
        path: "return-policy",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><ReturnPolicy  /></Suspense>,
      },
      {
        path: "shipping-policy",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><ShippingPolicy  /></Suspense>,
      },
      {
        path: "terms-conditions",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><TermsConditions  /></Suspense>,
      },
      {
        path: "privacy-policy",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><PrivacyPolicy  /></Suspense>,
      },
      // Category & Product Routes
      { path: "/category/:categorySlug", element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><CategoryDetailPage  /></Suspense> },
      {
        path: "/category/:categorySlug/subcategory/:subcategorySlug",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><CategoryDetailPage  /></Suspense>,
      },
      {
        path: "/category/:categorySlug/brand/:brandSlug",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><CategoryDetailPage  /></Suspense>,
      },
      {
        path: "/category/:categorySlug/subcategory/:subcategorySlug/brand/:brandSlug",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><CategoryDetailPage  /></Suspense>,
      },
      { path: "/brand/:brandSlug", element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><CategoryDetailPage  /></Suspense> },
      {
        path: "product/:product",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><ProductDisplayPage  /></Suspense>,
      },
      {
        path: "blogs",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><BlogPage  /></Suspense>,
      },
      {
        path: "blog/:slug",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><SingleBlogPost  /></Suspense>,
      },
      // Cart & Checkout
      {
        path: "cart",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><CartMobile  /></Suspense>,
      },
      {
        path: "checkout",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><CheckoutPage  /></Suspense>,
      },
      {
        path: "success",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><Success  /></Suspense>,
      },
      {
        path: "cancel",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><Cancel  /></Suspense>,
      },
      {
        path: "wishlist",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><WishListPage  /></Suspense>,
      },
      {
        path: "compare",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><ComparePage  /></Suspense>,
      },
      {
        path: "*",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><NotFoundPage  /></Suspense>,
      },
      // Payment Routes
      {
        path: "/success",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><PaymentSuccessPage  /></Suspense>,
      },
      {
        path: "/cancel",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><PaymentCancelPage  /></Suspense>,
      },
      {
        path: "/order-success",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><PaymentSuccessPage  /></Suspense>,
      },
      {
        path: "/payment/paystack/callback",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><PaystackCallbackPage  /></Suspense>,
      },
      // Dashboard Routes
      {
        path: "dashboard",
        element: <Dashboard />,
        children: [
          {
            path: "profile",
            element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><Profile  /></Suspense>,
          },
          {
            path: "myorders",
            element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><MyOrders  /></Suspense>,
          },
          {
            path: "address",
            element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><Address  /></Suspense>,
          },
          {
            path: "track",
            element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><TrackingPage  /></Suspense>,
          },
          {
            path: "track/:trackingNumber",
            element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><TrackingPage  /></Suspense>,
          },
          {
            path: "banners",
            element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><BannerAdmin  /></Suspense>,
          },
          {
            path: "user-request",
            element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><UserProductRequests  /></Suspense>,
          },
          {
            path: "category",
            element: (
              <AdminPermision>
                <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><CategoryPage  /></Suspense>
              </AdminPermision>
            ),
          },
          {
            path: "ratings",
            element: (
              <AdminPermision>
                <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><AdminRatingsPage  /></Suspense>
              </AdminPermision>
            ),
          },
          {
            path: "product-request",
            element: (
              <AdminPermision>
                <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><ProductRequestPage  /></Suspense>
              </AdminPermision>
            ),
          },
          {
            path: "blog-management",
            element: (
              <AdminPermision>
                <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><AdminBlogManagement  /></Suspense>
              </AdminPermision>
            ),
          },
          {
            path: "tags",
            element: (
              <AdminPermision>
                <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><Tags  /></Suspense>
              </AdminPermision>
            ),
          },
          {
            path: "roast-areas",
            element: (
              <AdminPermision>
                <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><CoffeeRoastAreas  /></Suspense>
              </AdminPermision>
            ),
          },
          {
            path: "attributes",
            element: (
              <AdminPermision>
                <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><Attributes  /></Suspense>
              </AdminPermision>
            ),
          },
          {
            path: "brand",
            element: (
              <AdminPermision>
                <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><BrandPage  /></Suspense>
              </AdminPermision>
            ),
          },
          {
            path: "slider",
            element: (
              <AdminPermision>
                <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><SliderPage  /></Suspense>
              </AdminPermision>
            ),
          },
          {
            path: "subcategory",
            element: (
              <AdminPermision>
                <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><SubCategoryPage  /></Suspense>
              </AdminPermision>
            ),
          },
          {
            path: "upload-product",
            element: (
              <AdminPermision>
                <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><UploadProduct  /></Suspense>
              </AdminPermision>
            ),
          },
          {
            path: "product",
            element: (
              <AdminPermision>
                <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><ProductAdmin  /></Suspense>
              </AdminPermision>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
