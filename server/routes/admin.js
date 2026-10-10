const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");
const { sign, requireAdmin } = require("../middleware/auth");

const cookieOpts = { httpOnly: true, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 };

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function parseProduct(row) {
  if (!row) return row;
  const safe = (s, f) => { try { return JSON.parse(s); } catch { return f; } };
  return { ...row, gallery: safe(row.gallery, []), specs: safe(row.specs, {}), variants: safe(row.variants, {}) };
}

// ---- Auth ----
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }
  const token = sign({ id: admin.id, username: admin.username, role: "admin" });
  res.cookie("samzy_admin_token", token, cookieOpts);
  res.json({ admin: { id: admin.id, username: admin.username }, token });
});

router.post("/logout", (req, res) => {
  res.clearCookie("samzy_admin_token");
  res.json({ ok: true });
});

// Everything below requires an authenticated admin
router.use(requireAdmin);

// ---- Dashboard stats ----
router.get("/stats", (req, res) => {
  const totalProducts = db.prepare("SELECT COUNT(*) c FROM products").get().c;
  const totalOrders = db.prepare("SELECT COUNT(*) c FROM orders").get().c;
  const pendingOrders = db.prepare("SELECT COUNT(*) c FROM orders WHERE order_status IN ('processing','packed','shipped')").get().c;
  const completedOrders = db.prepare("SELECT COUNT(*) c FROM orders WHERE order_status = 'delivered'").get().c;
  const totalSales = db.prepare("SELECT COALESCE(SUM(total),0) s FROM orders WHERE payment_status = 'paid'").get().s;
  const totalCustomers = db.prepare("SELECT COUNT(*) c FROM customers").get().c;

  const recentOrders = db.prepare(`
    SELECT order_number, full_name, total, payment_status, order_status, created_at
    FROM orders ORDER BY created_at DESC LIMIT 10
  `).all();

  const salesByDay = db.prepare(`
    SELECT date(created_at) as day, COALESCE(SUM(total),0) as sales
    FROM orders WHERE payment_status = 'paid'
    GROUP BY day ORDER BY day DESC LIMIT 14
  `).all().reverse();

  res.json({
    totalProducts, totalOrders, pendingOrders, completedOrders,
    totalSales, totalCustomers, recentOrders, salesByDay
  });
});

// ---- Orders ----
router.get("/orders", (req, res) => {
  const { status, payment_status } = req.query;
  let sql = "SELECT * FROM orders WHERE 1=1";
  const params = {};
  if (status) { sql += " AND order_status = @status"; params.status = status; }
  if (payment_status) { sql += " AND payment_status = @payment_status"; params.payment_status = payment_status; }
  sql += " ORDER BY created_at DESC";
  const orders = db.prepare(sql).all(params);
  res.json({ orders });
});

router.get("/orders/:id", (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
  res.json({ order: { ...order, items } });
});

router.patch("/orders/:id/status", (req, res) => {
  const { order_status } = req.body;
  const valid = ["processing", "packed", "shipped", "delivered", "cancelled"];
  if (!valid.includes(order_status)) return res.status(400).json({ error: "Invalid status" });
  db.prepare("UPDATE orders SET order_status = ? WHERE id = ?").run(order_status, req.params.id);
  res.json({ ok: true });
});

// ---- Products CRUD ----
router.get("/products", (req, res) => {
  const rows = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
  res.json({ products: rows.map(parseProduct) });
});

router.post("/products", (req, res) => {
  const p = req.body;
  if (!p.name || !p.category || !p.brand || p.price == null) {
    return res.status(400).json({ error: "name, category, brand and price are required" });
  }
  const info = db.prepare(`
    INSERT INTO products (name, slug, category, brand, price, compare_price, image, gallery, description, specs, variants, stock, featured, badge)
    VALUES (@name, @slug, @category, @brand, @price, @compare_price, @image, @gallery, @description, @specs, @variants, @stock, @featured, @badge)
  `).run({
    name: p.name,
    slug: slugify(p.name) + "-" + Date.now().toString(36),
    category: p.category,
    brand: p.brand,
    price: p.price,
    compare_price: p.compare_price || null,
    image: p.image || "",
    gallery: JSON.stringify(p.gallery || (p.image ? [p.image] : [])),
    description: p.description || "",
    specs: JSON.stringify(p.specs || {}),
    variants: JSON.stringify(p.variants || {}),
    stock: p.stock || 0,
    featured: p.featured ? 1 : 0,
    badge: p.badge || ""
  });
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ product: parseProduct(row) });
});

router.put("/products/:id", (req, res) => {
  const p = req.body;
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Product not found" });

  db.prepare(`
    UPDATE products SET name=@name, category=@category, brand=@brand, price=@price,
      compare_price=@compare_price, image=@image, gallery=@gallery, description=@description,
      specs=@specs, variants=@variants, stock=@stock, featured=@featured, badge=@badge
    WHERE id=@id
  `).run({
    id: req.params.id,
    name: p.name ?? existing.name,
    category: p.category ?? existing.category,
    brand: p.brand ?? existing.brand,
    price: p.price ?? existing.price,
    compare_price: p.compare_price ?? existing.compare_price,
    image: p.image ?? existing.image,
    gallery: JSON.stringify(p.gallery ?? JSON.parse(existing.gallery || "[]")),
    description: p.description ?? existing.description,
    specs: JSON.stringify(p.specs ?? JSON.parse(existing.specs || "{}")),
    variants: JSON.stringify(p.variants ?? JSON.parse(existing.variants || "{}")),
    stock: p.stock ?? existing.stock,
    featured: p.featured != null ? (p.featured ? 1 : 0) : existing.featured,
    badge: p.badge ?? existing.badge
  });
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  res.json({ product: parseProduct(row) });
});

router.delete("/products/:id", (req, res) => {
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ---- Customers ----
router.get("/customers", (req, res) => {
  const rows = db.prepare("SELECT id, full_name, email, phone, city, state, created_at FROM customers ORDER BY created_at DESC").all();
  res.json({ customers: rows });
});

module.exports = router;
