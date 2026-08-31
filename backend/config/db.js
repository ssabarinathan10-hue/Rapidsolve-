/**
 * RAPIDSOLVE Contact Backend — Database Configuration
 * Uses better-sqlite3 (same pattern as RouteVerse backend).
 * DB file stored at: backend/data/rapidsolve.db
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Configurable database path (supports persistent disk mount in production via DB_PATH)
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'rapidsolve.db');
const DB_DIR  = path.dirname(DB_PATH);

// Ensure the data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

/**
 * Create the contact_messages table if it does not already exist.
 * Parameterized pattern — no raw string interpolation with user data.
 */
function initDb() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL,
      phone       TEXT,
      company     TEXT,
      subject     TEXT,
      message     TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'unread',
      ip_address  TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('[SQLite] contact_messages table ready.');
  console.log(`[SQLite] Database at: ${DB_PATH}`);
}

module.exports = { getDb, initDb };
