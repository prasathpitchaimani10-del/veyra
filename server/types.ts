export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
  role: 'customer';
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  role: 'admin';
}

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
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
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

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface UserCart {
  _id: string;
  userId: string;
  items: CartItem[];
  updatedAt: string;
}
