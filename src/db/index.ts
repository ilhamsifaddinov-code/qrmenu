import { neon } from '@neondatabase/serverless';
import { FoodItem, Order, WaiterCall, AppSettings } from '../types';
import { initialFoodItems } from '../data/mockData';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_echtZN2TL3Hz@ep-green-haze-bdwhgt4v-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connectionString);

// Cache in-memory to survive momentary network hiccups
let cachedFoods: FoodItem[] = [...initialFoodItems];
let cachedOrders: Order[] = [];
let cachedCalls: WaiterCall[] = [];
let cachedTables: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
let cachedSettings: AppSettings = {
  telegramUsername: 'sifaddinov',
  instagramUsername: 'sifaddinovv',
};

// ==========================================
// FOODS
// ==========================================
export async function getFoods(): Promise<FoodItem[]> {
  try {
    const rows = await sql`SELECT data FROM foods ORDER BY created_at ASC;`;
    if (rows && rows.length > 0) {
      cachedFoods = rows.map((r: any) => r.data as FoodItem);
    }
    return cachedFoods;
  } catch (err) {
    console.error('[NEON DB] Failed to fetch foods, using cache:', err);
    return cachedFoods;
  }
}

export async function addFood(item: FoodItem): Promise<FoodItem> {
  try {
    await sql`
      INSERT INTO foods (id, category, price, data)
      VALUES (${item.id}, ${item.category || 'other'}, ${item.price || 0}, ${JSON.stringify(item)})
      ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        data = EXCLUDED.data,
        updated_at = NOW();
    `;
    cachedFoods = [item, ...cachedFoods.filter((f) => f.id !== item.id)];
    return item;
  } catch (err) {
    console.error('[NEON DB] Failed to add food:', err);
    throw err;
  }
}

export async function updateFood(id: string, updated: Partial<FoodItem>): Promise<FoodItem | null> {
  try {
    const existing = await sql`SELECT data FROM foods WHERE id = ${id} LIMIT 1;`;
    let currentData: FoodItem | undefined =
      existing && existing.length > 0
        ? (existing[0].data as FoodItem)
        : cachedFoods.find((f) => f.id === id) || initialFoodItems.find((f) => f.id === id);

    const merged: FoodItem = {
      ...(currentData || initialFoodItems[0]),
      ...updated,
      id,
    } as FoodItem;

    await sql`
      INSERT INTO foods (id, category, price, data)
      VALUES (${id}, ${merged.category || 'other'}, ${merged.price || 0}, ${JSON.stringify(merged)})
      ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        data = EXCLUDED.data,
        updated_at = NOW();
    `;
    cachedFoods = cachedFoods.map((f) => (f.id === id ? merged : f));
    if (!cachedFoods.some((f) => f.id === id)) {
      cachedFoods.push(merged);
    }
    return merged;
  } catch (err) {
    console.error('[NEON DB] Failed to update food:', err);
    throw err;
  }
}

export async function deleteFood(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM foods WHERE id = ${id};`;
    cachedFoods = cachedFoods.filter((f) => f.id !== id);
    return true;
  } catch (err) {
    console.error('[NEON DB] Failed to delete food:', err);
    throw err;
  }
}

// ==========================================
// ORDERS
// ==========================================
export async function getOrders(): Promise<Order[]> {
  try {
    const rows = await sql`SELECT data FROM orders ORDER BY created_at DESC;`;
    if (rows) {
      cachedOrders = rows.map((r: any) => r.data as Order);
    }
    return cachedOrders;
  } catch (err) {
    console.error('[NEON DB] Failed to fetch orders, using cache:', err);
    return cachedOrders;
  }
}

export async function createOrder(order: Order): Promise<Order> {
  try {
    const existing = await sql`SELECT data FROM orders WHERE id = ${order.id} LIMIT 1;`;
    if (existing && existing.length > 0) {
      return existing[0].data as Order;
    }

    await sql`
      INSERT INTO orders (id, table_number, total_amount, status, data)
      VALUES (
        ${order.id},
        ${String(order.tableNumber)},
        ${Number(order.totalAmount || 0)},
        ${order.status || 'preparing'},
        ${JSON.stringify(order)}
      )
      ON CONFLICT (id) DO NOTHING;
    `;
    cachedOrders = [order, ...cachedOrders.filter((o) => o.id !== order.id)];
    return order;
  } catch (err) {
    console.error('[NEON DB] Failed to create order:', err);
    throw err;
  }
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  try {
    const existing = await sql`SELECT data FROM orders WHERE id = ${id} LIMIT 1;`;
    if (!existing || existing.length === 0) return null;
    const currentOrder = existing[0].data as Order;
    currentOrder.status = status;

    await sql`
      UPDATE orders
      SET status = ${status},
          data = ${JSON.stringify(currentOrder)},
          updated_at = NOW()
      WHERE id = ${id};
    `;
    cachedOrders = cachedOrders.map((o) => (o.id === id ? currentOrder : o));
    return currentOrder;
  } catch (err) {
    console.error('[NEON DB] Failed to update order status:', err);
    throw err;
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM orders WHERE id = ${id};`;
    cachedOrders = cachedOrders.filter((o) => o.id !== id);
    return true;
  } catch (err) {
    console.error('[NEON DB] Failed to delete order:', err);
    throw err;
  }
}

