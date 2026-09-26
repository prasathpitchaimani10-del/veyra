export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
  featured?: boolean;
  specs?: string[];
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  role: 'customer';
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  deliveryAddress: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  paymentMethod: 'Cash on Delivery';
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  isMongoConnected: boolean;
}

export interface CustomerSummary extends User {
  orderCount: number;
  totalSpent: number;
}
