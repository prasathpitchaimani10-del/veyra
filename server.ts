import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './server/db';
import authRouter from './server/routes/auth';
import productsRouter from './server/routes/products';
import cartRouter from './server/routes/cart';
import ordersRouter from './server/routes/orders';
import adminRouter from './server/routes/admin';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database (MongoDB Atlas or embedded resilient persistence)
await initDatabase();

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', brand: 'Veyra E-Commerce', timestamp: new Date().toISOString() });
});

// Static assets / Vite handler
if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Veyra e-commerce server running on http://0.0.0.0:${PORT}`);
});

export default app;
