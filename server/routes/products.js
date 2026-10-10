const express = require("express");
const router = express.Router();
const db = require("../db");

function parseRow(row) {
  if (!row) return row;
  return {
    ...row,
    gallery: safeParse(row.gallery, []),
    specs: safeParse(row.specs, {}),
    variants: safeParse(row.variants, {})
  };
}
function safeParse(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

// GET /api/products?category=&brand=&min=&max=&search=&sort=&featured=
router.get("/", (req, res) => {
  const { category, brand, min, max, search, sort, featured, limit } = req.query;
  let sql = "SELECT * FROM products WHERE 1=1";
  const params = {};

  if (category && category !== "All") {
    sql += " AND category = @category";
    params.category = category;
  }
  if (brand) {
    sql += " AND brand = @brand";
    params.brand = brand;
  }
  if (min) {
    sql += " AND price >= @min";
    params.min = Number(min);
  }
  if (max) {
    sql += " AND price <= @max";
    params.max = Number(max);
  }
  if (search) {
    sql += " AND (name LIKE @search OR brand LIKE @search OR category LIKE @search)";
    params.search = `%${search}%`;
  }
  if (featured === "1") {
    sql += " AND featured = 1";
  }

  const sortMap = {
    popular: "reviews_count DESC",
    price_asc: "price ASC",
    price_desc: "price DESC",
    newest: "created_at DESC"
  };
  sql += ` ORDER BY ${sortMap[sort] || "reviews_count DESC"}`;

  if (limit) sql += ` LIMIT ${Number(limit)}`;

  const rows = db.prepare(sql).all(params);
  res.json({ products: rows.map(parseRow), total: rows.length });
});

router.get("/categories", (req, res) => {
  const rows = db.prepare("SELECT * FROM categories ORDER BY name").all();
  res.json({ categories: rows });
});

router.get("/brands", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT brand FROM products ORDER BY brand").all();
  res.json({ brands: rows.map((r) => r.brand) });
});

router.get("/:idOrSlug", (req, res) => {
  const { idOrSlug } = req.params;
  const row = /^\d+$/.test(idOrSlug)
    ? db.prepare("SELECT * FROM products WHERE id = ?").get(idOrSlug)
    : db.prepare("SELECT * FROM products WHERE slug = ?").get(idOrSlug);
  if (!row) return res.status(404).json({ error: "Product not found" });
  res.json({ product: parseRow(row) });
});

module.exports = router;
