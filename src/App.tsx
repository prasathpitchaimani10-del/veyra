import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrdersPage } from './pages/OrdersPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminTab } from './components/admin/AdminSidebar';
import { Order } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>('');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Synchronize view with location hash for natural browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (!hash) {
        setCurrentView('home');
        return;
      }
      const parts = hash.split('/');
      const view = parts[0];
      const param = parts[1];

      if (view === 'product' && param) {
        setSelectedProductId(param);
        setCurrentView('product-detail');
      } else if (view === 'admin' || view.startsWith('admin-')) {
        if (view === 'admin-login') {
          setCurrentView('admin-login');
        } else {
          setCurrentView('admin-dashboard');
          const sub = (param || (view.startsWith('admin-') && view !== 'admin-dashboard' ? view.replace('admin-', '') : 'dashboard')) as AdminTab;
          if (['dashboard', 'add-product', 'products', 'customers', 'orders'].includes(sub)) {
            setAdminTab(sub);
          }
        }
      } else if (view) {
        setCurrentView(view);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'product-detail' && param) {
      setSelectedProductId(param);
      window.location.hash = `#/product/${param}`;
      setCurrentView('product-detail');
      return;
    }

    if (view.startsWith('admin')) {
      if (view === 'admin-login') {
        window.location.hash = `#/admin-login`;
        setCurrentView('admin-login');
        return;
      }
      const sub = (param || (view.startsWith('admin-') && view !== 'admin-dashboard' ? view.replace('admin-', '') : 'dashboard')) as AdminTab;
      if (['dashboard', 'add-product', 'products', 'customers', 'orders'].includes(sub)) {
        setAdminTab(sub);
      }
      window.location.hash = `#/admin/${sub || 'dashboard'}`;
      setCurrentView('admin-dashboard');
      return;
    }

    if (param) {
      window.location.hash = `#/${view}/${param}`;
    } else {
      window.location.hash = `#/${view}`;
    }
    setCurrentView(view);
  };

  const handleViewProduct = (productId: string) => {
    navigateTo('product-detail', productId);
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    navigateTo('order-confirmation');
  };

  const handleSearch = (term: string) => {
    setActiveSearchTerm(term);
    navigateTo('shop');
  };

  const isAdminView = currentView.startsWith('admin');

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#18181A]">
          {/* Main Public Navigation */}
          {!isAdminView && (
            <Navbar
              currentView={currentView}
              onNavigate={navigateTo}
              onSearch={handleSearch}
            />
          )}

          {/* Cart Slide-Over Drawer */}
          {!isAdminView && <CartDrawer onNavigate={navigateTo} />}

          {/* Dynamic Content View */}
          <main className="flex-1">
            {currentView === 'home' && (
              <HomePage onNavigate={navigateTo} onViewProduct={handleViewProduct} />
            )}

            {currentView === 'shop' && (
              <ProductListingPage
                onViewProduct={handleViewProduct}
                initialSearch={activeSearchTerm}
              />
            )}

            {currentView === 'product-detail' && selectedProductId && (
              <ProductDetailPage
                productId={selectedProductId}
                onBack={() => navigateTo('shop')}
                onNavigate={navigateTo}
              />
            )}

            {currentView === 'cart' && <CartPage onNavigate={navigateTo} />}

            {currentView === 'checkout' && (
              <CheckoutPage
                onNavigate={navigateTo}
                onOrderSuccess={handleOrderSuccess}
              />
            )}

            {currentView === 'order-confirmation' && confirmedOrder && (
              <OrderConfirmationPage
                order={confirmedOrder}
                onNavigate={navigateTo}
              />
            )}

            {currentView === 'orders' && <OrdersPage onNavigate={navigateTo} />}

            {currentView === 'login' && <LoginPage onNavigate={navigateTo} />}

            {currentView === 'register' && <RegisterPage onNavigate={navigateTo} />}

            {currentView === 'account' && <AccountPage onNavigate={navigateTo} />}

            {currentView === 'admin-login' && (
              <AdminLoginPage onNavigate={navigateTo} />
            )}

            {currentView === 'admin-dashboard' && (
              <AdminDashboardPage
                onNavigate={navigateTo}
                initialTab={adminTab}
              />
            )}
          </main>

          {/* Public Footer */}
          {!isAdminView && <Footer onNavigate={navigateTo} />}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
