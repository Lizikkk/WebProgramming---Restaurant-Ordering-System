
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./src/config/db');

async function seed() {
  console.log('Reading schema.sql...');

  const schemaPath = path.join(__dirname, '../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema to create tables
  db.exec(schema);
  console.log('Tables created successfully.');

  // Hash passwords for test accounts
  const saltRounds = 10;
  const adminHash = await bcrypt.hash('admin123', saltRounds);
  const staffHash = await bcrypt.hash('staff123', saltRounds);
  const customerHash = await bcrypt.hash('customer123', saltRounds);

  // 1. Seed Users (1 per role)
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `);

  insertUser.run('Admin User', 'admin@test.com', adminHash, 'admin');
  insertUser.run('Staff Member', 'staff@test.com', staffHash, 'staff');

  const customerInfo = insertUser.run(
    'Jane Customer',
    'customer@test.com',
    customerHash,
    'customer'
  );

  const customerId = customerInfo.lastInsertRowid;

  // 2. Seed Categories
  const insertCategory = db.prepare(`
    INSERT INTO categories (name, display_order)
    VALUES (?, ?)
  `);

  const startersId = insertCategory.run('Starters', 1).lastInsertRowid;
  const mainsId = insertCategory.run('Main Courses', 2).lastInsertRowid;
  const drinksId = insertCategory.run('Drinks', 3).lastInsertRowid;

  // 3. Seed Menu Items
  const insertMenuItem = db.prepare(`
    INSERT INTO menu_items (category_id, name, description, price, is_available)
    VALUES (?, ?, ?, ?, ?)
  `);

  const pkhali = insertMenuItem.run(
    startersId,
    'Assorted Pkhali',
    'Traditional Georgian spinach, beetroot and eggplant spreads with walnuts',
    12.50,
    1
  ).lastInsertRowid;


  const khinkali = insertMenuItem.run(
    mainsId,
    'Khinkali',
    'Traditional Georgian dumplings filled with beef and pork',
    2.00,
    1
  ).lastInsertRowid;

  insertMenuItem.run(
    mainsId,
    'Adjarian Khachapuri',
    'Traditional boat-shaped bread filled with cheese, butter and egg',
    14.00,
    1
  );

  insertMenuItem.run(
    mainsId,
    'Chkmeruli',
    'Roasted chicken served in a creamy garlic sauce',
    16.00,
    0
  );

  const lemonade = insertMenuItem.run(
    drinksId,
    'Tarragon Lemonade',
    'Traditional Georgian tarragon-flavored lemonade',
    2.50,
    1
  ).lastInsertRowid;

  insertMenuItem.run(
    drinksId,
    'Borjomi Mineral Water',
    'Georgian naturally carbonated mineral water',
    4.00,
    1
  );

  // 4. Seed Sample Order + Order Items (Many-to-Many)
  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_id, status, total_price)
    VALUES (?, ?, ?)
  `);

  const orderId = insertOrder.run(
    customerId,
    'Preparing',
    18.50
  ).lastInsertRowid;

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
    VALUES (?, ?, ?, ?)
  `);

  insertOrderItem.run(orderId, khinkali, 1, 2.00);
  insertOrderItem.run(orderId, pkhali, 1, 12.50);
  insertOrderItem.run(orderId, lemonade, 1, 4.00);

  console.log('Database seeded successfully!');
  console.log('Test Accounts:');
  console.log('  Admin:    admin@test.com / admin123');
  console.log('  Staff:    staff@test.com / staff123');
  console.log('  Customer: customer@test.com / customer123');
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
