import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import AdminLogin from "../pages/auth/AdminLogin";
import Register from "../pages/auth/Register";
import VerifyCode from "../pages/auth/VerifyCode";

// Admin Portal Pages
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import UsersManagement from "../pages/admin/UsersManagement";
import ShopsManagement from "../pages/admin/ShopsManagement";
import CategoryManagement from "../pages/admin/CategoryManagement";
import ContentModeration from "../pages/admin/ContentModeration";
import CampaignManagement from "../pages/admin/CampaignManagement";
import DisputeManagement from "../pages/admin/DisputeManagement";
import TicketManagement from "../pages/admin/TicketManagement";
import PlatformFinance from "../pages/admin/PlatformFinance";
import PlatformShipping from "../pages/admin/PlatformShipping";
import RolesManagement from "../pages/admin/RolesManagement";
import ProductManagement from "../pages/admin/ProductManagement";
import OrderManagement from "../pages/admin/OrderManagement";

// Seller Portal Pages
import SellerLayout from "../layouts/SellerLayout";
import SellerGateway from "../pages/seller/SellerGateway";
import SellerLogin from "../pages/auth/SellerLogin";
import SellerRegister from "../pages/seller/SellerRegister";
import SellerDashboard from "../pages/seller/SellerDashboard";
import SellerProducts from "../pages/seller/SellerProducts";
import SellerOrders from "../pages/seller/SellerOrders";
import SellerShipping from "../pages/seller/SellerShipping";
import SellerMarketing from "../pages/seller/SellerMarketing";
import SellerFinance from "../pages/seller/SellerFinance";
import SellerCustomerCare from "../pages/seller/SellerCustomerCare";
import SellerStaff from "../pages/seller/SellerStaff";
import SellerAnalytics from "../pages/seller/SellerAnalytics";
import SellerSettings from "../pages/seller/SellerSettings";

// Account Pages
import AccountLayout from "../pages/account/AccountLayout";
import ProfilePage from "../pages/account/ProfilePage";
import ChangePasswordPage from "../pages/account/ChangePasswordPage";
import AccountNotificationsPage from "../pages/account/AccountNotificationsPage";
import AccountAddressPage from "../pages/account/AccountAddressPage";
import AccountOrdersPage from "../pages/account/AccountOrdersPage";
import AccountVouchersPage from "../pages/account/AccountVouchersPage";
import AccountWishlistPage from "../pages/account/AccountWishlistPage";

// Customer Storefront Pages
import CartPage from "../pages/customer/Cart";
import CheckoutPage from "../pages/customer/Checkout";
import ProductsPage from "../pages/customer/Products";
import ProductDetailPage from "../pages/customer/ProductDetail";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Storefront */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:productId" element={<ProductDetailPage />} />

      {/* Seller Portal Gateway & Auth */}
      <Route path="/seller" element={<SellerGateway />} />
      <Route path="/seller/login" element={<SellerLogin />} />
      <Route path="/seller/register" element={<SellerRegister />} />

      {/* Protected Seller Center Routes */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["STORE_OWNER", "SELLER", "ADMIN"]}
            redirectTo="/seller/login"
          />
        }
      >
        <Route element={<SellerLayout />}>
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/shipping" element={<SellerShipping />} />
          <Route path="/seller/marketing" element={<SellerMarketing />} />
          <Route path="/seller/finance" element={<SellerFinance />} />
          <Route path="/seller/customer-care" element={<SellerCustomerCare />} />
          <Route path="/seller/staff" element={<SellerStaff />} />
          <Route path="/seller/analytics" element={<SellerAnalytics />} />
          <Route path="/seller/settings" element={<SellerSettings />} />
        </Route>
      </Route>

      {/* Protected Customer Account Routes */}
      <Route element={<ProtectedRoute redirectTo="/login" />}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="address" element={<AccountAddressPage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route path="notifications" element={<AccountNotificationsPage />} />
          <Route path="orders" element={<AccountOrdersPage />} />
          <Route path="vouchers" element={<AccountVouchersPage />} />
          <Route path="wishlist" element={<AccountWishlistPage />} />
        </Route>

        <Route
          path="/profile"
          element={<Navigate to="/account/profile" replace />}
        />
        <Route
          path="/change-password"
          element={<Navigate to="/account/change-password" replace />}
        />
        <Route
          path="/my-orders"
          element={<Navigate to="/account/orders" replace />}
        />
      </Route>

      {/* Protected Platform Admin Portal Routes */}
      <Route element={<ProtectedRoute redirectTo="/admin/login" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/profile" element={<ProfilePage />} />
          <Route
            path="/admin/change-password"
            element={<ChangePasswordPage />}
          />

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "SUPER_ADMIN", "STAFF_MODERATOR", "STAFF_FINANCE"]}
                redirectTo="/admin/login"
              />
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/shops" element={<ShopsManagement />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/moderation" element={<ContentModeration />} />
            <Route path="/admin/campaigns" element={<CampaignManagement />} />
            <Route path="/admin/disputes" element={<DisputeManagement />} />
            <Route path="/admin/tickets" element={<TicketManagement />} />
            <Route path="/admin/finance" element={<PlatformFinance />} />
            <Route path="/admin/shipping" element={<PlatformShipping />} />
            <Route path="/admin/roles" element={<RolesManagement />} />
            {/* Legacy compatibility links */}
            <Route path="/admin/products" element={<ProductManagement />} />
            <Route path="/admin/orders" element={<OrderManagement />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
