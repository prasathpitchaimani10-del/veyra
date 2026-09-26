import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Users,
  ShoppingBag,
  LogOut,
  RefreshCw,
  Search,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Edit2,
  Menu,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AdminStats, Product, CustomerSummary, Order } from '../../types';
import { AdminSidebar, AdminTab } from '../../components/admin/AdminSidebar';

interface AdminDashboardProps {
  onNavigate: (view: string, param?: string) => void;
  initialTab?: AdminTab;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({
  onNavigate,
  initialTab = 'dashboard'
}) => {
  const { admin, isAdminLoggedIn, logoutAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Electronics',
    description: '',
    quantity: '25',
    image: '/src/assets/images/prod_smartphone_1790416952525.jpg',
    featured: false
  });
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Inline Product Editing State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');

  // Synchronize initialTab if changed externally
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const loadAllAdminData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [statsRes, prodRes, custRes, ordRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminProducts(),
        api.getAdminCustomers(),
        api.getAdminOrders()
      ]);
      setStats(statsRes.stats);
      setProducts(prodRes.products);
      setCustomers(custRes.customers);
      setOrders(ordRes.orders);

      if (isManualRefresh) {
        showNotice('success', 'Admin data refreshed from server.');
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      showNotice('error', err.message || 'Error loading dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadAllAdminData();
    }
  }, [isAdminLoggedIn]);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    window.location.hash = `#/admin/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logoutAdmin();
    onNavigate('home');
  };

  const handleReturnToStore = () => {
    onNavigate('home');
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.description.trim()) {
      showNotice('error', 'Please fill in all required product fields.');
      return;
    }

    try {
      setCreatingProduct(true);
      await api.createProduct({
        name: newProduct.name.trim(),
        price: Number(newProduct.price),
        category: newProduct.category,
        description: newProduct.description.trim(),
        quantity: Number(newProduct.quantity) || 1,
        image: newProduct.image.trim(),
        featured: newProduct.featured
      });

      showNotice('success', `Product "${newProduct.name}" added to catalog successfully.`);
      setNewProduct({
        name: '',
        price: '',
        category: 'Electronics',
        description: '',
        quantity: '25',
        image: '/src/assets/images/prod_smartphone_1790416952525.jpg',
        featured: false
      });
      await loadAllAdminData();
      handleSelectTab('products');
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to add product.');
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the store catalog?`)) return;
    try {
      await api.deleteProduct(id);
      showNotice('success', `Product "${name}" deleted.`);
      await loadAllAdminData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete product.');
    }
  };

  const handleSaveProductEdit = async (id: string) => {
    try {
      const updates: Partial<Product> = {};
      if (editPrice) updates.price = Number(editPrice);
      if (editQty) updates.quantity = Number(editQty);
      await api.updateProduct(id, updates);
      setEditingProductId(null);
      showNotice('success', 'Product inventory updated.');
      await loadAllAdminData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update product.');
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await api.updateOrderStatus(orderId, status);
      showNotice('success', `Order status updated to ${status}.`);
      await loadAllAdminData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update order status.');
    }
  };

  // Filtered lists
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const term = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p._id.toLowerCase().includes(term)
    );
  });

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch.trim()) return true;
    const term = customerSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term)
    );
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'All') return true;
    return o.status === orderStatusFilter;
  });

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-16 bg-[#FBFBF9]">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-700">
            <LayoutDashboard className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Admin Authorization Required</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Please authenticate through the administrative portal to access the operations console.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('admin-login')}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors"
            >
              Sign In to Admin Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Operations Dashboard';
      case 'add-product':
        return 'Add Product';
      case 'products':
        return 'Product Inventory';
      case 'customers':
        return 'Customer Management';
      case 'orders':
        return 'Order Fulfillment';
      default:
        return 'Admin Console';
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview of sales volume, registered accounts, and recent Cash on Delivery consignments.';
      case 'add-product':
        return 'Add new items to the live storefront catalog with immediate indexing.';
      case 'products':
        return 'Manage prices, stock availability, and catalog listings.';
      case 'customers':
        return 'View registered customer contact details, purchase frequency, and lifetime spend.';
      case 'orders':
        return 'Track, fulfill, and update dispatch statuses for Cash on Delivery shipments.';
      default:
        return 'Administrative management tools.';
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
      
      {/* 1. RESPONSIVE SIDEBAR */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onLogout={handleLogout}
        onReturnToStore={handleReturnToStore}
        counts={{
          products: products.length,
          customers: customers.length,
          orders: orders.length
        }}
        isMongoConnected={stats?.isMongoConnected}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. MAIN CONTENT AREA (Offset by Sidebar on Desktop) */}
      <div className="md:pl-64 flex flex-col flex-1 min-w-0">
        
        {/* Top Operational Bar */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Mobile Toggle & Breadcrumbs */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-neutral-700 hover:text-neutral-950 rounded-md hover:bg-neutral-100 transition-colors"
                aria-label="Open navigation sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-xs">
                <span className="font-semibold text-neutral-400">Admin</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                <span className="font-semibold text-neutral-900 capitalize">
                  {activeTab === 'add-product' ? 'Add Product' : activeTab}
                </span>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={() => loadAllAdminData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-neutral-700 hover:text-neutral-950 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors"
                title="Refresh live data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={handleReturnToStore}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-neutral-700 hover:text-neutral-950 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Storefront</span>
              </button>
            </div>

          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Section Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                {getPageDescription()}
              </p>
            </div>

            {activeTab === 'products' && (
              <button
                onClick={() => handleSelectTab('add-product')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}
          </div>

          {/* Action Feedback Banner */}
          {actionNotice && (
            <div
              className={`p-3.5 rounded-lg border text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {actionNotice.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionNotice.message}</span>
            </div>
          )}

          {/* ========================================================
              TAB 1: DASHBOARD OVERVIEW
             ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white border border-neutral-200/90 p-5 rounded-xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total Products</span>
                    <Package className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-3xl font-bold text-neutral-900 tabular-nums">
                      {stats?.totalProducts ?? products.length}
                    </span>
                    <button
                      onClick={() => handleSelectTab('products')}
                      className="text-xs text-neutral-600 hover:text-neutral-950 underline"
                    >
                      View All
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200/90 p-5 rounded-xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total Customers</span>
                    <Users className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-3xl font-bold text-neutral-900 tabular-nums">
                      {stats?.totalCustomers ?? customers.length}
                    </span>
                    <button
                      onClick={() => handleSelectTab('customers')}
                      className="text-xs text-neutral-600 hover:text-neutral-950 underline"
                    >
                      View All
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200/90 p-5 rounded-xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-3xl font-bold text-neutral-900 tabular-nums">
                      {stats?.totalOrders ?? orders.length}
                    </span>
                    <button
                      onClick={() => handleSelectTab('orders')}
                      className="text-xs text-neutral-600 hover:text-neutral-950 underline"
                    >
                      View All
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200/90 p-5 rounded-xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Gross Sales Value</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">COD</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-3xl font-bold text-neutral-900 tabular-nums">
                      ₹{(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-neutral-500">Delivered & Pending</span>
                  </div>
                </div>

              </div>

              {/* Grid: Recent Orders & Quick Shortcuts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Recent Orders Preview */}
                <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Recent Customer Orders</h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Most recent Cash on Delivery orders placed by customers.</p>
                    </div>
                    <button
                      onClick={() => handleSelectTab('orders')}
                      className="text-xs font-medium text-neutral-600 hover:text-neutral-950 underline"
                    >
                      View All Orders ({orders.length})
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-10 text-center text-xs text-neutral-500">
                      No orders placed yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100 text-xs">
                      {orders.slice(0, 5).map((ord) => (
                        <div key={ord._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-neutral-900">{ord.orderNumber || ord._id}</span>
                              <span className="text-neutral-400">·</span>
                              <span className="font-semibold text-neutral-800">{ord.customerName}</span>
                            </div>
                            <p className="text-neutral-500 text-[11px]">
                              {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'} · {ord.paymentMethod}
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <span className="font-bold text-neutral-900 tabular-nums">
                              ₹{ord.totalAmount.toLocaleString('en-IN')}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                ord.status === 'Confirmed'
                                  ? 'bg-blue-50 text-blue-700'
                                  : ord.status === 'Processing'
                                  ? 'bg-amber-50 text-amber-700'
                                  : ord.status === 'Shipped'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Operations Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Quick Shortcuts */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4 shadow-xs">
                    <h3 className="text-sm font-bold text-neutral-900 pb-3 border-b border-neutral-100">
                      Quick Operations
                    </h3>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleSelectTab('add-product')}
                        className="w-full py-2.5 px-3.5 text-xs font-semibold text-neutral-800 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <PlusCircle className="w-4 h-4 text-neutral-600" />
                          <span>Add New Product</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </button>

                      <button
                        onClick={() => handleSelectTab('products')}
                        className="w-full py-2.5 px-3.5 text-xs font-semibold text-neutral-800 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-neutral-600" />
                          <span>Manage Catalog</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </button>

                      <button
                        onClick={() => handleSelectTab('orders')}
                        className="w-full py-2.5 px-3.5 text-xs font-semibold text-neutral-800 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-neutral-600" />
                          <span>Update Order Statuses</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </button>

                      <button
                        onClick={() => handleSelectTab('customers')}
                        className="w-full py-2.5 px-3.5 text-xs font-semibold text-neutral-800 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-neutral-600" />
                          <span>View Customers</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </button>
                    </div>
                  </div>

                  {/* Database Information */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-xs text-xs">
                    <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
                      Storage Architecture
                    </h4>
                    <p className="text-neutral-600 leading-relaxed text-[11px]">
                      {stats?.isMongoConnected
                        ? 'Connected directly to MongoDB Atlas cluster. Customer registrations, catalog changes, and order dispatches are synchronized with MongoDB.'
                        : 'Active on resilient embedded storage (server/data/store.json). To connect an external MongoDB Atlas cluster, configure MONGODB_URI in your environment.'}
                    </p>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ========================================================
              TAB 2: ADD PRODUCT
             ======================================================== */}
          {activeTab === 'add-product' && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl mx-auto">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Add New Product to Storefront</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Products submitted here appear immediately on the customer catalog and can be purchased with Cash on Delivery.
                </p>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Veyra Wireless Studio Headphones"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="2999"
                      required
                      min={1}
                      className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Audio">Audio</option>
                      <option value="Computers">Computers</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Initial Inventory Quantity *
                    </label>
                    <input
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                      placeholder="30"
                      required
                      min={0}
                      className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Featured Status
                    </label>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="featured-check"
                        checked={newProduct.featured}
                        onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                        className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                      />
                      <label htmlFor="featured-check" className="text-neutral-700 cursor-pointer">
                        Feature in Storefront Hero Collection
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Product Image Asset Path / URL *
                  </label>
                  <input
                    type="text"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    placeholder="/src/assets/images/..."
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 font-mono text-[11px]"
                  />
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
                    <span className="text-neutral-400">Curated studio presets:</span>
                    {[
                      { label: 'Smartphone', path: '/src/assets/images/prod_smartphone_1790416952525.jpg' },
                      { label: 'Headphones', path: '/src/assets/images/prod_headphones_1790416962990.jpg' },
                      { label: 'Laptop', path: '/src/assets/images/prod_laptop_1790416974645.jpg' },
                      { label: 'Smartwatch', path: '/src/assets/images/prod_smartwatch_1790416986056.jpg' },
                      { label: 'Earbuds', path: '/src/assets/images/prod_earbuds_1790417019342.jpg' },
                      { label: 'Keyboard', path: '/src/assets/images/prod_keyboard_1790417029998.jpg' },
                      { label: 'Stand', path: '/src/assets/images/prod_stand_1790417041853.jpg' },
                      { label: 'Charger', path: '/src/assets/images/prod_charger_1790417052334.jpg' }
                    ].map((p) => (
                      <button
                        type="button"
                        key={p.label}
                        onClick={() => setNewProduct({ ...newProduct, image: p.path })}
                        className="underline text-neutral-600 hover:text-neutral-950 font-medium"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Product Description *
                  </label>
                  <textarea
                    rows={4}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Enter detailed specifications, build quality, materials, and functional benefits..."
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FBFBF9] border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={creatingProduct}
                    className="w-full py-3 px-4 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {creatingProduct ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing to Catalog...</span>
                      </>
                    ) : (
                      <span>Save and Publish Product</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================
              TAB 3: PRODUCTS INVENTORY TABLE
             ======================================================== */}
          {activeTab === 'products' && (
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-6">
              
              {/* Table Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by product name, category..."
                    className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-[#FBFBF9] border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <span className="text-xs text-neutral-500 tabular-nums">
                  Showing {filteredProducts.length} of {products.length} products
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-[#FBFBF9] uppercase text-[10px] tracking-wider text-neutral-500 border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Price</th>
                      <th className="py-3 px-4 text-center">Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-500">
                          No matching products found.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => {
                        const isEditing = editingProductId === prod._id;
                        return (
                          <tr key={prod._id} className="hover:bg-neutral-50/60">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded object-cover border border-neutral-200 shrink-0"
                                />
                                <div>
                                  <p className="font-semibold text-neutral-900">{prod.name}</p>
                                  <p className="text-[11px] text-neutral-400 font-mono">ID: {prod._id}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 font-medium text-neutral-600">
                              {prod.category}
                            </td>

                            <td className="py-3 px-4 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  className="w-24 px-2 py-1 text-xs border border-neutral-300 rounded text-right font-mono"
                                />
                              ) : (
                                <span className="font-semibold text-neutral-900 tabular-nums">
                                  ₹{prod.price.toLocaleString('en-IN')}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-center">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editQty}
                                  onChange={(e) => setEditQty(e.target.value)}
                                  className="w-16 px-2 py-1 text-xs border border-neutral-300 rounded text-center font-mono"
                                />
                              ) : (
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                                    prod.quantity <= 0
                                      ? 'bg-rose-100 text-rose-800'
                                      : prod.quantity <= 5
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-neutral-100 text-neutral-800'
                                  }`}
                                >
                                  {prod.quantity} units
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveProductEdit(prod._id)}
                                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded"
                                      title="Save Changes"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setEditingProductId(null)}
                                      className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded"
                                      title="Cancel"
                                    >
                                      ✕
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingProductId(prod._id);
                                        setEditPrice(String(prod.price));
                                        setEditQty(String(prod.quantity));
                                      }}
                                      className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
                                      title="Edit Price & Quantity"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(prod._id, prod.name)}
                                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50"
                                      title="Delete Product"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 4: CUSTOMERS MANAGEMENT
             ======================================================== */}
          {activeTab === 'customers' && (
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-6">
              
              {/* Customer Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customer by name, email, phone..."
                    className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-[#FBFBF9] border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <span className="text-xs text-neutral-500 tabular-nums">
                  {filteredCustomers.length} registered customers
                </span>
              </div>

              {/* Customers Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-[#FBFBF9] uppercase text-[10px] tracking-wider text-neutral-500 border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4 text-center">Orders Placed</th>
                      <th className="py-3 px-4 text-right">Lifetime Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-500">
                          No matching customer accounts found.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((c) => (
                        <tr key={c._id} className="hover:bg-neutral-50/60">
                          <td className="py-3 px-4 font-semibold text-neutral-900">
                            {c.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-600">
                            {c.email}
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-600">
                            {c.phone}
                          </td>
                          <td className="py-3 px-4 text-neutral-500">
                            {new Date(c.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-neutral-900 tabular-nums">
                            {c.orderCount ?? 0}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-neutral-900 tabular-nums">
                            ₹{(c.totalSpent ?? 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 5: ORDERS MANAGEMENT
             ======================================================== */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-6">
              
              {/* Order Status Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <span className="text-neutral-400 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    Status:
                  </span>
                  {['All', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                        orderStatusFilter === status
                          ? 'bg-neutral-900 text-white font-semibold'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-neutral-500 tabular-nums">
                  Showing {filteredOrders.length} of {orders.length} orders
                </span>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-[#FBFBF9] uppercase text-[10px] tracking-wider text-neutral-500 border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Delivery City / State</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4 text-right">Total Amount</th>
                      <th className="py-3 px-4 text-center">Payment</th>
                      <th className="py-3 px-4 text-center">Dispatch Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-500">
                          No orders match the selected status filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-neutral-50/60">
                          <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                            {ord.orderNumber || ord._id}
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-semibold text-neutral-900">{ord.customerName}</p>
                            <p className="text-[11px] text-neutral-500 font-mono">{ord.customerPhone}</p>
                          </td>

                          <td className="py-3 px-4 text-neutral-600 max-w-xs truncate" title={ord.shippingAddress?.deliveryAddress}>
                            {ord.shippingAddress?.city}, {ord.shippingAddress?.state} ({ord.shippingAddress?.pincode})
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-medium text-neutral-800">
                              {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-neutral-900 tabular-nums">
                            ₹{ord.totalAmount.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800">
                              {ord.paymentMethod}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <select
                              value={ord.status}
                              onChange={(e) => handleOrderStatusUpdate(ord._id, e.target.value as Order['status'])}
                              className={`px-2.5 py-1 text-xs font-semibold rounded border focus:outline-none cursor-pointer ${
                                ord.status === 'Confirmed'
                                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                                  : ord.status === 'Processing'
                                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                                  : ord.status === 'Shipped'
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              }`}
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </main>

      </div>

    </div>
  );
};
