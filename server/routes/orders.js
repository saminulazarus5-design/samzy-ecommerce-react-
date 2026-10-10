const express = require("express");
const router = express.Router();
const db = require("../db");

function genOrderNumber() {
  const rand = Math.floor(10000 + Math.random() * 89999);
  return `SMZ-${rand}`;
}

function serializeOrder(order) {
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
  return { ...order, items };
}

// POST /api/orders  -> create a pending order from cart, before payment
router.post("/", (req, res) => {
  const { full_name, email, phone, address, city, state, items, delivery_fee } = req.body;

  if (!full_name || !email || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Missing required checkout fields or empty cart" });
  }

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const fee = Number.isFinite(delivery_fee) ? delivery_fee : 5000;
  const total = subtotal + fee;
  let orderNumber = genOrderNumber();
  while (db.prepare("SELECT id FROM orders WHERE order_number = ?").get(orderNumber)) {
    orderNumber = genOrderNumber();
  }

  const customer = db.prepare("SELECT id FROM customers WHERE email = ?").get(email);

  const insertOrder = db.prepare(`
    INSERT INTO orders (order_number, customer_id, full_name, email, phone, address, city, state, subtotal, delivery_fee, total)
    VALUES (@order_number, @customer_id, @full_name, @email, @phone, @address, @city, @state, @subtotal, @delivery_fee, @total)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, name, image, variant, price, qty)
    VALUES (@order_id, @product_id, @name, @image, @variant, @price, @qty)
  `);

  const tx = db.transaction(() => {
    const info = insertOrder.run({
      order_number: orderNumber,
      customer_id: customer ? customer.id : null,
      full_name, email, phone, address,
      city: city || "", state: state || "",
      subtotal, delivery_fee: fee, total
    });
    for (const it of items) {
      insertItem.run({
        order_id: info.lastInsertRowid,
        product_id: it.id || null,
        name: it.name,
        image: it.image || "",
        variant: it.variant || "",
        price: it.price,
        qty: it.qty
      });
    }
    return info.lastInsertRowid;
  });

  const orderId = tx();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  res.status(201).json({ order: serializeOrder(order) });
});

router.get("/track/:orderNumber", (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE order_number = ?").get(req.params.orderNumber);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ order: serializeOrder(order) });
});

router.get("/:orderNumber", (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE order_number = ?").get(req.params.orderNumber);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ order: serializeOrder(order) });
});

module.exports = router;
