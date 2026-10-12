//client/src/route/index.jsx
import { createBrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import { lazyRetry } from "../utils/lazyRetry.js";
import App from "../App";
import Home from "../pages/Home";
const SearchPage = lazyRetry(() => import("../pages/SearchPage"));
const Login = lazyRetry(() => import("../pages/Login"));
const VerifyEmail = lazyRetry(() => import("../pages/VerifyEmail"));
const Register = lazyRetry(() => import("../pages/Register"));
const ForgotPassword = lazyRetry(() => import("../pages/ForgotPassword"));
const OtpVerification = lazyRetry(() => import("../pages/OtpVerification"));
const ResetPassword = lazyRetry(() => import("../pages/ResetPassword"));
const UserMenuMobile = lazyRetry(() => import("../pages/UserMenuMobile"));
import Dashboard from "../layouts/Dashboard";
const Profile = lazyRetry(() => import("../pages/Profile"));
const MyOrders = lazyRetry(() => import("../pages/MyOrders"));
const Address = lazyRetry(() => import("../pages/Address"));
const CategoryPage = lazyRetry(() => import("../pages/CategoryPage"));
const BrandPage = lazyRetry(() => import("../pages/BrandPage"));
const SliderPage = lazyRetry(() => import("../pages/SliderPage"));
const CoffeeRoastAreas = lazyRetry(() => import("../components/CoffeeRoastAreas"));
const SubCategoryPage = lazyRetry(() => import("../pages/SubCategoryPage"));
const UploadProduct = lazyRetry(() => import("../pages/UploadProduct"));
const ProductAdmin = lazyRetry(() => import("../pages/ProductAdmin"));
import AdminPermision from "../layouts/AdminPermision";
const ProductDisplayPage = lazyRetry(() => import("../pages/ProductDisplayPage"));
const CartMobile = lazyRetry(() => import("../pages/CartMobile"));
const CheckoutPage = lazyRetry(() => import("../pages/CheckoutPage"));
const Success = lazyRetry(() => import("../pages/Success"));
const Cancel = lazyRetry(() => import("../pages/Cancel"));
// Phase 4: Google OAuth callback page
const GoogleAuthSuccess = lazyRetry(() => import("../pages/GoogleAuthSuccess"));
const Attributes = lazyRetry(() => import("../components/Attributes"));
const Tags = lazyRetry(() => import("../components/Tags"));
const WishlistPage = lazyRetry(() => import("../pages/WishListPage"));
const ShopPage = lazyRetry(() => import("../pages/EnhancedShopPage"));
const CategoryDetailPage = lazyRetry(() => import("../components/CategoryDetailPage"));
const NotFoundPage = lazyRetry(() => import("../components/NotFoundPage"));
const ProductRequestPage = lazyRetry(() => import("../pages/ProductRequestPage"));
const UserProductRequests = lazyRetry(() => import("../pages/UserProductRequests.jsx"));
const AdminRatingsPage = lazyRetry(() => import("../pages/AdminRatingsPage.jsx"));
const BannerAdmin = lazyRetry(() => import("../pages/BannerAdmin.jsx"));
const WishListPage = lazyRetry(() => import("../pages/WishListPage.jsx"));
const ComparePage = lazyRetry(() => import("../pages/ComparePage.jsx"));
const BankTransferInstructionsPage = lazyRetry(() => import("../pages/BankTransferInstructionPage.jsx"));
const TrackingPage = lazyRetry(() => import("../pages/TrackingPage"));
const BlogPage = lazyRetry(() => import("../pages/BlogPage.jsx"));
const SingleBlogPost = lazyRetry(() => import("../pages/SingleBlogPost.jsx"));
const PaymentSuccessPage = lazyRetry(() => import("../pages/PaymentSuccessPage"));
const PaymentCancelPage = lazyRetry(() => import("../pages/PaymentCancelPage"));
const PaystackCallbackPage = lazyRetry(() => import("../pages/PaystackCallbackPage"));
const CinetpayCallbackPage = lazyRetry(() => import("../pages/CinetpayCallbackPage"));
const GiftCardBuyPage = lazyRetry(() => import("../pages/GiftCardBuyPage"));
const GiftCardBalancePage = lazyRetry(() => import("../pages/GiftCardBalancePage"));
const GiftCardPaystackCallbackPage = lazyRetry(() => import("../pages/GiftCardPaystackCallbackPage"));
const GiftCardCinetpayCallbackPage = lazyRetry(() => import("../pages/GiftCardCinetpayCallbackPage"));
const GiftCardStripeCallbackPage = lazyRetry(() => import("../pages/GiftCardStripeCallbackPage"));

// New Pages
const PartnerWithUs = lazyRetry(() => import("../pages/PartnerWithUs"));
const AboutUs = lazyRetry(() => import("../pages/AboutUs.jsx"));
const OurStory = lazyRetry(() => import("../pages/Ourstory.jsx"));
const ReturnPolicy = lazyRetry(() => import("../pages/ReturnPolicy"));
const ContactUs = lazyRetry(() => import("../pages/Contactus.jsx"));
const FAQ = lazyRetry(() => import("../pages/Faq.jsx"));
const ShippingPolicy = lazyRetry(() => import("../pages/ShippingPolicy"));
const TermsConditions = lazyRetry(() => import("../pages/TermsConditions"));
const PrivacyPolicy = lazyRetry(() => import("../pages/Privacypolicy.jsx"));
const AdminBlogManagement = lazyRetry(() => import("../pages/admin/AdminBlogManagement"));

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
        path: "verify-email",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><VerifyEmail  /></Suspense>,
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
      {
        path: "/payment/cinetpay/callback",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><CinetpayCallbackPage  /></Suspense>,
      },
      {
        path: "gift-cards/buy",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><GiftCardBuyPage  /></Suspense>,
      },
      {
        path: "gift-cards/balance",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><GiftCardBalancePage  /></Suspense>,
      },
      {
        path: "gift-cards/paystack/callback",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><GiftCardPaystackCallbackPage  /></Suspense>,
      },
      {
        path: "gift-cards/stripe/callback",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><GiftCardStripeCallbackPage  /></Suspense>,
      },
{
        path: "gift-cards/cinetpay/callback",
        element: <Suspense fallback={<><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-200"></div></div></>}><GiftCardCinetpayCallbackPage  /></Suspense>,
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
