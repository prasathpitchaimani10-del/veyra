import { Product, Order, AdminStats, CustomerSummary, ShippingAddress } from '../types';

const API_BASE = '/api';

function getCustomerToken(): string | null {
  return localStorage.getItem('veyra_customer_token');
}

function getAdminToken(): string | null {
  return localStorage.getItem('veyra_admin_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}, authType: 'customer' | 'admin' | 'none' = 'none'): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (authType === 'customer') {
    const token = getCustomerToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  } else if (authType === 'admin') {
    const token = getAdminToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  // Public & Customer Auth
  register: (payload: { name: string; email: string; phone: string; password: string; confirmPassword: string }) =>
    request<{ message: string; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getProfile: () => request<{ user: any }>('/auth/me', {}, 'customer'),

  updateProfile: (payload: { name?: string; phone?: string }) =>
    request<{ message: string; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }, 'customer'),

  // Products
  getProducts: (params?: { search?: string; category?: string; sortBy?: string; minPrice?: number; maxPrice?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.minPrice !== undefined) searchParams.set('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) searchParams.set('maxPrice', String(params.maxPrice));
    const qs = searchParams.toString();
    return request<{ products: Product[] }>(`/products${qs ? `?${qs}` : ''}`);
  },

  getCategories: () => request<{ categories: string[] }>('/products/categories'),

  getProductById: (id: string) => request<{ product: Product }>(`/products/${id}`),

  // Cart
  getCart: () => request<{ cart: any }>('/cart', {}, 'customer'),

  syncCart: (items: { productId: string; quantity: number }[]) =>
    request<{ message: string; cart: any }>('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items })
    }, 'customer'),

  // Orders
  placeOrder: (payload: { items: { productId: string; quantity: number }[]; shippingAddress: ShippingAddress; paymentMethod: 'Cash on Delivery' }) =>
    request<{ message: string; order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, 'customer'),

  getOrders: () => request<{ orders: Order[] }>('/orders', {}, 'customer'),

  getOrderById: (id: string) => request<{ order: Order }>(`/orders/${id}`, {}, 'customer'),

  // Admin
  adminLogin: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string; admin: any }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getAdminProfile: () => request<{ admin: any }>('/admin/me', {}, 'admin'),

  getAdminStats: () => request<{ stats: AdminStats }>('/admin/stats', {}, 'admin'),

  getAdminProducts: () => request<{ products: Product[] }>('/admin/products', {}, 'admin'),

  createProduct: (payload: Partial<Product>) =>
    request<{ message: string; product: Product }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, 'admin'),

  updateProduct: (id: string, payload: Partial<Product>) =>
    request<{ message: string; product: Product }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }, 'admin'),

  deleteProduct: (id: string) =>
    request<{ message: string }>(`/admin/products/${id}`, {
      method: 'DELETE'
    }, 'admin'),

  getAdminCustomers: () => request<{ customers: CustomerSummary[] }>('/admin/customers', {}, 'admin'),

  getAdminOrders: () => request<{ orders: Order[] }>('/admin/orders', {}, 'admin'),

  updateOrderStatus: (id: string, status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered') =>
    request<{ message: string; order: Order }>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, 'admin')
};
