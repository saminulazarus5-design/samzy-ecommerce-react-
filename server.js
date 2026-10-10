require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const productRoutes = require("./server/routes/products");
const authRoutes = require("./server/routes/auth");
const orderRoutes = require("./server/routes/orders");
const paymentRoutes = require("./server/routes/payment");
const adminRoutes = require("./server/routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Webhook needs the raw body, so mount it BEFORE express.json()
app.use("/api/payment/webhook", express.raw({ type: "*/*" }));
app.use(express.json());

// ---- API routes ----
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true, name: "Samzy Communications API" }));

// ---- React frontend (built with `npm run build`) ----
const distDir = path.join(__dirname, "client", "dist");
app.use(express.static(distDir));

// Unknown /api routes -> JSON 404; everything else -> React (client-side routing)
app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));
app.use((req, res) => {
  res.sendFile(path.join(distDir, "index.html"), (err) => {
    if (err) res.status(200).send("React app not built yet. Run: npm run build");
  });
});

const server = app.listen(PORT, (err) => {
  if (err) return; // handled by the "error" listener below
  console.log(`\nSamzy Communications server running: http://localhost:${PORT}`);
  console.log(`Admin dashboard (production build):  http://localhost:${PORT}/admin/login\n`);
});

// Show a clear message if the port is already in use (Express 5 no longer throws by default)
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} is already in use. Close the other terminal running this site, or set a different PORT in .env\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
