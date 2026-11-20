const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const VALID_ROLES = ['customer', 'staff', 'admin'];

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim() || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, 'customer')
    `).run(name.trim(), normalizedEmail, passwordHash);

    const newUser = {
      id: result.lastInsertRowid,
      name: name.trim(),
      email: normalizedEmail,
      role: 'customer',
    };

    const token = jwt.sign(newUser, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ user: newUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ user: payload, token });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user });
});

// GET /api/auth/users (Admin only - list all users)
router.get('/users', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC').all();
  res.json(users);
});

// PATCH /api/auth/users/:id/role (Admin only - change user role)
router.patch('/users/:id/role', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { role } = req.body;
  const targetId = Number(req.params.id);

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` });
  }

  if (targetId === req.user.id) {
    return res.status(400).json({ error: 'You cannot change your own role.' });
  }

  const result = db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, targetId);
  if (result.changes === 0) return res.status(404).json({ error: 'User not found.' });

  const updated = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(targetId);
  res.json(updated);
});

module.exports = router;