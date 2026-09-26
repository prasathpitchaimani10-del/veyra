import { Router, Response } from 'express';
import { getUserCart, saveUserCart, findProductById } from '../db';
import { requireUser, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/cart
router.get('/', requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const cart = await getUserCart(req.user._id);
    
    // Enrich items with live product data
    const enrichedItems = [];
    for (const item of cart.items) {
      const prod = await findProductById(item.productId);
      if (prod) {
        enrichedItems.push({
          productId: prod._id,
          name: prod.name,
          price: prod.price,
          image: prod.image,
          category: prod.category,
          stock: prod.quantity,
          quantity: Math.min(item.quantity, Math.max(1, prod.quantity))
        });
      }
    }

    res.json({ cart: { ...cart, enrichedItems } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve cart.' });
  }
});

// POST /api/cart/sync
router.post('/sync', requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'Cart items must be an array.' });
      return;
    }

    const cleanItems = items.map((i: { productId: string; quantity: number }) => ({
      productId: String(i.productId),
      quantity: Math.max(1, Number(i.quantity) || 1)
    }));

    const updated = await saveUserCart(req.user._id, cleanItems);
    res.json({ message: 'Cart synchronized.', cart: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to synchronize cart.' });
  }
});

export default router;