// ==========================================
// WAITER CALLS
// ==========================================
export async function getWaiterCalls(): Promise<WaiterCall[]> {
  try {
    const rows = await sql`SELECT data FROM waiter_calls ORDER BY created_at DESC;`;
    if (rows) {
      cachedCalls = rows.map((r: any) => r.data as WaiterCall);
    }
    return cachedCalls;
  } catch (err) {
    console.error('[NEON DB] Failed to fetch waiter calls, using cache:', err);
    return cachedCalls;
  }
}

export async function createWaiterCall(call: WaiterCall): Promise<WaiterCall> {
  try {
    await sql`
      INSERT INTO waiter_calls (id, table_number, type, status, timestamp, data)
      VALUES (
        ${call.id},
        ${String(call.tableNumber)},
        ${call.type || 'waiter'},
        ${call.status || 'active'},
        ${call.timestamp || '12:00'},
        ${JSON.stringify(call)}
      )
      ON CONFLICT (id) DO NOTHING;
    `;
    cachedCalls = [call, ...cachedCalls.filter((c) => c.id !== call.id)];
    return call;
  } catch (err) {
    console.error('[NEON DB] Failed to create waiter call:', err);
    throw err;
  }
}

export async function resolveWaiterCall(id: string): Promise<WaiterCall | null> {
  try {
    const existing = await sql`SELECT data FROM waiter_calls WHERE id = ${id} LIMIT 1;`;
    if (!existing || existing.length === 0) return null;
    const currentCall = existing[0].data as WaiterCall;
    currentCall.status = 'resolved';

    await sql`
      UPDATE waiter_calls
      SET status = 'resolved',
          data = ${JSON.stringify(currentCall)},
          updated_at = NOW()
      WHERE id = ${id};
    `;
    cachedCalls = cachedCalls.map((c) => (c.id === id ? currentCall : c));
    return currentCall;
  } catch (err) {
    console.error('[NEON DB] Failed to resolve waiter call:', err);
    throw err;
  }
}

export async function resolveWaiterCallsByTable(
  tableNumber: string,
  callType: string = 'waiter'
): Promise<WaiterCall[]> {
  try {
    const isWaiterType = callType === 'waiter' || callType === 'call_waiter';
    const rows = await sql`
      SELECT id, data FROM waiter_calls
      WHERE table_number = ${String(tableNumber)}
        AND (status = 'active' OR status = 'pending')
        AND (
          (${isWaiterType} = TRUE AND (type = 'waiter' OR type = 'call_waiter'))
          OR type = ${callType}
        );
    `;

    const resolvedList: WaiterCall[] = [];
    if (rows && rows.length > 0) {
      for (const r of rows) {
        const item = (typeof r.data === 'string' ? JSON.parse(r.data) : r.data) as WaiterCall;
        item.status = 'resolved';
        resolvedList.push(item);
        await sql`
          UPDATE waiter_calls
          SET status = 'resolved',
              data = ${JSON.stringify(item)},
              updated_at = NOW()
          WHERE id = ${r.id};
        `;
      }
    }

    cachedCalls = cachedCalls.map((c) => {
      if (
        String(c.tableNumber) === String(tableNumber) &&
        (c.status === 'active' || (c as any).status === 'pending') &&
        ((isWaiterType && (c.type === 'waiter' || (c as any).type === 'call_waiter')) || c.type === callType)
      ) {
        return { ...c, status: 'resolved' as const };
      }
      return c;
    });

    return resolvedList;
  } catch (err) {
    console.error('[NEON DB] Failed to batch resolve waiter calls by table:', err);
    throw err;
  }
}

