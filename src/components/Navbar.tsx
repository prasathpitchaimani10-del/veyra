import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, Menu, X, Search, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onSearch?: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onSearch }) => {
  const { user, isUserLoggedIn, logoutCustomer, isAdminLoggedIn } = useAuth();
  const { totalItemCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    onNavigate('shop');
    setSearchOpen(false);
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop' },
    { id: 'orders', label: 'My Orders' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-neutral-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 hover:opacity-90 transition-opacity"
            >
              Veyra
            </button>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center space-x-9 text-xs uppercase tracking-widest font-medium text-neutral-600">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`transition-colors hover:text-neutral-950 py-1 border-b-2 ${
                  currentView === link.id
                    ? 'border-neutral-900 text-neutral-950 font-bold'
                    : 'border-transparent text-neutral-600'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Functional action controls */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Trigger */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search catalog..."
                    className="w-40 sm:w-56 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 ml-1"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-neutral-700 hover:text-neutral-950 rounded-md hover:bg-neutral-100 transition-colors"
                  aria-label="Open search input"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Shopping Bag Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-neutral-700 hover:text-neutral-950 rounded-md hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
              aria-label="Open shopping cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">Cart</span>
              {totalItemCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-semibold text-white bg-neutral-900 rounded-full tabular-nums min-w-[18px]">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* Customer Account / Auth */}
            {isUserLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 p-1.5 text-xs font-medium text-neutral-800 hover:text-neutral-950 rounded-md hover:bg-neutral-100 transition-colors"
                  aria-label="Account menu"
                >
                  <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-700">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:inline max-w-[100px] truncate">{user?.name}</span>
                </button>

                {accountMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-lg border border-neutral-200 shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    onMouseLeave={() => setAccountMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-xs font-semibold text-neutral-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('account');
                        setAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      Account Settings
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('orders');
                        setAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      My Orders
                    </button>
                    <div className="my-1 border-t border-neutral-100" />
                    <button
                      onClick={() => {
                        logoutCustomer();
                        setAccountMenuOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-900 border border-neutral-300 rounded-md hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            {/* Admin Portal Indicator / Switch */}
            {isAdminLoggedIn ? (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 border border-neutral-300 rounded-md hover:bg-neutral-200 transition-colors"
                title="Go to Admin Panel"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            ) : (
              <button
                onClick={() => onNavigate('admin-login')}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded transition-colors hidden sm:block"
                title="Admin Portal"
                aria-label="Admin Portal"
              >
                <Shield className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 hover:text-neutral-950 md:hidden rounded-md hover:bg-neutral-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-[#FBFBF9] px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === link.id
                    ? 'bg-neutral-200/60 text-neutral-950 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-neutral-200 space-y-2">
            {isUserLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('account');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md"
                >
                  Account Profile ({user?.name})
                </button>
                <button
                  onClick={() => {
                    logoutCustomer();
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center text-xs font-medium text-neutral-900 border border-neutral-300 rounded-md hover:bg-neutral-50"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onNavigate('register');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800"
                >
                  Register
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onNavigate(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Administrative Operations
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
