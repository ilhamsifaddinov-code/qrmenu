import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
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

// Persistence file
const BASE_DATA_FILE = path.join(process.cwd(), 'cafe_data.json');
const DATA_FILE = process.env.VERCEL
  ? path.join('/tmp', 'cafe_data.json')
  : BASE_DATA_FILE;

// Seed /tmp data file on Vercel from BASE_DATA_FILE
if (process.env.VERCEL && !fs.existsSync(DATA_FILE) && fs.existsSync(BASE_DATA_FILE)) {
  try {
    fs.copyFileSync(BASE_DATA_FILE, DATA_FILE);
  } catch (e) {
    console.warn('Failed to seed /tmp data file:', e);
  }
}

interface StoredData {
  orders: any[];
  waiterCalls: any[];
  foods?: any[];
}

function loadData(): StoredData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.foods || !Array.isArray(parsed.foods) || parsed.foods.length === 0) {
        parsed.foods = initialFoodItems;
        saveData(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read data file, using defaults:', err);
  }
  const defaultData: StoredData = {
    orders: [],
    waiterCalls: [
      {
        id: 'call-1',
        tableNumber: '02',
        timestamp: '12:30',
        type: 'waiter',
        status: 'active',
      },
    ],
    foods: initialFoodItems,
  };
  saveData(defaultData);
  return defaultData;
}

function saveData(data: StoredData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write data file:', err);
  }
}

let db = loadData();

// ==========================================
// API ROUTES (Must be registered before Vite)
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Fast Sync Endpoint for real-time polling across phones and laptops
app.get('/api/sync', (req, res) => {
  res.json({
    orders: db.orders,
    waiterCalls: db.waiterCalls,
    foods: db.foods || initialFoodItems,
    serverTime: Date.now(),
  });
});

// --- ORDERS API ---
app.get('/api/orders', (req, res) => {
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder || !newOrder.tableNumber) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  // Deduplication: if order with this ID already exists, do not duplicate!
  if (newOrder.id) {
    const existing = db.orders.find((o) => o.id === newOrder.id);
    if (existing) {
      return res.status(200).json(existing);
    }
  }

  // Ensure unique ID and timestamps
  const order = {
    ...newOrder,
    id: newOrder.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: newOrder.createdAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: newOrder.status || 'preparing',
    timestamp: Date.now(),
  };

  db.orders.unshift(order);
  saveData(db);

  console.log(`[ORDER CREATED] Table ${order.tableNumber} - Order ID: ${order.id} - Total: ${order.totalAmount} UZS`);
  res.status(201).json(order);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const orderIndex = db.orders.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.orders[orderIndex].status = status;
  saveData(db);
  res.json(db.orders[orderIndex]);
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  db.orders = db.orders.filter((o) => o.id !== id);
  saveData(db);
  res.json({ success: true, message: 'Order removed' });
});

// --- WAITER CALLS API ---
app.get('/api/waiter-calls', (req, res) => {
  res.json(db.waiterCalls);
});

app.post('/api/waiter-calls', (req, res) => {
  const { tableNumber, type } = req.body;
  if (!tableNumber) {
    return res.status(400).json({ error: 'tableNumber is required' });
  }

  const call = {
    id: `call-${Date.now()}`,
    tableNumber: String(tableNumber),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: type || 'waiter',
    status: 'active',
  };

  db.waiterCalls.unshift(call);
  saveData(db);

  console.log(`[WAITER CALL] Table ${call.tableNumber} - Type: ${call.type}`);
  res.status(201).json(call);
});

app.patch('/api/waiter-calls/:id/resolve', (req, res) => {
  const { id } = req.params;
  const call = db.waiterCalls.find((c) => c.id === id);
  if (call) {
    call.status = 'resolved';
    saveData(db);
  }
  res.json({ success: true, call });
});

app.delete('/api/waiter-calls/:id', (req, res) => {
  const { id } = req.params;
  db.waiterCalls = db.waiterCalls.filter((c) => c.id !== id);
  saveData(db);
  res.json({ success: true });
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
app.get('/api/foods', (req, res) => {
  res.json(db.foods || initialFoodItems);
});

app.post('/api/foods', (req, res) => {
  const item = req.body;
  if (!item || !item.id) {
    return res.status(400).json({ error: 'Invalid food item data' });
  }
  if (!db.foods) db.foods = [...initialFoodItems];
  db.foods.unshift(item);
  saveData(db);
  console.log(`[FOOD ADDED GLOBALLY] ${item.title?.qr || item.title?.uz || item.id}`);
  res.status(201).json(item);
});

app.put('/api/foods/:id', (req, res) => {
  const { id } = req.params;
  const updated = req.body;
  if (!db.foods) db.foods = [...initialFoodItems];
  const idx = db.foods.findIndex((f) => f.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Food item not found' });
  }
  db.foods[idx] = { ...db.foods[idx], ...updated };
  saveData(db);
  console.log(`[FOOD UPDATED GLOBALLY] ${id}`);
  res.json(db.foods[idx]);
});

app.delete('/api/foods/:id', (req, res) => {
  const { id } = req.params;
  if (!db.foods) db.foods = [...initialFoodItems];
  db.foods = db.foods.filter((f) => f.id !== id);
  saveData(db);
  console.log(`[FOOD DELETED GLOBALLY] ${id}`);
  res.json({ success: true, id });
});

app.post('/api/foods/sync-all', (req, res) => {
  const foods = req.body;
  if (Array.isArray(foods)) {
    db.foods = foods;
    saveData(db);
  }
  res.json({ success: true });
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function start() {
  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`\n🚀 Qaraqalpaq Menu Server muvaffaqiyatli ishga tushdi:`);
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
