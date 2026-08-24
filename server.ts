import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Persistence file
const DATA_FILE = path.join(process.cwd(), 'cafe_data.json');

interface StoredData {
  orders: any[];
  waiterCalls: any[];
  foods?: any[];
}

function loadData(): StoredData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read data file, using defaults:', err);
  }
  return {
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
  };
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
    foods: db.foods || null,
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

// --- FOODS SYNC API ---
app.get('/api/foods', (req, res) => {
  res.json(db.foods || []);
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
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Qaraqalpaq Menu Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
