import { Router, Response } from 'express';
import { createOrder, getOrders, findOrderById, findProductById, saveUserCart } from '../db';
import { requireUser, AuthenticatedRequest } from '../middleware/auth';
import { Order, OrderItem, ShippingAddress } from '../types';

const router = Router();

// POST /api/orders (Place an order)
router.post('/', requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Your cart is empty. Please add products before placing an order.' });
      return;
    }

    if (paymentMethod !== 'Cash on Delivery') {
      res.status(400).json({ error: 'Only Cash on Delivery is currently supported for this order.' });
      return;
    }

    if (!shippingAddress) {
      res.status(400).json({ error: 'Shipping details are required.' });
      return;
    }

    const { fullName, phoneNumber, emailAddress, deliveryAddress, city, state, pincode } = shippingAddress as ShippingAddress;

    if (!fullName || !phoneNumber || !deliveryAddress || !city || !state || !pincode) {
      res.status(400).json({ error: 'Please provide all delivery address fields.' });
      return;
    }

    const pincodeRegex = /^[0-9]{4,10}$/;
    if (!pincodeRegex.test(String(pincode).trim())) {
      res.status(400).json({ error: 'Please enter a valid postal pincode.' });
      return;
    }

    // Verify each product and its live price & inventory
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const prod = await findProductById(item.productId);
      if (!prod) {
        res.status(400).json({ error: `Product with ID ${item.productId} is no longer available.` });
        return;
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      if (prod.quantity < qty) {
        res.status(400).json({
          error: `Insufficient stock for "${prod.name}". Only ${prod.quantity} available in inventory.`
        });
        return;
      }

      orderItems.push({
        productId: prod._id,
        name: prod.name,
        price: prod.price,
        quantity: qty,
        image: prod.image
      });

      subtotal += prod.price * qty;
    }

    // Delivery calculation: Free for all orders or over threshold
    const deliveryFee = 0;
    const totalAmount = subtotal + deliveryFee;

    const orderNumber = `VYR-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      _id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      orderNumber,
      userId: user._id,
      customerName: fullName.trim(),
      customerEmail: (emailAddress || user.email).trim().toLowerCase(),
      customerPhone: phoneNumber.trim(),
      shippingAddress: {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        emailAddress: (emailAddress || user.email).trim().toLowerCase(),
        deliveryAddress: deliveryAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim()
      },
      items: orderItems,
      paymentMethod: 'Cash on Delivery',
      subtotal,
      deliveryFee,
      totalAmount,
      status: 'Confirmed',
      createdAt: now,
      updatedAt: now
    };

    const savedOrder = await createOrder(newOrder);

    // Clear the user's cart in db
    await saveUserCart(user._id, []);

    res.status(201).json({
      message: 'Order placed successfully.',
      order: savedOrder
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order. Please review your details and try again.' });
  }
});

// GET /api/orders (User's order history)
router.get('/', requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await getOrders(req.user!._id);
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve order history.' });
  }
});

// GET /api/orders/:id (Order details)
router.get('/:id', requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await findOrderById(id);

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    // Security check: Only the owner or admin can view this order
    if (order.userId !== req.user!._id) {
      res.status(403).json({ error: 'Unauthorized to view this order.' });
      return;
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve order details.' });
  }
});

export default router;
