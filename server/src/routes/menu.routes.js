const express = require('express');
const db = require('../config/db');
const { authenticateToken, optionalAuth, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/menu (Admins see all items; Customers/Guests see only available items)
router.get('/', optionalAuth, (req, res) => {
  const isAdmin = req.user && req.user.role === 'admin';

  const query = isAdmin
    ? `SELECT m.*, c.name AS category_name
       FROM menu_items m
       JOIN categories c ON m.category_id = c.id
       ORDER BY c.display_order ASC, m.id ASC`
    : `SELECT m.*, c.name AS category_name
       FROM menu_items m
       JOIN categories c ON m.category_id = c.id
       WHERE m.is_available = 1
       ORDER BY c.display_order ASC, m.id ASC`;

  const items = db.prepare(query).all();
  res.json(items);
});

// POST /api/menu (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { category_id, name, description = '', price, image_url = '', is_available = 1 } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Menu item name is required.' });
  }
  if (!category_id) {
    return res.status(400).json({ error: 'Category is required.' });
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: 'Price must be a valid non-negative number.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO menu_items (category_id, name, description, price, image_url, is_available)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      Number(category_id),
      name.trim(),
      description.trim(),
      Number(price),
      image_url.trim(),
      is_available ? 1 : 0
    );

    const created = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({ error: 'Selected category does not exist.' });
    }
    res.status(500).json({ error: 'Failed to create menu item.' });
  }
});

// PUT /api/menu/:id (Admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { category_id, name, description, price, image_url, is_available } = req.body;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Menu item not found.' });

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Menu item name is required.' });
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: 'Price must be a valid non-negative number.' });
  }

  try {
    db.prepare(`
      UPDATE menu_items
      SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, is_available = ?
      WHERE id = ?
    `).run(
      category_id !== undefined ? Number(category_id) : existing.category_id,
      name.trim(),
      description !== undefined ? description.trim() : existing.description,
      Number(price),
      image_url !== undefined ? image_url.trim() : existing.image_url,
      is_available !== undefined ? (is_available ? 1 : 0) : existing.is_available,
      id
    );

    const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({ error: 'Selected category does not exist.' });
    }
    res.status(500).json({ error: 'Failed to update menu item.' });
  }
});

// PATCH /api/menu/:id/availability (Admin only - quick toggle to hide/show)
router.patch('/:id/availability', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { is_available } = req.body;
  const { id } = req.params;

  if (typeof is_available !== 'boolean' && is_available !== 0 && is_available !== 1) {
    return res.status(400).json({ error: 'is_available must be true or false.' });
  }

  const result = db.prepare('UPDATE menu_items SET is_available = ? WHERE id = ?').run(
    is_available ? 1 : 0,
    id
  );
  if (result.changes === 0) return res.status(404).json({ error: 'Menu item not found.' });

  const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
  res.json(updated);
});

// DELETE /api/menu/:id (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Menu item not found.' });
    res.json({ message: 'Menu item deleted.' });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({
        error: 'Cannot delete an item that exists in past orders. Mark it as unavailable instead.',
      });
    }
    res.status(500).json({ error: 'Failed to delete menu item.' });
  }
});

module.exports = router;