const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");
const { sign, requireAuth } = require("../middleware/auth");

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

router.post("/register", (req, res) => {
  const { full_name, email, phone, password } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ error: "Full name, email and password are required" });
  }
  const existing = db.prepare("SELECT id FROM customers WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ error: "An account with this email already exists" });

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO customers (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)")
    .run(full_name, email, phone || "", hash);

  const token = sign({ id: info.lastInsertRowid, email, role: "customer" });
  res.cookie("samzy_token", token, cookieOpts);
  res.json({ user: { id: info.lastInsertRowid, full_name, email }, token });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM customers WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = sign({ id: user.id, email: user.email, role: "customer" });
  res.cookie("samzy_token", token, cookieOpts);
  res.json({ user: { id: user.id, full_name: user.full_name, email: user.email }, token });
});

router.post("/logout", (req, res) => {
  res.clearCookie("samzy_token");
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db
    .prepare("SELECT id, full_name, email, phone, address, city, state FROM customers WHERE id = ?")
    .get(req.user.id);
  res.json({ user });
});

module.exports = router;
