import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  findAdminByEmail,
  getAdminStats,
  getProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCustomers,
  getOrders,
  findOrderById,
  updateOrderStatus
} from '../db';
import { generateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { Product } from '../types';

const router = Router();

// POST /api/admin/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Administrative email and password are required.' });
      return;
    }

    const admin = await findAdminByEmail(email);
    if (!admin) {
      res.status(401).json({ error: 'Invalid administrative credentials.' });
      return;
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid administrative credentials.' });
      return;
    }

    const token = generateToken({
      id: admin._id,
      email: admin.email,
      role: 'admin'
    });

    res.json({
      message: 'Admin authentication verified.',
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Admin authentication service failed.' });
  }
});

// GET /api/admin/me
router.get('/me', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ admin: req.admin });
});

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await getAdminStats();
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve admin stats.' });
  }
});

// GET /api/admin/products
router.get('/products', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await getProducts();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// POST /api/admin/products (Add product)
router.post('/products', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, price, category, description, quantity, image, specs, featured } = req.body;

    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: 'Product name is required.' });
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      res.status(400).json({ error: 'Price must be a positive number.' });
      return;
    }

    if (!category || category.trim().length === 0) {
      res.status(400).json({ error: 'Category is required.' });
      return;
    }

    if (!description || description.trim().length < 10) {
      res.status(400).json({ error: 'Description must be at least 10 characters.' });
      return;
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty < 0) {
      res.status(400).json({ error: 'Quantity must be a non-negative integer.' });
      return;
    }

    // Default placeholder image if none provided
    const productImage = image && image.trim() !== '' ? image.trim() : '/src/assets/images/prod_smartphone_1790416952525.jpg';

    const newProduct: Product = {
      _id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: productImage,
      quantity: Math.floor(numQty),
      featured: Boolean(featured),
      specs: Array.isArray(specs) ? specs : [],
      createdAt: new Date().toISOString()
    };

    const saved = await createProduct(newProduct);
    res.status(201).json({ message: 'Product created successfully.', product: saved });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to add product.' });
  }
});

// PUT /api/admin/products/:id (Update product)
router.put('/products/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, quantity, image, specs, featured } = req.body;

    const existing = await findProductById(id);
    if (!existing) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const updates: Partial<Product> = {};
    if (name) updates.name = name.trim();
    if (price !== undefined) updates.price = Number(price);
    if (category) updates.category = category.trim();
    if (description) updates.description = description.trim();
    if (quantity !== undefined) updates.quantity = Math.max(0, Math.floor(Number(quantity)));
    if (image) updates.image = image.trim();
    if (Array.isArray(specs)) updates.specs = specs;
    if (featured !== undefined) updates.featured = Boolean(featured);

    const updated = await updateProduct(id, updates);
    res.json({ message: 'Product updated successfully.', product: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProduct(id);
    if (!deleted) {
      res.status(404).json({ error: 'Product not found or already deleted.' });
      return;
    }
    res.json({ message: 'Product removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// GET /api/admin/customers
router.get('/customers', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const customers = await getAllCustomers();
    const orders = await getOrders();

    const customerSummary = customers.map((c) => {
      const userOrders = orders.filter((o) => o.userId === c._id);
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      return {
        ...c,
        orderCount: userOrders.length,
        totalSpent
      };
    });

    res.json({ customers: customerSummary });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve customers.' });
  }
});

// GET /api/admin/orders
router.get('/orders', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await getOrders();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid order status. Allowed: Confirmed, Processing, Shipped, Delivered' });
      return;
    }

    const updated = await updateOrderStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    res.json({ message: `Order status updated to ${status}.`, order: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

export default router;
