import { neon } from '@neondatabase/serverless';
import { FoodItem, Order, WaiterCall } from '../types';
import { initialFoodItems } from '../data/mockData';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_echtZN2TL3Hz@ep-green-haze-bdwhgt4v-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connectionString);

// Cache in-memory to survive momentary network hiccups
let cachedFoods: FoodItem[] = [...initialFoodItems];
let cachedOrders: Order[] = [];
let cachedCalls: WaiterCall[] = [];

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
    if (!existing || existing.length === 0) return null;
    const currentData = existing[0].data as FoodItem;
    const merged: FoodItem = { ...currentData, ...updated, id };

    await sql`
      UPDATE foods
      SET category = ${merged.category || 'other'},
          price = ${merged.price || 0},
          data = ${JSON.stringify(merged)},
          updated_at = NOW()
      WHERE id = ${id};
    `;
    cachedFoods = cachedFoods.map((f) => (f.id === id ? merged : f));
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
// FAST SYNC (POLLING)
// ==========================================
export async function getSyncData() {
  try {
    const [ordersRows, callsRows, foodsRows] = await Promise.all([
      sql`SELECT data FROM orders ORDER BY created_at DESC;`,
      sql`SELECT data FROM waiter_calls ORDER BY created_at DESC;`,
      sql`SELECT data FROM foods ORDER BY created_at ASC;`,
    ]);

    const orders = ordersRows.map((r: any) => r.data as Order);
    const waiterCalls = callsRows.map((r: any) => r.data as WaiterCall);
    const foods =
      foodsRows.length > 0
        ? foodsRows.map((r: any) => r.data as FoodItem)
        : initialFoodItems;

    cachedOrders = orders;
    cachedCalls = waiterCalls;
    cachedFoods = foods;

    return {
      orders,
      waiterCalls,
      foods,
      serverTime: Date.now(),
    };
  } catch (err) {
    console.error('[NEON DB] Failed to get sync data, using cache:', err);
    return {
      orders: cachedOrders,
      waiterCalls: cachedCalls,
      foods: cachedFoods,
      serverTime: Date.now(),
    };
  }
}
