import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { MongoClient, Db } from 'mongodb';
import { User, Admin, Product, Order, UserCart } from './types';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'veyra_ecommerce';

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnected = false;

// Embedded persistent storage path fallback
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

interface StoreData {
  users: User[];
  admins: Admin[];
  products: Product[];
  orders: Order[];
  carts: UserCart[];
}

// Initial seed products matching prompt requirements
const INITIAL_PRODUCTS: Product[] = [
  {
    _id: 'prod-001',
    name: 'Veyra Prime Smartphone',
    description: 'Minimalist smartphone engineered with aerospace ceramic casing, 6.7-inch dynamic OLED display, and all-day intelligent battery optimization.',
    price: 19999,
    category: 'Electronics',
    image: '/src/assets/images/prod_smartphone_1790416952525.jpg',
    quantity: 35,
    featured: true,
    specs: ['6.7" OLED 120Hz Display', '256GB Storage / 8GB RAM', '50MP Studio Sensor', '5000mAh Battery'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod-002',
    name: 'Veyra Studio Wireless Headphones',
    description: 'Precision acoustic tuning with hybrid active noise cancellation, custom 40mm bio-cellulose drivers, and memory-foam ear cushions.',
    price: 1999,
    category: 'Audio',
    image: '/src/assets/images/prod_headphones_1790416962990.jpg',
    quantity: 50,
    featured: true,
    specs: ['Hybrid Active Noise Cancelling', '40-Hour Battery Life', 'Multipoint Bluetooth 5.3', 'Comfort Memory Foam'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod-003',
    name: 'Veyra Ultra-Slim Laptop',
    description: 'Crafted from solid unibody anodized aluminum. High-performance octa-core processing with silent vapor chamber cooling for creators.',
    price: 49999,
    category: 'Computers',
    image: '/src/assets/images/prod_laptop_1790416974645.jpg',
    quantity: 20,
    featured: true,
    specs: ['14-inch 2.8K Retina IPS', '16GB LPDDR5 / 512GB NVMe SSD', '18-Hour Battery Life', '1.24 kg Ultralight'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod-004',
    name: 'Veyra Minimal Smart Watch',
    description: 'Curved sapphire glass watch with continuous heart-rate tracking, oxygen saturation telemetry, and a breathable woven nylon strap.',
    price: 2999,
    category: 'Wearables',
    image: '/src/assets/images/prod_smartwatch_1790416986056.jpg',
    quantity: 45,
    featured: true,
    specs: ['Always-On AMOLED Display', 'Comprehensive Health Sensors', '5 ATM Water Resistant', '7-Day Battery Span'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod-005',
    name: 'Veyra Acoustic Pro Earbuds',
    description: 'Pocket-sized ergonomic wireless earbuds featuring low-latency gaming transmission and quad-mic environmental noise dampening.',
    price: 3499,
    category: 'Audio',
    image: '/src/assets/images/prod_earbuds_1790417019342.jpg',
    quantity: 60,
    featured: false,
    specs: ['Ultra-Low Latency Mode', 'IPX5 Water Resistant', '32 Hours Total Playback', 'Touch Gestures'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod-006',
    name: 'Veyra Low-Profile Mechanical Keyboard',
    description: 'Anodized aluminum chassis featuring pre-lubricated tactile switches, PBT keycaps, and dual-mode Bluetooth + USB-C connectivity.',
    price: 5499,
    category: 'Accessories',
    image: '/src/assets/images/prod_keyboard_1790417029998.jpg',
    quantity: 28,
    featured: false,
    specs: ['Low-Profile Mechanical Switches', 'Solid Aluminum Frame', 'Custom PBT Double-Shot Caps', 'RGB Ambient Backlight'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod-007',
    name: 'Veyra Precision Aluminum Stand',
    description: 'Elevated ergonomic laptop and tablet stand engineered to enhance airflow, posture, and clean desktop arrangement.',
    price: 1899,
    category: 'Accessories',
    image: '/src/assets/images/prod_stand_1790417041853.jpg',
    quantity: 75,
    featured: false,
    specs: ['Aircraft Grade Aluminum', 'Silicone Anti-Slip Padding', 'Foldable Compact Travel Design', 'Fits 11" to 17" Laptops'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod-008',
    name: 'Veyra Fast Wireless Charging Pad',
    description: 'Textured graphite fabric pad with high-efficiency 15W Qi fast charging and automatic thermal management.',
    price: 1299,
    category: 'Accessories',
    image: '/src/assets/images/prod_charger_1790417052334.jpg',
    quantity: 80,
    featured: false,
    specs: ['15W Qi Fast Charge', 'Textured Slate Fabric Top', 'Foreign Object Detection', 'Braided USB-C Cable Included'],
    createdAt: new Date().toISOString()
  }
];

let memoryStore: StoreData = {
  users: [],
  admins: [],
  products: [],
  orders: [],
  carts: []
};

// Ensure data folder and storage file exist for local fallback
function initLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryStore = JSON.parse(content);
    } else {
      seedInitialStore();
      persistLocalStore();
    }
  } catch (err) {
    console.warn('Local store file warning, using memory cache:', err);
    seedInitialStore();
  }
}

function persistLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store to disk:', err);
  }
}

function seedInitialStore() {
  const adminPasswordHash = bcrypt.hashSync('AdminPassword123', 10);
  memoryStore = {
    users: [
      {
        _id: 'user-001',
        name: 'Arjun Mehta',
        email: 'customer@veyra.store',
        phone: '+91 98765 43210',
        passwordHash: bcrypt.hashSync('Customer123!', 10),
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        role: 'customer'
      }
    ],
    admins: [
      {
        _id: 'admin-001',
        name: 'Veyra Operations Admin',
        email: 'admin@veyra.store',
        passwordHash: adminPasswordHash,
        createdAt: new Date().toISOString(),
        role: 'admin'
      }
    ],
    products: INITIAL_PRODUCTS,
    orders: [
      {
        _id: 'ord-1001',
        orderNumber: 'VYR-1001',
        userId: 'user-001',
        customerName: 'Arjun Mehta',
        customerEmail: 'customer@veyra.store',
        customerPhone: '+91 98765 43210',
        shippingAddress: {
          fullName: 'Arjun Mehta',
          phoneNumber: '+91 98765 43210',
          emailAddress: 'customer@veyra.store',
          deliveryAddress: '42 Crescent Avenue, Koramangala 4th Block',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560034'
        },
        items: [
          {
            productId: 'prod-002',
            name: 'Veyra Studio Wireless Headphones',
            price: 1999,
            quantity: 1,
            image: '/src/assets/images/prod_headphones_1790416962990.jpg'
          }
        ],
        paymentMethod: 'Cash on Delivery',
        subtotal: 1999,
        deliveryFee: 0,
        totalAmount: 1999,
        status: 'Delivered',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    carts: []
  };
}

export async function initDatabase(): Promise<void> {
  initLocalStore();

  if (MONGODB_URI && MONGODB_URI.trim() !== '') {
    try {
      console.log('Connecting to MongoDB Atlas...');
      mongoClient = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 5000
      });
      await mongoClient.connect();
      mongoDb = mongoClient.db(DB_NAME);
      isMongoConnected = true;
      console.log('Successfully connected to MongoDB:', DB_NAME);

      // Seed MongoDB collections if empty
      const productsCol = mongoDb.collection<Product>('products');
      const count = await productsCol.countDocuments();
      if (count === 0) {
        await productsCol.insertMany(INITIAL_PRODUCTS);
        console.log('Seeded initial products into MongoDB.');
      }

      const adminsCol = mongoDb.collection<Admin>('admins');
      const adminCount = await adminsCol.countDocuments();
      if (adminCount === 0) {
        const adminHash = await bcrypt.hash('AdminPassword123', 10);
        await adminsCol.insertOne({
          _id: 'admin-001',
          name: 'Veyra Operations Admin',
          email: 'admin@veyra.store',
          passwordHash: adminHash,
          createdAt: new Date().toISOString(),
          role: 'admin'
        });
        console.log('Seeded initial admin account into MongoDB.');
      }
    } catch (err) {
      console.warn('MongoDB connection failed or timed out. Operating seamlessly with resilient local store:', err);
      isMongoConnected = false;
    }
  } else {
    console.log('No MONGODB_URI provided in environment. Running with resilient embedded storage.');
  }
}

// ==================== USER OPERATIONS ====================

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = email.toLowerCase().trim();
  if (isMongoConnected && mongoDb) {
    return await mongoDb.collection<User>('users').findOne({ email: normalized });
  }
  return memoryStore.users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (isMongoConnected && mongoDb) {
    return await mongoDb.collection<User>('users').findOne({ _id: id });
  }
  return memoryStore.users.find((u) => u._id === id) || null;
}

export async function createUser(user: User): Promise<User> {
  user.email = user.email.toLowerCase().trim();
  if (isMongoConnected && mongoDb) {
    await mongoDb.collection<User>('users').insertOne(user);
  }
  memoryStore.users.push(user);
  persistLocalStore();
  return user;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  if (isMongoConnected && mongoDb) {
    await mongoDb.collection<User>('users').updateOne({ _id: id }, { $set: updates });
  }
  const idx = memoryStore.users.findIndex((u) => u._id === id);
  if (idx !== -1) {
    memoryStore.users[idx] = { ...memoryStore.users[idx], ...updates };
    persistLocalStore();
    return memoryStore.users[idx];
  }
  return null;
}

export async function getAllCustomers(): Promise<Omit<User, 'passwordHash'>[]> {
  let list: User[] = [];
  if (isMongoConnected && mongoDb) {
    list = await mongoDb.collection<User>('users').find({}).toArray();
  } else {
    list = memoryStore.users;
  }
  return list.map(({ passwordHash, ...rest }) => rest);
}

// ==================== ADMIN OPERATIONS ====================

export async function findAdminByEmail(email: string): Promise<Admin | null> {
  const normalized = email.toLowerCase().trim();
  if (isMongoConnected && mongoDb) {
    return await mongoDb.collection<Admin>('admins').findOne({ email: normalized });
  }
  return memoryStore.admins.find((a) => a.email.toLowerCase() === normalized) || null;
}

// ==================== PRODUCT OPERATIONS ====================

export async function getProducts(query?: {
  search?: string;
  category?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Product[]> {
  let all: Product[] = [];
  if (isMongoConnected && mongoDb) {
    all = await mongoDb.collection<Product>('products').find({}).toArray();
  } else {
    all = [...memoryStore.products];
  }

  let result = all;

  if (query?.search && query.search.trim()) {
    const s = query.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
    );
  }

  if (query?.category && query.category !== 'All') {
    result = result.filter((p) => p.category.toLowerCase() === query.category?.toLowerCase());
  }

  if (query?.minPrice !== undefined && !isNaN(query.minPrice)) {
    result = result.filter((p) => p.price >= (query.minPrice || 0));
  }

  if (query?.maxPrice !== undefined && !isNaN(query.maxPrice)) {
    result = result.filter((p) => p.price <= (query.maxPrice || Infinity));
  }

  if (query?.sortBy) {
    if (query.sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (query.sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (query.sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (query.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  return result;
}

export async function findProductById(id: string): Promise<Product | null> {
  if (isMongoConnected && mongoDb) {
    return await mongoDb.collection<Product>('products').findOne({ _id: id });
  }
  return memoryStore.products.find((p) => p._id === id) || null;
}

export async function createProduct(product: Product): Promise<Product> {
  if (isMongoConnected && mongoDb) {
    await mongoDb.collection<Product>('products').insertOne(product);
  }
  memoryStore.products.unshift(product);
  persistLocalStore();
  return product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  if (isMongoConnected && mongoDb) {
    await mongoDb.collection<Product>('products').updateOne({ _id: id }, { $set: updates });
  }
  const idx = memoryStore.products.findIndex((p) => p._id === id);
  if (idx !== -1) {
    memoryStore.products[idx] = { ...memoryStore.products[idx], ...updates };
    persistLocalStore();
    return memoryStore.products[idx];
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isMongoConnected && mongoDb) {
    await mongoDb.collection<Product>('products').deleteOne({ _id: id });
  }
  const initialLen = memoryStore.products.length;
  memoryStore.products = memoryStore.products.filter((p) => p._id !== id);
  persistLocalStore();
  return memoryStore.products.length < initialLen;
}

// ==================== ORDER OPERATIONS ====================

export async function createOrder(order: Order): Promise<Order> {
  if (isMongoConnected && mongoDb) {
    await mongoDb.collection<Order>('orders').insertOne(order);
  }
  memoryStore.orders.unshift(order);

  // Decrement product inventory
  for (const item of order.items) {
    const prod = await findProductById(item.productId);
    if (prod) {
      const newQty = Math.max(0, prod.quantity - item.quantity);
      await updateProduct(prod._id, { quantity: newQty });
    }
  }

  persistLocalStore();
  return order;
}

export async function getOrders(userId?: string): Promise<Order[]> {
  if (isMongoConnected && mongoDb) {
    const filter = userId ? { userId } : {};
    return await mongoDb.collection<Order>('orders').find(filter).sort({ createdAt: -1 }).toArray();
  }
  if (userId) {
    return memoryStore.orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return [...memoryStore.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function findOrderById(id: string): Promise<Order | null> {
  if (isMongoConnected && mongoDb) {
    return await mongoDb.collection<Order>('orders').findOne({ $or: [{ _id: id }, { orderNumber: id }] });
  }
  return memoryStore.orders.find((o) => o._id === id || o.orderNumber === id) || null;
}

export async function updateOrderStatus(
  id: string,
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered'
): Promise<Order | null> {
  const updatedAt = new Date().toISOString();
  if (isMongoConnected && mongoDb) {
    await mongoDb
      .collection<Order>('orders')
      .updateOne({ $or: [{ _id: id }, { orderNumber: id }] }, { $set: { status, updatedAt } });
  }
  const idx = memoryStore.orders.findIndex((o) => o._id === id || o.orderNumber === id);
  if (idx !== -1) {
    memoryStore.orders[idx].status = status;
    memoryStore.orders[idx].updatedAt = updatedAt;
    persistLocalStore();
    return memoryStore.orders[idx];
  }
  return null;
}

// ==================== CART OPERATIONS ====================

export async function getUserCart(userId: string): Promise<UserCart> {
  if (isMongoConnected && mongoDb) {
    const found = await mongoDb.collection<UserCart>('carts').findOne({ userId });
    if (found) return found;
  }
  const memCart = memoryStore.carts.find((c) => c.userId === userId);
  if (memCart) return memCart;

  const newCart: UserCart = {
    _id: `cart-${Date.now()}`,
    userId,
    items: [],
    updatedAt: new Date().toISOString()
  };
  return newCart;
}

export async function saveUserCart(userId: string, items: { productId: string; quantity: number }[]): Promise<UserCart> {
  const cart: UserCart = {
    _id: `cart-${userId}`,
    userId,
    items,
    updatedAt: new Date().toISOString()
  };

  if (isMongoConnected && mongoDb) {
    await mongoDb.collection<UserCart>('carts').updateOne(
      { userId },
      { $set: cart },
      { upsert: true }
    );
  }

  const idx = memoryStore.carts.findIndex((c) => c.userId === userId);
  if (idx !== -1) {
    memoryStore.carts[idx] = cart;
  } else {
    memoryStore.carts.push(cart);
  }
  persistLocalStore();
  return cart;
}

// ==================== STATS OPERATIONS ====================

export async function getAdminStats() {
  const products = await getProducts();
  const customers = await getAllCustomers();
  const orders = await getOrders();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Confirmed' || o.status === 'Processing').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

  return {
    totalProducts: products.length,
    totalCustomers: customers.length,
    totalOrders: orders.length,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
    isMongoConnected
  };
}
