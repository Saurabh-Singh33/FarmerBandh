import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NegotiationProvider } from './context/NegotiationContext';
import { NotificationProvider } from './context/NotificationContext';
import { SellerProvider } from './context/SellerContext';
import { Navbar } from './components/Navbar';
import { FarmerSidebar } from './components/FarmerSidebar';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AppRoutes } from './routes/AppRoutes';

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role?.toLowerCase();
  const isAdmin = role === 'admin' || location.pathname.startsWith('/admin');
  const isFarmer = role === 'farmer' && !location.pathname.startsWith('/admin');

  if (isAdmin && user?.role?.toLowerCase() === 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F9FBF8', color: '#1F2937' }}>
        <AdminSidebar />
        <main style={{ flex: 1, minWidth: 0, width: '100%', overflowX: 'hidden', overflowY: 'auto', height: '100vh' }}>
          <AppRoutes />
        </main>
      </div>
    );
  }

  if (isFarmer) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F9FBF8', color: '#1F2937' }}>
        <FarmerSidebar />
        <main style={{ flex: 1, minWidth: 0, width: '100%', overflowX: 'hidden' }}>
          <AppRoutes />
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FBF8', color: '#1F2937' }}>
      <Navbar />
      <main>
        <AppRoutes />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <SellerProvider>
            <NegotiationProvider>
              <CartProvider>
                <AppLayout />
              </CartProvider>
            </NegotiationProvider>
          </SellerProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
