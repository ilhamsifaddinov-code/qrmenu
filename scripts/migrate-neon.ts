import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { initialFoodItems } from '../src/data/mockData';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_echtZN2TL3Hz@ep-green-haze-bdwhgt4v-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function migrate() {
  console.log('Connecting to Neon PostgreSQL...');
  const sql = neon(connectionString);

  console.log('1. Creating tables...');
  await sql`
    CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY,
      category TEXT,
      price NUMERIC,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      table_number TEXT NOT NULL,
      total_amount NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'preparing',
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS waiter_calls (
      id TEXT PRIMARY KEY,
      table_number TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'waiter',
      status TEXT NOT NULL DEFAULT 'active',
      timestamp TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `;

  console.log('Tables created or already exist.');

  // Load existing data from cafe_data.json if present
  let existingFoods = initialFoodItems;
  let existingOrders: any[] = [];
  let existingCalls: any[] = [];

  const dataFilePath = path.join(process.cwd(), 'cafe_data.json');
  if (fs.existsSync(dataFilePath)) {
    try {
      const content = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
      if (Array.isArray(content.foods) && content.foods.length > 0) {
        existingFoods = content.foods;
      }
      if (Array.isArray(content.orders)) {
        existingOrders = content.orders;
      }
      if (Array.isArray(content.waiterCalls)) {
        existingCalls = content.waiterCalls;
      }
    } catch (e) {
      console.warn('Could not parse cafe_data.json:', e);
    }
  }

  // Check if foods table is empty
  const foodCountRes = await sql`SELECT count(*) FROM foods;`;
  const foodCount = Number(foodCountRes[0]?.count || 0);
  console.log(`Current food count in Neon DB: ${foodCount}`);

  if (foodCount === 0) {
    console.log(`Seeding ${existingFoods.length} foods into Neon DB...`);
    for (const food of existingFoods) {
      await sql`
        INSERT INTO foods (id, category, price, data)
        VALUES (${food.id}, ${food.category || 'other'}, ${food.price || 0}, ${JSON.stringify(food)})
        ON CONFLICT (id) DO UPDATE SET
          category = EXCLUDED.category,
          price = EXCLUDED.price,
          data = EXCLUDED.data,
          updated_at = NOW();
      `;
    }
    console.log('Foods seeded successfully!');
  }

  // Check if orders table is empty
  const orderCountRes = await sql`SELECT count(*) FROM orders;`;
  const orderCount = Number(orderCountRes[0]?.count || 0);
  console.log(`Current order count in Neon DB: ${orderCount}`);

  if (orderCount === 0 && existingOrders.length > 0) {
    console.log(`Seeding ${existingOrders.length} existing orders into Neon DB...`);
    for (const order of existingOrders) {
      if (order && order.id) {
        await sql`
          INSERT INTO orders (id, table_number, total_amount, status, data)
          VALUES (
            ${order.id},
            ${String(order.tableNumber || '1')},
            ${Number(order.totalAmount || 0)},
            ${order.status || 'preparing'},
            ${JSON.stringify(order)}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }
    console.log('Orders seeded successfully!');
  }

  // Check if waiter calls table is empty
  const callCountRes = await sql`SELECT count(*) FROM waiter_calls;`;
  const callCount = Number(callCountRes[0]?.count || 0);
  console.log(`Current waiter call count in Neon DB: ${callCount}`);

  if (callCount === 0 && existingCalls.length > 0) {
    console.log(`Seeding ${existingCalls.length} existing waiter calls into Neon DB...`);
    for (const call of existingCalls) {
      if (call && call.id) {
        await sql`
          INSERT INTO waiter_calls (id, table_number, type, status, timestamp, data)
          VALUES (
            ${call.id},
            ${String(call.tableNumber || '1')},
            ${call.type || 'waiter'},
            ${call.status || 'active'},
            ${call.timestamp || '12:00'},
            ${JSON.stringify(call)}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }
    console.log('Waiter calls seeded successfully!');
  }

  console.log('\nMigration to Neon PostgreSQL completed successfully!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
