/**
 * RAPIDSOLVE Contact Backend — Contact & Admin Routes
 *
 * Public Endpoints:
 *   POST   /api/contact                 — Submit contact enquiry
 *   POST   /api/admin/login             — Admin authentication login
 *
 * Protected Admin Endpoints:
 *   GET    /api/contact                 — List enquiries (with search, filter, stats)
 *   GET    /api/contact/:id             — View single enquiry detail
 *   PATCH  /api/contact/:id/status      — Update enquiry status (read/unread)
 *   DELETE /api/contact/:id             — Delete enquiry
 */

const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { requireAdmin, getAdminConfig } = require('../middleware/authMiddleware');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Sanitize string: trim and strip HTML tags */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/<[^>]*>/g, '');
}

/** Validate email format */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate phone format */
function isValidPhone(phone) {
  if (!phone) return true; // optional
  return /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
}

// ─── POST /api/admin/login (Admin Auth) ───────────────────────────────────────

router.post('/admin/login', (req, res) => {
  try {
    const config = getAdminConfig();

    if (!config.isConfigured) {
      return res.status(500).json({
        success: false,
        message: 'Server security error: Admin authentication is not configured in production.',
        errors: ['Admin credentials must be set via environment variables in production.']
      });
    }

    const { email, password } = req.body || {};

    if (email && password && email === config.email && password === config.password) {
      return res.json({
        success: true,
        message: 'Admin authentication successful',
        token: config.token,
        admin: { email: config.email, role: 'admin' }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      errors: ['Invalid admin credentials.']
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      errors: ['Internal server error.']
    });
  }
});

// ─── POST /api/contact (Public Form Submission) ───────────────────────────────

router.post('/', (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Malformed request body.',
        errors: ['Request body must be a valid JSON object.']
      });
    }

    // 1. Extract & sanitize fields
    const name    = sanitize(req.body.name    || '');
    const email   = sanitize(req.body.email   || '');
    const phone   = sanitize(req.body.phone   || '');
    const company = sanitize(req.body.company || '');
    const subject = sanitize(req.body.subject || req.body.service || 'General Inquiry');
    const message = sanitize(req.body.message || '');
    const ip      = req.ip || req.connection?.remoteAddress || '';

    // 2. Backend validation
    const errors = [];
    if (!name)                         errors.push('Name is required.');
    if (name.length > 120)             errors.push('Name is too long (max 120 chars).');
    if (!email)                        errors.push('Email is required.');
    if (email && !isValidEmail(email)) errors.push('Please provide a valid email address.');
    if (email.length > 254)            errors.push('Email is too long.');
    if (!message)                      errors.push('Message is required.');
    if (message && message.length < 5) errors.push('Message is too short (min 5 characters).');
    if (message.length > 5000)         errors.push('Message is too long (max 5000 chars).');
    if (!isValidPhone(phone))          errors.push('Phone number format is invalid.');
    if (company.length > 120)          errors.push('Company name is too long.');

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors
      });
    }

    // 3. Insert with parameterized query
    const db   = getDb();
    const stmt = db.prepare(`
      INSERT INTO contact_messages (name, email, phone, company, subject, message, status, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, 'unread', ?)
    `);

    const result = stmt.run(
      name,
      email,
      phone   || null,
      company || null,
      subject || null,
      message,
      ip
    );

    console.log(`[Contact] New enquiry #${result.lastInsertRowid} from ${email}`);

    return res.status(201).json({
      success: true,
      message: 'Contact enquiry submitted successfully',
      id: result.lastInsertRowid
    });

  } catch (err) {
    console.error('[Contact] Error storing enquiry:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      errors: ['Internal server error.']
    });
  }
});

// ─── GET /api/contact (Protected Admin List with Search & Filter) ─────────────

router.get('/', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const statusFilter = sanitize(req.query.status || 'all').toLowerCase();
    const search = sanitize(req.query.search || '').trim();

    // Query stats
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM contact_messages').get().count;
    const unreadCount = db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'").get().count;
    const readCount = db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'read'").get().count;

    // Build dynamic SQL query with parameterized conditions
    let query = 'SELECT id, name, email, phone, company, subject, message, status, created_at FROM contact_messages';
    const conditions = [];
    const params = [];

    if (statusFilter === 'unread' || statusFilter === 'read') {
      conditions.push('status = ?');
      params.push(statusFilter);
    }

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR company LIKE ? OR subject LIKE ? OR message LIKE ?)');
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern, pattern);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id DESC';

    const rows = db.prepare(query).all(...params);

    return res.json({
      success: true,
      count: rows.length,
      stats: {
        total: totalCount,
        unread: unreadCount,
        read: readCount
      },
      enquiries: rows
    });
  } catch (err) {
    console.error('[Admin] Error fetching contact enquiries:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving contact enquiries.',
      errors: ['Internal server error.']
    });
  }
});

// ─── GET /api/contact/:id (Protected Admin Single Enquiry Detail) ─────────────

router.get('/:id', requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID.',
        errors: ['ID must be a positive integer.']
      });
    }

    const db = getDb();
    const row = db.prepare(`
      SELECT id, name, email, phone, company, subject, message, status, created_at, ip_address
      FROM contact_messages
      WHERE id = ?
    `).get(id);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
        errors: [`No enquiry found with ID ${id}.`]
      });
    }

    return res.json({
      success: true,
      enquiry: row
    });
  } catch (err) {
    console.error('[Admin] Error fetching enquiry detail:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving enquiry details.',
      errors: ['Internal server error.']
    });
  }
});

// ─── PATCH /api/contact/:id/status (Protected Admin Toggle Status) ────────────

router.patch('/:id/status', requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const status = sanitize(req.body.status || '').toLowerCase();

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID.',
        errors: ['ID must be a positive integer.']
      });
    }

    if (status !== 'read' && status !== 'unread') {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'read' or 'unread'.",
        errors: ["Invalid status value."]
      });
    }

    const db = getDb();
    const info = db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, id);

    if (info.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
        errors: [`No enquiry found with ID ${id}.`]
      });
    }

    return res.json({
      success: true,
      message: `Enquiry #${id} marked as ${status}.`,
      status
    });
  } catch (err) {
    console.error('[Admin] Error updating enquiry status:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating enquiry status.',
      errors: ['Internal server error.']
    });
  }
});

// Backward compatibility alias for PATCH /api/contact/:id
router.patch('/:id', requireAdmin, (req, res, next) => {
  req.url = `/${req.params.id}/status`;
  router.handle(req, res, next);
});

// ─── DELETE /api/contact/:id (Protected Admin Delete Enquiry) ─────────────────

router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID.',
        errors: ['ID must be a positive integer.']
      });
    }

    const db = getDb();
    const info = db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);

    if (info.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
        errors: [`No enquiry found with ID ${id}.`]
      });
    }

    return res.json({
      success: true,
      message: `Enquiry #${id} deleted successfully.`
    });
  } catch (err) {
    console.error('[Admin] Error deleting enquiry:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting enquiry.',
      errors: ['Internal server error.']
    });
  }
});

module.exports = router;
