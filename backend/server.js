/**
 * RAPIDSOLVE Contact Backend — Express Server
 * Port: 4000  (frontend static server stays on 3000)
 *
 * Endpoints:
 *   POST   /api/contact                — Submit enquiry
 *   GET    /api/admin/enquiries        — List all enquiries
 *   PATCH  /api/admin/enquiries/:id    — Toggle read/unread
 *   DELETE /api/admin/enquiries/:id    — Delete enquiry
 *   GET    /api/health                 — Health check
 */

require('dotenv').config({ path: '.env' });

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const path       = require('path');
const rateLimit  = require('express-rate-limit');
const { initDb } = require('./config/db');

const contactRoutes = require('./routes/contactRoutes');

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── Initialize DB ────────────────────────────────────────────────────────────
initDb();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ─── CORS Configuration ───────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';
const allowedFrontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : '';

app.use(cors({
  origin: function (origin, callback) {
    // Allow same-origin or server-to-server requests without Origin header
    if (!origin) return callback(null, true);

    if (isProduction) {
      if (allowedFrontendUrl && (origin === allowedFrontendUrl || origin === `${allowedFrontendUrl}/`)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Access from specified Origin denied in production.'));
    }

    // Development: allow localhost, 127.0.0.1, local LAN IPs
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: false
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// ─── Rate Limiting — POST /api/contact: 5 per min per IP ─────────────────────
const contactLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,
  message: { success: false, errors: ['Too many requests. Please wait a minute before submitting again.'] },
  standardHeaders: true,
  legacyHeaders: false
});

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ success: true, service: 'RAPIDSOLVE Contact API', port: PORT });
});

// ─── Serve Admin Page ─────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

app.get(['/admin', '/admin.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-enquiries.html'));
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public contact submission with rate limiting
app.post('/api/contact', contactLimiter, (req, res, next) => {
  contactRoutes(req, res, next);
});

// Admin login endpoint
app.post('/api/admin/login', (req, res, next) => {
  req.url = '/admin/login';
  contactRoutes(req, res, next);
});

// All /api/contact routes
app.use('/api/contact', contactRoutes);

// Fallback /api routes (for backward compatibility if needed)
app.use('/api', contactRoutes);

// ─── 404 for Unknown API Routes ───────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, errors: ['API endpoint not found.'] });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    errors: [err.message || 'Internal server error.']
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('══════════════════════════════════════════════════');
  console.log('  RAPIDSOLVE CONTACT BACKEND STARTED              ');
  console.log('══════════════════════════════════════════════════');
  console.log(`  API  → http://localhost:${PORT}/api/contact      `);
  console.log(`  Admin→ http://localhost:${PORT}/admin            `);
  console.log(`  Health→ http://localhost:${PORT}/api/health      `);
  console.log('══════════════════════════════════════════════════');
  console.log('');
});
