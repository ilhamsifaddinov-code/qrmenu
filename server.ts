import express from 'express';
import path from 'path';
import fs from 'fs';
import * as db from './src/db';
import { initialFoodItems } from './src/data/mockData';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Uploads directory
const UPLOADS_DIR = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(process.cwd(), 'public', 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create uploads dir:', e);
}
app.use('/uploads', express.static(UPLOADS_DIR));

// ==========================================
// API ROUTES (Must be registered before Vite)
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'Neon PostgreSQL',
    time: new Date().toISOString(),
  });
});

// Fast Sync Endpoint for real-time polling across phones and laptops
app.get('/api/sync', async (req, res) => {
  try {
    const data = await db.getSyncData();
    res.json(data);
  } catch (err: any) {
    console.error('Error in /api/sync:', err);
    res.status(500).json({ error: 'Sync failed', details: err?.message });
  }
});

// --- ORDERS API ---
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  const newOrder = req.body;
  if (!newOrder || !newOrder.tableNumber) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  // Ensure unique ID and timestamps
  const order = {
    ...newOrder,
    id: newOrder.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: newOrder.createdAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: newOrder.status || 'preparing',
    timestamp: Date.now(),
  };

  try {
    const saved = await db.createOrder(order);
    console.log(`[ORDER CREATED IN NEON] Table ${saved.tableNumber} - Order ID: ${saved.id} - Total: ${saved.totalAmount} UZS`);
    res.status(201).json(saved);
  } catch (err: any) {
    console.error('Failed to create order:', err);
    res.status(500).json({ error: 'Failed to save order in database' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await db.updateOrderStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updated);
  } catch (err: any) {
    console.error('Failed to update order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteOrder(id);
    res.json({ success: true, message: 'Order removed from Neon' });
  } catch (err: any) {
    console.error('Failed to delete order:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// --- WAITER CALLS API ---
app.get('/api/waiter-calls', async (req, res) => {
  try {
    const calls = await db.getWaiterCalls();
    res.json(calls);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch waiter calls' });
  }
});

app.post('/api/waiter-calls', async (req, res) => {
  const { tableNumber, type } = req.body;
  if (!tableNumber) {
    return res.status(400).json({ error: 'tableNumber is required' });
  }

  const call = {
    id: `call-${Date.now()}`,
    tableNumber: String(tableNumber),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: type || 'waiter',
    status: 'active' as const,
  };

  try {
    const saved = await db.createWaiterCall(call);
    console.log(`[WAITER CALL IN NEON] Table ${saved.tableNumber} - Type: ${saved.type}`);
    res.status(201).json(saved);
  } catch (err: any) {
    console.error('Failed to create waiter call:', err);
    res.status(500).json({ error: 'Failed to save waiter call' });
  }
});

app.patch('/api/waiter-calls/:id/resolve', async (req, res) => {
  const { id } = req.params;
  try {
    const call = await db.resolveWaiterCall(id);
    res.json({ success: true, call });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to resolve waiter call' });
  }
});

app.delete('/api/waiter-calls/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteWaiterCall(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete waiter call' });
  }
});

// --- IMAGE UPLOAD FROM LAPTOP API ---
app.post('/api/upload', (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // data format: "data:image/jpeg;base64,..." or pure base64
    let ext = 'jpg';
    let base64Data = data;
    const match = data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (match) {
      ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      base64Data = match[2];
    } else if (filename && filename.includes('.')) {
      ext = filename.split('.').pop() || 'jpg';
    }

    const uniqueName = `food-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
    const targetFile = path.join(UPLOADS_DIR, uniqueName);
    fs.writeFileSync(targetFile, Buffer.from(base64Data, 'base64'));

    console.log(`[LAPTOP IMAGE UPLOADED] saved as ${uniqueName}`);
    res.json({ success: true, url: `/uploads/${uniqueName}` });
  } catch (err: any) {
    console.error('Failed to save uploaded image:', err);
    res.status(500).json({ error: 'Failed to save image', details: err?.message });
  }
});

// --- FOODS CRUD & SYNC API ---
app.get('/api/foods', async (req, res) => {
  try {
    const foods = await db.getFoods();
    res.json(foods);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
});

app.post('/api/foods', async (req, res) => {
  const item = req.body;
  if (!item || !item.id) {
    return res.status(400).json({ error: 'Invalid food item data' });
  }
  try {
    const saved = await db.addFood(item);
    console.log(`[FOOD ADDED IN NEON] ${item.title?.qr || item.title?.uz || item.id}`);
    res.status(201).json(saved);
  } catch (err: any) {
    console.error('Failed to add food:', err);
    res.status(500).json({ error: 'Failed to save food' });
  }
});

app.put('/api/foods/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await db.updateFood(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    console.log(`[FOOD UPDATED IN NEON] ${id}`);
    res.json(updated);
  } catch (err: any) {
    console.error('Failed to update food:', err);
    res.status(500).json({ error: 'Failed to update food' });
  }
});

app.delete('/api/foods/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteFood(id);
    console.log(`[FOOD DELETED IN NEON] ${id}`);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Failed to delete food:', err);
    res.status(500).json({ error: 'Failed to delete food' });
  }
});

app.post('/api/foods/sync-all', async (req, res) => {
  const foods = req.body;
  if (Array.isArray(foods)) {
    try {
      for (const food of foods) {
        if (food && food.id) {
          await db.addFood(food);
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to sync foods' });
    }
  } else {
    res.status(400).json({ error: 'Expected array of foods' });
  }
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // SPA fallback for all HTML requests
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      // Do not intercept API requests
      if (url.startsWith('/api/')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Qaraqalpaq Menu Server (Neon PostgreSQL) muvaffaqiyatli ishga tushdi:`);
    console.log(`   ➜ Local:    http://localhost:${PORT}/`);
    console.log(`   ➜ Local IP: http://127.0.0.1:${PORT}/`);
    console.log(`   ➜ Tarmoq:   http://0.0.0.0:${PORT}/\n`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`⚠️ Diqqat: Port ${PORT} band! Boshqa port berish uchun PORT=3001 kabi ishga tushiring.`);
    } else {
      console.error('Serverda xatolik yuz berdi:', err);
    }
  });
}

if (process.env.VERCEL !== '1') {
  start().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
