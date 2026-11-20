const express = require('express');
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const VALID_STATUSES = ['New', 'Preparing', 'Ready', 'Delivered'];

function attachOrderItems(orders) {
  const getItems = db.prepare(`
    SELECT oi.id, oi.menu_item_id, m.name, oi.quantity, oi.unit_price
    FROM order_items oi
    JOIN menu_items m ON oi.menu_item_id = m.id
    WHERE oi.order_id = ?
  `);

  return orders.map((order) => ({
    ...order,
    items: getItems.all(order.id),
  }));
}

// GET /api/orders (Customer sees own; Staff & Admin see all)
router.get('/', authenticateToken, (req, res) => {
  let orders;
  if (req.user.role === 'customer') {
    orders = db.prepare(`
      SELECT o.*, u.name AS customer_name
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `).all(req.user.id);
  } else {
    orders = db.prepare(`
      SELECT o.*, u.name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      ORDER BY o.created_at DESC
    `).all();
  }

  res.json(attachOrderItems(orders));
});

// GET /api/orders/:id (Read single order with role ownership check)
router.get('/:id', authenticateToken, (req, res) => {
  const order = db.prepare(`
    SELECT o.*, u.name AS customer_name, u.email AS customer_email
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    WHERE o.id = ?
  `).get(req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (req.user.role === 'customer' && order.customer_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  res.json(attachOrderItems([order])[0]);
});

// POST /api/orders (Customer places an order from cart)
router.post('/', authenticateToken, authorizeRoles('customer'), (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart cannot be empty.' });
  }

  const placeOrderTransaction = db.transaction((customerId, cartItems) => {
    let totalPrice = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      const qty = Number(item.quantity);
      if (!item.menu_item_id || !Number.isInteger(qty) || qty <= 0) {
        throw new Error('Invalid item or quantity in cart.');
      }

      const menuItem = db
        .prepare('SELECT id, name, price, is_available FROM menu_items WHERE id = ?')
        .get(item.menu_item_id);

      if (!menuItem || !menuItem.is_available) {
        throw new Error(`Item "${menuItem ? menuItem.name : item.menu_item_id}" is currently unavailable.`);
      }

      totalPrice += menuItem.price * qty;
      validatedItems.push({
        menu_item_id: menuItem.id,
        quantity: qty,
        unit_price: menuItem.price,
      });
    }

    const orderResult = db.prepare(`
      INSERT INTO orders (customer_id, status, total_price)
      VALUES (?, 'New', ?)
    `).run(customerId, Number(totalPrice.toFixed(2)));

    const orderId = orderResult.lastInsertRowid;
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
      VALUES (?, ?, ?, ?)
    `);

    for (const vItem of validatedItems) {
      insertOrderItem.run(orderId, vItem.menu_item_id, vItem.quantity, vItem.unit_price);
    }

    return orderId;
  });

  try {
    const newOrderId = placeOrderTransaction(req.user.id, items);
    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(newOrderId);
    res.status(201).json(attachOrderItems([createdOrder])[0]);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to place order.' });
  }
});

// PATCH /api/orders/:id/status (Staff & Admin update order status)
router.patch('/:id/status', authenticateToken, authorizeRoles('staff', 'admin'), (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  if (result.changes === 0) return res.status(404).json({ error: 'Order not found.' });

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  res.json(attachOrderItems([updated])[0]);
});

// DELETE /api/orders/:id (Admin deletes any order; Customer cancels own 'New' order)
router.delete('/:id', authenticateToken, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (req.user.role === 'customer') {
    if (order.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden.' });
    }
    if (order.status !== 'New') {
      return res.status(400).json({ error: 'Only orders with status "New" can be cancelled.' });
    }
  } else if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ message: 'Order deleted.' });
});

module.exports = router;