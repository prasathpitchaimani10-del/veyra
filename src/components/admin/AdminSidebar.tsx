import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Users,
  ShoppingBag,
  LogOut,
  X,
  ExternalLink,
  Database,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type AdminTab = 'dashboard' | 'add-product' | 'products' | 'customers' | 'orders';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onReturnToStore: () => void;
  counts: {
    products: number;
    customers: number;
    orders: number;
  };
  isMongoConnected?: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  onReturnToStore,
  counts,
  isMongoConnected = false,
  mobileOpen,
  onCloseMobile
}) => {
  const { admin } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'add-product' as AdminTab,
      label: 'Add Product',
      icon: PlusCircle,
      badge: null
    },
    {
      id: 'products' as AdminTab,
      label: 'Products',
      icon: Package,
      badge: counts.products
    },
    {
      id: 'customers' as AdminTab,
      label: 'Customers',
      icon: Users,
      badge: counts.customers
    },
    {
      id: 'orders' as AdminTab,
      label: 'Orders',
      icon: ShoppingBag,
      badge: counts.orders
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#111317] text-neutral-300">
      
      {/* Top Header / Branding */}
      <div>
        <div className="p-6 border-b border-neutral-800/90 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Veyra
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/80">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">Operations Console</p>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
            aria-label="Close admin menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Status Ribbon */}
        <div className="px-6 py-2.5 border-b border-neutral-800/60 bg-[#0E1013] flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-neutral-500" />
            <span>Database:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isMongoConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="text-neutral-300">
              {isMongoConnected ? 'MongoDB' : 'Embedded'}
            </span>
          </div>
        </div>

        {/* Navigation Item List */}
        <nav className="p-4 space-y-1.5" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between py-2.5 px-3 text-xs font-medium rounded-md transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold border-l-2 border-white shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-neutral-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded tabular-nums ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section: Profile & Actions */}
      <div className="p-4 border-t border-neutral-800/90 space-y-3 bg-[#0E1013]">
        
        {/* Administrator Identity */}
        <div className="px-2 py-1 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-semibold text-white">
            <Shield className="w-4 h-4 text-neutral-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {admin?.name || 'Administrator'}
            </p>
            <p className="text-[11px] text-neutral-500 font-mono truncate">
              {admin?.email || 'admin@veyra.store'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-1 pt-1">
          <button
            onClick={() => {
              onCloseMobile();
              onReturnToStore();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Storefront</span>
          </button>

          <button
            onClick={() => {
              onCloseMobile();
              onLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-md transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* 1. Desktop & Laptop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 border-r border-neutral-800">
        {sidebarContent}
      </aside>

      {/* 2. Mobile & Tablet Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
