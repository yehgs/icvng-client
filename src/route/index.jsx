//client/src/route/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import SearchPage from '../pages/SearchPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import OtpVerification from '../pages/OtpVerification';
import ResetPassword from '../pages/ResetPassword';
import UserMenuMobile from '../pages/UserMenuMobile';
import Dashboard from '../layouts/Dashboard';
import Profile from '../pages/Profile';
import MyOrders from '../pages/MyOrders';
import Address from '../pages/Address';
import CategoryPage from '../pages/CategoryPage';
import BrandPage from '../pages/BrandPage';
import SliderPage from '../pages/SliderPage';
import CoffeeRoastAreas from '../components/CoffeeRoastAreas';
import SubCategoryPage from '../pages/SubCategoryPage';
import UploadProduct from '../pages/UploadProduct';
import ProductAdmin from '../pages/ProductAdmin';
import AdminPermision from '../layouts/AdminPermision';
import ProductDisplayPage from '../pages/ProductDisplayPage';
import CartMobile from '../pages/CartMobile';
import CheckoutPage from '../pages/CheckoutPage';
import Success from '../pages/Success';
import Cancel from '../pages/Cancel';
import Attributes from '../components/Attributes';
import Tags from '../components/Tags';
import WishlistPage from '../pages/WishListPage';
import ShopPage from '../pages/EnhancedShopPage';
import CategoryDetailPage from '../components/CategoryDetailPage';
import NotFoundPage from '../components/NotFoundPage';
import ProductRequestPage from '../pages/ProductRequestPage';
import UserProductRequests from '../pages/UserProductRequests.jsx';
import AdminRatingsPage from '../pages/AdminRatingsPage.jsx';
import BannerAdmin from '../pages/BannerAdmin.jsx';
import WishListPage from '../pages/WishListPage.jsx';
import ComparePage from '../pages/ComparePage.jsx';
import BankTransferInstructionsPage from '../pages/BankTransferInstructionPage.jsx';
import TrackingPage from '../pages/TrackingPage';
import SingleBlogPost from '../pages/SingleBlogPost.jsx';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import PaymentCancelPage from '../pages/PaymentCancelPage';
import PaystackCallbackPage from '../pages/PaystackCallbackPage';

// New Pages
import PartnerWithUs from '../pages/PartnerWithUs';
import AboutUs from '../pages/AboutUs.jsx';
import OurStory from '../pages/Ourstory.jsx';
import ReturnPolicy from '../pages/ReturnPolicy';
import ContactUs from '../pages/Contactus.jsx';
import FAQ from '../pages/Faq.jsx';
import ShippingPolicy from '../pages/ShippingPolicy';
import TermsConditions from '../pages/TermsConditions';
import PrivacyPolicy from '../pages/Privacypolicy.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'wishlist',
        element: <WishlistPage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'verification-otp',
        element: <OtpVerification />,
      },
      {
        path: '/bank-transfer-instructions',
        element: <BankTransferInstructionsPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: 'user',
        element: <UserMenuMobile />,
      },
      {
        path: 'shop',
        element: <ShopPage />,
      },
      // Company & Information Pages
      {
        path: 'partner-with-us',
        element: <PartnerWithUs />,
      },
      {
        path: 'about-us',
        element: <AboutUs />,
      },
      {
        path: 'our-story',
        element: <OurStory />,
      },
      {
        path: 'contact-us',
        element: <ContactUs />,
      },
      {
        path: 'faq',
        element: <FAQ />,
      },
      // Policy Pages
      {
        path: 'return-policy',
        element: <ReturnPolicy />,
      },
      {
        path: 'shipping-policy',
        element: <ShippingPolicy />,
      },
      {
        path: 'terms-conditions',
        element: <TermsConditions />,
      },
      {
        path: 'privacy-policy',
        element: <PrivacyPolicy />,
      },
      // Category & Product Routes
      { path: '/category/:categorySlug', element: <CategoryDetailPage /> },
      {
        path: '/category/:categorySlug/subcategory/:subcategorySlug',
        element: <CategoryDetailPage />,
      },
      {
        path: '/category/:categorySlug/brand/:brandSlug',
        element: <CategoryDetailPage />,
      },
      {
        path: '/category/:categorySlug/subcategory/:subcategorySlug/brand/:brandSlug',
        element: <CategoryDetailPage />,
      },
      { path: '/brand/:brandSlug', element: <CategoryDetailPage /> },
      {
        path: 'product/:product',
        element: <ProductDisplayPage />,
      },
      {
        path: 'blog/:slug',
        element: <SingleBlogPost />,
      },
      // Cart & Checkout
      {
        path: 'cart',
        element: <CartMobile />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'success',
        element: <Success />,
      },
      {
        path: 'cancel',
        element: <Cancel />,
      },
      {
        path: 'wishlist',
        element: <WishListPage />,
      },
      {
        path: 'compare',
        element: <ComparePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
      // Payment Routes
      {
        path: '/success',
        element: <PaymentSuccessPage />,
      },
      {
        path: '/cancel',
        element: <PaymentCancelPage />,
      },
      {
        path: '/order-success',
        element: <PaymentSuccessPage />,
      },
      {
        path: '/payment/paystack/callback',
        element: <PaystackCallbackPage />,
      },
      // Dashboard Routes
      {
        path: 'dashboard',
        element: <Dashboard />,
        children: [
          {
            path: 'profile',
            element: <Profile />,
          },
          {
            path: 'myorders',
            element: <MyOrders />,
          },
          {
            path: 'address',
            element: <Address />,
          },
          {
            path: 'track',
            element: <TrackingPage />,
          },
          {
            path: 'track/:trackingNumber',
            element: <TrackingPage />,
          },
          {
            path: 'banners',
            element: <BannerAdmin />,
          },
          {
            path: 'user-request',
            element: <UserProductRequests />,
          },
          {
            path: 'category',
            element: (
              <AdminPermision>
                <CategoryPage />
              </AdminPermision>
            ),
          },
          {
            path: 'ratings',
            element: (
              <AdminPermision>
                <AdminRatingsPage />
              </AdminPermision>
            ),
          },
          {
            path: 'product-request',
            element: (
              <AdminPermision>
                <ProductRequestPage />
              </AdminPermision>
            ),
          },
          {
            path: 'tags',
            element: (
              <AdminPermision>
                <Tags />
              </AdminPermision>
            ),
          },
          {
            path: 'roast-areas',
            element: (
              <AdminPermision>
                <CoffeeRoastAreas />
              </AdminPermision>
            ),
          },
          {
            path: 'attributes',
            element: (
              <AdminPermision>
                <Attributes />
              </AdminPermision>
            ),
          },
          {
            path: 'brand',
            element: (
              <AdminPermision>
                <BrandPage />
              </AdminPermision>
            ),
          },
          {
            path: 'slider',
            element: (
              <AdminPermision>
                <SliderPage />
              </AdminPermision>
            ),
          },
          {
            path: 'subcategory',
            element: (
              <AdminPermision>
                <SubCategoryPage />
              </AdminPermision>
            ),
          },
          {
            path: 'upload-product',
            element: (
              <AdminPermision>
                <UploadProduct />
              </AdminPermision>
            ),
          },
          {
            path: 'product',
            element: (
              <AdminPermision>
                <ProductAdmin />
              </AdminPermision>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;