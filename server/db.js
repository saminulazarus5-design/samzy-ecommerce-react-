// server/db.js
// Central database connection + schema definition.
// Uses better-sqlite3 -> data is persisted to server/data/samzy.db (a real SQL database file).
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "samzy.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  price INTEGER NOT NULL,
  compare_price INTEGER,
  image TEXT,
  gallery TEXT,          -- JSON array of image urls
  description TEXT,
  specs TEXT,             -- JSON object
  variants TEXT,          -- JSON: {colors:[], storage:[]}
  stock INTEGER NOT NULL DEFAULT 0,
  rating REAL DEFAULT 4.5,
  reviews_count INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  badge TEXT,              -- 'New' | 'Hot' | ''
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL DEFAULT 5000,
  total INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'card',
  payment_status TEXT NOT NULL DEFAULT 'pending',   -- pending | paid | failed
  order_status TEXT NOT NULL DEFAULT 'processing',  -- processing|packed|shipped|delivered|cancelled
  paystack_reference TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER,
  name TEXT NOT NULL,
  image TEXT,
  variant TEXT,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
`);

module.exports = db;
