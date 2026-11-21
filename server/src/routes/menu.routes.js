const express = require('express');
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET (Public sees available items; Admin sees all items)
router.get('/', (req, res) => {
  const showAll = req.query.all === 'true';
  const query = showAll
    ? `SELECT m.*, c.name AS category_name
       FROM menu_items m
       JOIN categories c ON m.category_id = c.id
       ORDER BY c.display_order ASC, m.name ASC`
    : `SELECT m.*, c.name AS category_name
       FROM menu_items m
       JOIN categories c ON m.category_id = c.id
       WHERE m.is_available = 1
       ORDER BY c.display_order ASC, m.name ASC`;

  const items = db.prepare(query).all();
  res.json(items);
});

// POST (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { category_id, name, description, price, image_url, is_available } = req.body;

  if (!category_id || !name || !name.trim() || price === undefined || Number(price) < 0) {
    return res.status(400).json({ error: 'Valid category, name, and non-negative price are required.' });
  }

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(Number(category_id));
  if (!category) {
    return res.status(400).json({ error: 'Selected category does not exist.' });
  }

  const result = db.prepare(`
    INSERT INTO menu_items (category_id, name, description, price, image_url, is_available)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    Number(category_id),
    name.trim(),
    description ? description.trim() : '',
    Number(price),
    image_url ? image_url.trim() : null,
    is_available === false || is_available === 0 ? 0 : 1
  );

  const created = db.prepare(`
    SELECT m.*, c.name AS category_name
    FROM menu_items m
    JOIN categories c ON m.category_id = c.id
    WHERE m.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(created);
});

// PUT (Admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { category_id, name, description, price, image_url, is_available } = req.body;
  const { id } = req.params;

  if (!category_id || !name || !name.trim() || price === undefined || Number(price) < 0) {
    return res.status(400).json({ error: 'Valid category, name, and non-negative price are required.' });
  }

  const result = db.prepare(`
    UPDATE menu_items
    SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, is_available = ?
    WHERE id = ?
  `).run(
    Number(category_id),
    name.trim(),
    description ? description.trim() : '',
    Number(price),
    image_url ? image_url.trim() : null,
    is_available ? 1 : 0,
    Number(id)
  );

  if (result.changes === 0) return res.status(404).json({ error: 'Menu item not found.' });

  const updated = db.prepare(`
    SELECT m.*, c.name AS category_name
    FROM menu_items m
    JOIN categories c ON m.category_id = c.id
    WHERE m.id = ?
  `).get(Number(id));

  res.json(updated);
});

// PATCH (Admin only)
router.patch('/:id/availability', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { is_available } = req.body;
  const { id } = req.params;

  const result = db.prepare('UPDATE menu_items SET is_available = ? WHERE id = ?').run(
    is_available ? 1 : 0,
    Number(id)
  );

  if (result.changes === 0) return res.status(404).json({ error: 'Menu item not found.' });

  const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(Number(id));
  res.json(updated);
});

// DELETE (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM menu_items WHERE id = ?').run(Number(req.params.id));
    if (result.changes === 0) return res.status(404).json({ error: 'Menu item not found.' });
    res.json({ message: 'Menu item deleted.' });
  } catch (err) {
    console.error('Delete menu item error:', err);
    if (err.code && err.code.startsWith('SQLITE_CONSTRAINT')) {
      return res.status(400).json({
        error: 'Cannot delete this dish because it is part of existing orders. Click "Visible (Hide)" to hide it from the menu instead, or delete those orders first.',
      });
    }
    res.status(500).json({ error: `Failed to delete menu item: ${err.message}` });
  }
});

module.exports = router;