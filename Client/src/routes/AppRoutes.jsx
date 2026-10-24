import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Landing } from '../pages/shared/Landing';
import { About } from '../pages/shared/About';
import { Contact } from '../pages/shared/Contact';
import { Help } from '../pages/shared/Help';
import { LoginRegister } from '../pages/shared/LoginRegister';
import { Marketplace } from '../pages/buyer/Marketplace';
import { ProductDetails } from '../pages/buyer/ProductDetails';
import { Cart } from '../pages/buyer/Cart';
import { Checkout } from '../pages/buyer/Checkout';
import { OrderConfirmation } from '../pages/buyer/OrderConfirmation';
import { OrderHistory } from '../pages/buyer/OrderHistory';
import { OrderTracking } from '../pages/buyer/OrderTracking';
import BuyerReturns from '../pages/buyer/Returns';
import ReturnDetail from '../pages/buyer/ReturnDetail';
import BuyerDisputes from '../pages/buyer/Disputes';
import DisputeDetail from '../pages/buyer/DisputeDetail';
import WriteReview from '../pages/buyer/WriteReview';
import Negotiations from '../pages/buyer/Negotiations';
import NegotiationDetail from '../pages/buyer/NegotiationDetail';
import SavedFarmers from '../pages/buyer/SavedFarmers';
import FarmerPublicProfile from '../pages/buyer/FarmerPublicProfile';
import { BuyerProfile } from '../pages/buyer/BuyerProfile';
import { SellerDashboard } from '../pages/seller/SellerDashboard';
import { MyListings } from '../pages/seller/MyListings';
import { AddProduct } from '../pages/seller/AddProduct';
import { EditProduct } from '../pages/seller/EditProduct';
import { Payouts } from '../pages/seller/Payouts';
import { Analytics } from '../pages/seller/Analytics';
import { Verification } from '../pages/seller/Verification';
import { SellerProfile } from '../pages/seller/SellerProfile';
import { SellerOrders } from '../pages/seller/SellerOrders';
import SellerReturns from '../pages/seller/SellerReturns';
import SellerReturnDetail from '../pages/seller/SellerReturnDetail';
import SellerDisputes from '../pages/seller/SellerDisputes';
import SellerDisputeDetail from '../pages/seller/SellerDisputeDetail';
import SellerNegotiations from '../pages/seller/SellerNegotiations';
import SellerNegotiationDetail from '../pages/seller/SellerNegotiationDetail';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ManageUsers } from '../pages/admin/ManageUsers';
import { UserDetail } from '../pages/admin/UserDetail';
import { ManageFarmers } from '../pages/admin/ManageFarmers';
import { Verifications } from '../pages/admin/Verifications';
import { VerificationDetail } from '../pages/admin/VerificationDetail';
import { ManageListings } from '../pages/admin/ManageListings';
import { ListingDetail } from '../pages/admin/ListingDetail';
import { FeaturedListings } from '../pages/admin/FeaturedListings';
import { ManageOrders } from '../pages/admin/ManageOrders';
import { OrderDetail as AdminOrderDetail } from '../pages/admin/OrderDetail';
import { Disputes as AdminDisputes } from '../pages/admin/Disputes';
import { DisputeDetail as AdminDisputeDetail } from '../pages/admin/DisputeDetail';
import { Payouts as AdminPayouts } from '../pages/admin/Payouts';
import { PayoutDetail as AdminPayoutDetail } from '../pages/admin/PayoutDetail';
import { Refunds as AdminRefunds } from '../pages/admin/Refunds';
import { Reports as AdminReports } from '../pages/admin/Reports';
import { Coupons as AdminCoupons } from '../pages/admin/Coupons';
import { Categories as AdminCategories } from '../pages/admin/Categories';
import { AdminSettings } from '../pages/admin/AdminSettings';
import { ActivityLogs as AdminActivityLogs } from '../pages/admin/ActivityLogs';
import { AdminProfile } from '../pages/admin/AdminProfile';
import { AdminContactMessages } from '../pages/admin/AdminContactMessages';
import { Notifications } from '../pages/shared/Notifications';
import { NotificationPreferences } from '../pages/shared/NotificationPreferences';
import { NotFound } from '../pages/shared/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/help" element={<Help />} />
      <Route path="/auth" element={<LoginRegister />} />
      <Route path="/products/:idOrSlug" element={<ProductDetails />} />
      <Route path="/farmers/:id" element={<FarmerPublicProfile />} />
      <Route path="/cart" element={<Cart />} />

      {/* Buyer Protected Routes */}
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute role="buyer">
            <Marketplace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute role="buyer">
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-confirmation"
        element={
          <ProtectedRoute role="buyer">
            <OrderConfirmation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute role="buyer">
            <OrderHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute role="buyer">
            <OrderTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/returns"
        element={
          <ProtectedRoute role="buyer">
            <BuyerReturns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/returns/:id"
        element={
          <ProtectedRoute role="buyer">
            <ReturnDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/disputes"
        element={
          <ProtectedRoute role="buyer">
            <BuyerDisputes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/disputes/:id"
        element={
          <ProtectedRoute role="buyer">
            <DisputeDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews/new"
        element={
          <ProtectedRoute role="buyer">
            <WriteReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/negotiations"
        element={
          <ProtectedRoute role="buyer">
            <Negotiations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/negotiations/:id"
        element={
          <ProtectedRoute role="buyer">
            <NegotiationDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-farmers"
        element={
          <ProtectedRoute role="buyer">
            <SavedFarmers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute role="buyer">
            <BuyerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/profile"
        element={<Navigate to="/profile" replace />}
      />

      {/* Seller / Farmer Protected Routes */}
      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute role="farmer">
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/listings"
        element={
          <ProtectedRoute role="farmer">
            <MyListings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/listings/new"
        element={
          <ProtectedRoute role="farmer">
            <AddProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/listings/:id/edit"
        element={
          <ProtectedRoute role="farmer">
            <EditProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/payouts"
        element={
          <ProtectedRoute role="farmer">
            <Payouts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/analytics"
        element={
          <ProtectedRoute role="farmer">
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/verification"
        element={
          <ProtectedRoute role="farmer">
            <Verification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/profile"
        element={
          <ProtectedRoute role="farmer">
            <SellerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/negotiations"
        element={
          <ProtectedRoute role="farmer">
            <SellerNegotiations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/negotiations/:id"
        element={
          <ProtectedRoute role="farmer">
            <SellerNegotiationDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <ProtectedRoute role="farmer">
            <SellerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/returns"
        element={
          <ProtectedRoute role="farmer">
            <SellerReturns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/returns/:id"
        element={
          <ProtectedRoute role="farmer">
            <SellerReturnDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/disputes"
        element={
          <ProtectedRoute role="farmer">
            <SellerDisputes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/disputes/:id"
        element={
          <ProtectedRoute role="farmer">
            <SellerDisputeDetail />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="admin">
            <ManageUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute role="admin">
            <UserDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/farmers"
        element={
          <ProtectedRoute role="admin">
            <ManageFarmers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/verifications"
        element={
          <ProtectedRoute role="admin">
            <Verifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/verifications/:id"
        element={
          <ProtectedRoute role="admin">
            <VerificationDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/listings"
        element={
          <ProtectedRoute role="admin">
            <ManageListings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/listings/:id"
        element={
          <ProtectedRoute role="admin">
            <ListingDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/featured-listings"
        element={
          <ProtectedRoute role="admin">
            <FeaturedListings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute role="admin">
            <ManageOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <ProtectedRoute role="admin">
            <AdminOrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/disputes"
        element={
          <ProtectedRoute role="admin">
            <AdminDisputes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/disputes/:id"
        element={
          <ProtectedRoute role="admin">
            <AdminDisputeDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payouts"
        element={
          <ProtectedRoute role="admin">
            <AdminPayouts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payouts/:id"
        element={
          <ProtectedRoute role="admin">
            <AdminPayoutDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/refunds"
        element={
          <ProtectedRoute role="admin">
            <AdminRefunds />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="admin">
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/coupons"
        element={
          <ProtectedRoute role="admin">
            <AdminCoupons />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute role="admin">
            <AdminCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute role="admin">
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activity-logs"
        element={
          <ProtectedRoute role="admin">
            <AdminActivityLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute role="admin">
            <AdminProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/contacts"
        element={
          <ProtectedRoute role="admin">
            <AdminContactMessages />
          </ProtectedRoute>
        }
      />

      {/* Shared Authenticated Routes */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications/preferences"
        element={
          <ProtectedRoute>
            <NotificationPreferences />
          </ProtectedRoute>
        }
      />

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
