const express = require('express');
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET (Public)
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY display_order ASC, id ASC').all();
  res.json(categories);
});

// POST (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { name, display_order = 0 } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  try {
    const result = db.prepare('INSERT INTO categories (name, display_order) VALUES (?, ?)').run(
      name.trim(),
      Number(display_order) || 0
    );
    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Category name already exists.' });
    }
    res.status(500).json({ error: 'Failed to create category.' });
  }
});

// PUT (Admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { name, display_order } = req.body;
  const { id } = req.params;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  try {
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Category not found.' });

    db.prepare('UPDATE categories SET name = ?, display_order = ? WHERE id = ?').run(
      name.trim(),
      display_order !== undefined ? Number(display_order) : existing.display_order,
      id
    );

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Category name already exists.' });
    }
    res.status(500).json({ error: 'Failed to update category.' });
  }
});

// DELETE (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Category not found.' });
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({ error: 'Cannot delete category that still has menu items.' });
    }
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

module.exports = router;