import { Router, Request, Response } from 'express';
import { getProducts, findProductById } from '../db';

const router = Router();

// GET /api/products/categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const products = await getProducts();
    const categories = Array.from(new Set(products.map((p) => p.category))).sort();
    res.json({ categories: ['All', ...categories] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// GET /api/products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, sortBy, minPrice, maxPrice } = req.query;

    const products = await getProducts({
      search: typeof search === 'string' ? search : undefined,
      category: typeof category === 'string' ? category : undefined,
      sortBy: typeof sortBy === 'string' ? sortBy : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined
    });

    res.json({ products });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await findProductById(id);
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve product details.' });
  }
});

export default router;
