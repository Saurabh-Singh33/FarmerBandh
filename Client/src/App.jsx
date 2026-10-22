import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NegotiationProvider } from './context/NegotiationContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { SellerProvider } from './context/SellerContext';
import { LanguageProvider } from './context/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FarmerSidebar } from './components/FarmerSidebar';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { InitialLanguageModal } from './components/InitialLanguageModal';
import { ChatbotWidget } from './components/ChatbotWidget';
import { AppRoutes } from './routes/AppRoutes';

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role?.toLowerCase();
  const isAdmin = role === 'admin' || location.pathname.startsWith('/admin');
  const isFarmer = role === 'farmer' && !location.pathname.startsWith('/admin');

  let layoutContent;

  if (isAdmin && user?.role?.toLowerCase() === 'admin') {
    layoutContent = (
      <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F9FBF8', color: '#1F2937' }}>
        <AdminSidebar />
        <main style={{ flex: 1, minWidth: 0, width: '100%', overflowX: 'hidden', overflowY: 'auto', height: '100vh' }}>
          <AppRoutes />
        </main>
      </div>
    );
  } else if (isFarmer) {
    layoutContent = (
      <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F9FBF8', color: '#1F2937' }}>
        <FarmerSidebar />
        <main style={{ flex: 1, minWidth: 0, width: '100%', overflowX: 'hidden' }}>
          <AppRoutes />
        </main>
      </div>
    );
  } else {
    const hideFooter = location.pathname === '/auth';
    layoutContent = (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F9FBF8', color: '#1F2937' }}>
        <Navbar />
        <main style={{ flex: 1, minHeight: 0 }}>
          <AppRoutes />
        </main>
        {!hideFooter && <Footer />}
      </div>
    );
  }

  return (
    <>
      {layoutContent}
      <ChatbotWidget />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <InitialLanguageModal />
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <NotificationProvider>
                <SellerProvider>
                  <NegotiationProvider>
                    <CartProvider>
                      <AppLayout />
                    </CartProvider>
                  </NegotiationProvider>
                </SellerProvider>
              </NotificationProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