export async function deleteWaiterCall(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM waiter_calls WHERE id = ${id};`;
    cachedCalls = cachedCalls.filter((c) => c.id !== id);
    return true;
  } catch (err) {
    console.error('[NEON DB] Failed to delete waiter call:', err);
    throw err;
  }
}

// ==========================================
// TABLES (CAFE TABLES IN NEON DB)
// ==========================================
export async function getTables(): Promise<string[]> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS cafe_tables (
        table_number TEXT PRIMARY KEY,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    const rows = await sql`
      SELECT table_number 
      FROM cafe_tables 
      ORDER BY sort_order ASC, created_at ASC;
    `;
    if (rows && rows.length > 0) {
      cachedTables = rows.map((r: any) => String(r.table_number));
    } else {
      const defaults = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      for (let i = 0; i < defaults.length; i++) {
        await sql`
          INSERT INTO cafe_tables (table_number, sort_order)
          VALUES (${defaults[i]}, ${i + 1})
          ON CONFLICT (table_number) DO NOTHING;
        `;
      }
      cachedTables = defaults;
    }
    return cachedTables;
  } catch (err) {
    console.error('[NEON DB] Failed to fetch tables, using cache:', err);
    return cachedTables;
  }
}

export async function addTable(tableNumber: string): Promise<string[]> {
  const trimmed = tableNumber.trim();
  if (!trimmed) return cachedTables;
  try {
    const num = parseInt(trimmed);
    const sortOrder = !isNaN(num) ? num : 999;
    await sql`
      INSERT INTO cafe_tables (table_number, sort_order)
      VALUES (${trimmed}, ${sortOrder})
      ON CONFLICT (table_number) DO NOTHING;
    `;
    return await getTables();
  } catch (err) {
    console.error('[NEON DB] Failed to add table:', err);
    if (!cachedTables.includes(trimmed)) {
      cachedTables.push(trimmed);
    }
    return cachedTables;
  }
}

export async function deleteTable(tableNumber: string): Promise<string[]> {
  const trimmed = tableNumber.trim();
  try {
    await sql`DELETE FROM cafe_tables WHERE table_number = ${trimmed};`;
    cachedTables = cachedTables.filter((t) => t !== trimmed);
    return cachedTables;
  } catch (err) {
    console.error('[NEON DB] Failed to delete table:', err);
    cachedTables = cachedTables.filter((t) => t !== trimmed);
    return cachedTables;
  }
}

export async function setTablesBatch(tablesList: string[]): Promise<string[]> {
  const cleaned = Array.from(new Set(tablesList.map((t) => String(t).trim()).filter(Boolean)));
  if (cleaned.length === 0) return cachedTables;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS cafe_tables (
        table_number TEXT PRIMARY KEY,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`DELETE FROM cafe_tables;`;
    for (let i = 0; i < cleaned.length; i++) {
      const tbl = cleaned[i];
      const num = parseInt(tbl);
      const sortOrder = !isNaN(num) ? num : i + 1;
      await sql`
        INSERT INTO cafe_tables (table_number, sort_order)
        VALUES (${tbl}, ${sortOrder})
        ON CONFLICT (table_number) DO NOTHING;
      `;
    }
    cachedTables = cleaned;
    return cachedTables;
  } catch (err) {
    console.error('[NEON DB] Failed to save tables batch:', err);
    cachedTables = cleaned;
    return cachedTables;
  }
}

// ==========================================
// SETTINGS (TELEGRAM & INSTAGRAM LINKS)
// ==========================================
export async function getSettings(): Promise<AppSettings> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;
    const rows = await sql`SELECT key, value FROM settings;`;
    if (rows && rows.length > 0) {
      const res: AppSettings = { ...cachedSettings };
      rows.forEach((r: any) => {
        if (r.key === 'telegram_username') res.telegramUsername = r.value;
        if (r.key === 'instagram_username') res.instagramUsername = r.value;
      });
      cachedSettings = res;
    }
    return cachedSettings;
  } catch (err) {
    console.error('[NEON DB] Failed to fetch settings, using cache:', err);
    return cachedSettings;
  }
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;
    if (settings.telegramUsername !== undefined) {
      const cleanTg = settings.telegramUsername
        .replace(/^https?:\/\/(www\.)?t\.me\//i, '')
        .replace(/^https?:\/\/(www\.)?telegram\.me\//i, '')
        .replace(/^t\.me\//i, '')
        .replace(/^@/, '')
        .replace(/\/$/, '')
        .trim();
      await sql`
        INSERT INTO settings (key, value)
        VALUES ('telegram_username', ${cleanTg})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `;
      cachedSettings.telegramUsername = cleanTg;
    }
    if (settings.instagramUsername !== undefined) {
      const cleanInsta = settings.instagramUsername
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
        .replace(/^instagram\.com\//i, '')
        .replace(/^@/, '')
        .replace(/\/$/, '')
        .trim();
      await sql`
        INSERT INTO settings (key, value)
        VALUES ('instagram_username', ${cleanInsta})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `;
      cachedSettings.instagramUsername = cleanInsta;
    }
    return cachedSettings;
  } catch (err) {
    console.error('[NEON DB] Failed to update settings:', err);
    throw err;
  }
}

// ==========================================
// FAST SYNC (POLLING)
// ==========================================
export async function getSyncData() {
  try {
    const [ordersRows, callsRows, foodsRows, settingsRows, tablesRows] = await Promise.all([
      sql`SELECT data FROM orders ORDER BY created_at DESC;`,
      sql`SELECT data FROM waiter_calls ORDER BY created_at DESC;`,
      sql`SELECT data FROM foods ORDER BY created_at ASC;`,
      sql`SELECT key, value FROM settings;`.catch(() => []),
      sql`SELECT table_number FROM cafe_tables ORDER BY sort_order ASC, created_at ASC;`.catch(() => []),
    ]);

    const orders = ordersRows.map((r: any) => r.data as Order);
    const waiterCalls = callsRows.map((r: any) => r.data as WaiterCall);
    const foods =
      foodsRows.length > 0
        ? foodsRows.map((r: any) => r.data as FoodItem)
        : initialFoodItems;

    if (settingsRows && settingsRows.length > 0) {
      settingsRows.forEach((r: any) => {
        if (r.key === 'telegram_username') cachedSettings.telegramUsername = r.value;
        if (r.key === 'instagram_username') cachedSettings.instagramUsername = r.value;
      });
    }

    if (tablesRows && tablesRows.length > 0) {
      cachedTables = tablesRows.map((r: any) => String(r.table_number));
    }

    cachedOrders = orders;
    cachedCalls = waiterCalls;
    cachedFoods = foods;

    return {
      orders,
      waiterCalls,
      foods,
      settings: cachedSettings,
      tables: cachedTables,
      serverTime: Date.now(),
    };
  } catch (err) {
    console.error('[NEON DB] Failed to get sync data, using cache:', err);
    return {
      orders: cachedOrders,
      waiterCalls: cachedCalls,
      foods: cachedFoods,
      settings: cachedSettings,
      tables: cachedTables,
      serverTime: Date.now(),
    };
  }
}

// ==========================================
// IMAGES (UPLOADED FROM LAPTOP / MOBILE)
// ==========================================
export async function saveImage(id: string, mimeType: string, base64Data: string): Promise<string> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        mime_type TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`
      INSERT INTO images (id, mime_type, data)
      VALUES (${id}, ${mimeType}, ${base64Data})
      ON CONFLICT (id) DO UPDATE SET
        mime_type = EXCLUDED.mime_type,
        data = EXCLUDED.data,
        created_at = NOW();
    `;
    return `/api/images/${id}`;
  } catch (err) {
    console.error('[NEON DB] Failed to save image:', err);
    throw err;
  }
}

export async function getImage(id: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        mime_type TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    const rows = await sql`SELECT mime_type, data FROM images WHERE id = ${id} LIMIT 1;`;
    if (rows && rows.length > 0) {
      return {
        mimeType: rows[0].mime_type,
        data: rows[0].data,
      };
    }
    return null;
  } catch (err) {
    console.error('[NEON DB] Failed to get image:', err);
    return null;
  }
}
