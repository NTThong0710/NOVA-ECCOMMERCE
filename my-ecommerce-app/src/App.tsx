import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import OtpVerification from './features/auth/pages/OtpVerification';
import HomePage from './pages/Home/HomePage';
import ProfilePage from './pages/Profile/ProfilePage';
import MainLayout from './layouts/MainLayout';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './core/components/ProtectedRoute';
import AdminLayout from './features/admin/layouts/AdminLayout';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import AdminProductsPage from './features/admin/pages/AdminProductsPage';
import AdminOrdersPage from './features/admin/pages/AdminOrdersPage';
import AdminPromotionsPage from './features/admin/pages/AdminPromotionsPage';
import OrderHistoryPage from './features/orders/pages/OrderHistoryPage';
import CartPage from './features/cart/pages/CartPage';
import CheckoutPage from './features/checkout/pages/CheckoutPage';
import ProductListPage from './features/products/pages/ProductListPage';
import ProductDetailPage from './features/products/pages/ProductDetailPage';
import WishlistPage from './features/wishlist/pages/WishlistPage';
import PaymentResultPage from './features/payment/pages/PaymentResultPage';
import { useInitAuth } from './hook/useInitAuth';
import AdminUsersPage from './features/admin/pages/AdminUsersPage';
import LandingPage from './pages/Landing/LandingPage';


function App() {
  useInitAuth(); // Tự động reload profile nếu có token nhưng profile chưa được load (sau khi refresh trang)

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Landing Page as the root, without MainLayout header/footer */}
        <Route path="/" element={<LandingPage />} />
        
        {/* All shop routes use MainLayout but are kept at the root URL level */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp" element={<OtpVerification />} />
        
        {/* Payment Result — VNPay redirect ve day sau khi thanh toan */}
        <Route path="/payment/result" element={<PaymentResultPage />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="promotions" element={<AdminPromotionsPage />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;