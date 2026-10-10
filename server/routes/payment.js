const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const router = express.Router();
const db = require("../db");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE = "https://api.paystack.co";

// Maps our UI's "Choose Payment Method" options to Paystack channels
const CHANNEL_MAP = {
  card: ["card"],
  bank_transfer: ["bank_transfer"],
  ussd: ["ussd"],
  bank_account: ["bank"],
  qr_code: ["qr"]
};

// POST /api/payment/initialize  { order_number, method }
router.post("/initialize", async (req, res) => {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({
        error: "Payment is not configured yet. Set PAYSTACK_SECRET_KEY in your .env file."
      });
    }
    const { order_number, method } = req.body;
    const order = db.prepare("SELECT * FROM orders WHERE order_number = ?").get(order_number);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.payment_status === "paid") {
      return res.status(400).json({ error: "This order has already been paid for" });
    }

    const reference = `${order.order_number}-${Date.now()}`;

    const payload = {
      email: order.email,
      amount: order.total * 100, // kobo
      reference,
      currency: "NGN",
      channels: CHANNEL_MAP[method] || undefined,
      callback_url: req.body.callback_url || undefined,
      metadata: { order_number: order.order_number, order_id: order.id }
    };

    const resp = await axios.post(`${PAYSTACK_BASE}/transaction/initialize`, payload, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" }
    });

    db.prepare("UPDATE orders SET paystack_reference = ?, payment_method = ? WHERE id = ?")
      .run(reference, method || "card", order.id);

    res.json({
      authorization_url: resp.data.data.authorization_url,
      access_code: resp.data.data.access_code,
      reference
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Could not initialize payment. Please try again." });
  }
});

// GET /api/payment/verify/:reference
router.get("/verify/:reference", async (req, res) => {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: "Payment is not configured yet." });
    }
    const { reference } = req.params;
    const resp = await axios.get(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
    });

    const data = resp.data.data;
    const order = db.prepare("SELECT * FROM orders WHERE paystack_reference = ?").get(reference);
    if (!order) return res.status(404).json({ error: "Order not found for this reference" });

    if (data.status === "success") {
      db.prepare("UPDATE orders SET payment_status = 'paid' WHERE id = ?").run(order.id);
    } else {
      db.prepare("UPDATE orders SET payment_status = 'failed' WHERE id = ?").run(order.id);
    }

    const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(order.id);
    res.json({ status: data.status, order: updated });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Could not verify payment." });
  }
});

// POST /api/payment/webhook  -> Paystack server-to-server confirmation (recommended for production)
router.post("/webhook", express.raw({ type: "*/*" }), (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(req.body).digest("hex");
    if (hash !== signature) return res.sendStatus(401);

    const event = JSON.parse(req.body.toString("utf8"));
    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const order = db.prepare("SELECT * FROM orders WHERE paystack_reference = ?").get(reference);
      if (order) {
        db.prepare("UPDATE orders SET payment_status = 'paid' WHERE id = ?").run(order.id);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.sendStatus(400);
  }
});

module.exports = router;
