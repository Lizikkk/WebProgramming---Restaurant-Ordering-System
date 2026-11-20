const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./src/config/db'); // <-- updated path

async function seed() {
  console.log('Reading schema.sql...');
  const schemaPath = path.join(__dirname, '../database/schema.sql'); // <-- updated path
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
  const customerInfo = insertUser.run('Jane Customer', 'customer@test.com', customerHash, 'customer');
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

  const garlicBread = insertMenuItem.run(startersId, 'Garlic Bread', 'Toasted sourdough with herb butter', 5.50, 1).lastInsertRowid;
  insertMenuItem.run(startersId, 'Crispy Calamari', 'Served with lemon aioli', 9.00, 1);

  const burger = insertMenuItem.run(mainsId, 'Classic Cheeseburger', 'Beef patty, cheddar, lettuce, house sauce', 14.50, 1).lastInsertRowid;
  insertMenuItem.run(mainsId, 'Margherita Pizza', 'Fresh mozzarella, basil, tomato sauce', 13.00, 1);
  insertMenuItem.run(mainsId, 'Truffle Pasta', 'Tagliatelle in creamy mushroom sauce (Sold Out)', 16.00, 0); // Hidden item example

  const cola = insertMenuItem.run(drinksId, 'Cola Zero', '330ml chilled can', 2.50, 1).lastInsertRowid;
  insertMenuItem.run(drinksId, 'Fresh Lemonade', 'House-squeezed mint lemonade', 4.00, 1);

  // 4. Seed Sample Order + Order Items (Many-to-Many)
  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_id, status, total_price)
    VALUES (?, ?, ?)
  `);
  const orderId = insertOrder.run(customerId, 'Preparing', 22.50).lastInsertRowid;

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
    VALUES (?, ?, ?, ?)
  `);
  insertOrderItem.run(orderId, burger, 1, 14.50);
  insertOrderItem.run(orderId, garlicBread, 1, 5.50);
  insertOrderItem.run(orderId, cola, 1, 2.50);

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