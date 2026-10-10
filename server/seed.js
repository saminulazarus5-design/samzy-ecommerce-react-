// server/seed.js
// Run with: node server/seed.js
// Populates categories, a default admin user, and demo products.
const bcrypt = require("bcryptjs");
const db = require("./db");

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const categories = [
  "Smartphones", "Laptops", "Tablets", "Accessories",
  "Chargers", "Earphones", "Smart Watches", "Power Banks", "Networking"
];

const insertCategory = db.prepare(
  "INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)"
);
categories.forEach((c) => insertCategory.run(c, slugify(c)));

const products = [
  {
    name: "iPhone 15",
    category: "Smartphones",
    brand: "Apple",
    price: 1200000,
    compare_price: 1300000,
    image: "https://images.unsplash.com/photo-1592286927505-1def25115481?w=600",
    description:
      "The iPhone 15 combines powerful performance, an advanced camera system, and a stunning design. With the A16 Bionic chip, you'll experience faster performance, better battery life, and incredible photos and videos.",
    specs: { Display: "6.1\" Super Retina XDR display", Chip: "A16 Bionic chip", Camera: "48MP main camera", Storage: "128GB" },
    variants: { colors: ["Black", "Pink", "Blue"], storage: ["128GB", "256GB", "512GB"] },
    stock: 24,
    rating: 4.8,
    reviews_count: 124,
    featured: 1,
    badge: "New"
  },
  {
    name: "Samsung Galaxy S24",
    category: "Smartphones",
    brand: "Samsung",
    price: 1050000,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600",
    description: "Flagship Samsung Galaxy S24 with a stunning AMOLED display, powerful Snapdragon chipset and pro-grade camera system.",
    specs: { Display: "6.2\" Dynamic AMOLED 2X", Chip: "Snapdragon 8 Gen 3", Camera: "50MP triple camera", Storage: "256GB" },
    variants: { colors: ["Black", "Violet", "Gray"], storage: ["128GB", "256GB"] },
    stock: 18,
    rating: 4.6,
    reviews_count: 88,
    featured: 1,
    badge: "New"
  },
  {
    name: "MacBook Air M2",
    category: "Laptops",
    brand: "Apple",
    price: 1450000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
    description: "Strikingly thin design, the M2 chip delivers exceptional performance and battery life for work and play.",
    specs: { Display: "13.6\" Liquid Retina", Chip: "Apple M2", RAM: "8GB", Storage: "256GB SSD" },
    variants: { colors: ["Space Gray", "Silver", "Midnight"], storage: ["256GB", "512GB"] },
    stock: 10,
    rating: 4.9,
    reviews_count: 65,
    featured: 1,
    badge: ""
  },
  {
    name: "AirPods Pro",
    category: "Earphones",
    brand: "Apple",
    price: 350000,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600",
    description: "Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio for an unrivaled listening experience.",
    specs: { Type: "In-ear, True Wireless", ANC: "Yes", Battery: "Up to 6 hours" },
    variants: { colors: ["White"] },
    stock: 40,
    rating: 4.7,
    reviews_count: 210,
    featured: 1,
    badge: ""
  },
  {
    name: "iPad Air",
    category: "Tablets",
    brand: "Apple",
    price: 680000,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600",
    description: "Serious performance in a thin, light design. Powered by the M1 chip for pro-level speed.",
    specs: { Display: "10.9\" Liquid Retina", Chip: "Apple M1", Storage: "64GB" },
    variants: { colors: ["Blue", "Starlight", "Pink"], storage: ["64GB", "256GB"] },
    stock: 15,
    rating: 4.5,
    reviews_count: 40,
    featured: 0,
    badge: ""
  },
  {
    name: "Samsung Galaxy A55",
    category: "Smartphones",
    brand: "Samsung",
    price: 450000,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
    description: "A stylish mid-range powerhouse with a bright display and a versatile triple camera setup.",
    specs: { Display: "6.6\" Super AMOLED", Chip: "Exynos 1480", Camera: "50MP", Storage: "128GB" },
    variants: { colors: ["Navy", "Lilac", "Yellow"], storage: ["128GB", "256GB"] },
    stock: 30,
    rating: 4.3,
    reviews_count: 52,
    featured: 0,
    badge: ""
  },
  {
    name: "Redmi Note 13 Pro",
    category: "Smartphones",
    brand: "Xiaomi",
    price: 420000,
    image: "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=600",
    description: "Great value smartphone with a 200MP camera and fast charging for everyday power users.",
    specs: { Display: "6.67\" AMOLED", Camera: "200MP main camera", Storage: "256GB" },
    variants: { colors: ["Black", "Green"] },
    stock: 22,
    rating: 4.2,
    reviews_count: 33,
    featured: 0,
    badge: ""
  },
  {
    name: "Smart Watch Series 9",
    category: "Smart Watches",
    brand: "Apple",
    price: 250000,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600",
    description: "Our most advanced smartwatch yet, with a brighter display and powerful health features.",
    specs: { Display: "Always-On Retina", Battery: "Up to 18 hours", WaterResistance: "50m" },
    variants: { colors: ["Black", "Silver", "Gold"] },
    stock: 26,
    rating: 4.6,
    reviews_count: 77,
    featured: 1,
    badge: ""
  },
  {
    name: "Power Bank 20000mAh",
    category: "Power Banks",
    brand: "Anker",
    price: 75000,
    image: "https://images.unsplash.com/photo-1609592806596-4d1b5e5e5b5b?w=600",
    description: "High capacity power bank with fast charging to keep all your devices powered on the go.",
    specs: { Capacity: "20000mAh", Ports: "2x USB-A, 1x USB-C", FastCharge: "22.5W" },
    variants: { colors: ["Black", "White"] },
    stock: 50,
    rating: 4.4,
    reviews_count: 61,
    featured: 0,
    badge: ""
  },
  {
    name: "Wireless Charger Pad",
    category: "Chargers",
    brand: "Belkin",
    price: 35000,
    image: "https://images.unsplash.com/photo-1591290619762-c384c1a09267?w=600",
    description: "Sleek 15W wireless charging pad compatible with all Qi-enabled devices.",
    specs: { Output: "15W", Compatibility: "Qi-enabled devices" },
    variants: { colors: ["Black"] },
    stock: 60,
    rating: 4.1,
    reviews_count: 29,
    featured: 0,
    badge: ""
  },
  {
    name: "USB-C Hub Adapter",
    category: "Accessories",
    brand: "Anker",
    price: 45000,
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600",
    description: "7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader and PD fast charging.",
    specs: { Ports: "7-in-1", HDMI: "4K@30Hz" },
    variants: { colors: ["Gray"] },
    stock: 35,
    rating: 4.3,
    reviews_count: 18,
    featured: 0,
    badge: ""
  },
  {
    name: "Wi-Fi 6 Router",
    category: "Networking",
    brand: "TP-Link",
    price: 95000,
    image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600",
    description: "Next-gen Wi-Fi 6 router delivering faster speeds and more stable connections for the whole home.",
    specs: { Standard: "Wi-Fi 6 (802.11ax)", Speed: "Up to 3000Mbps", Ports: "4x Gigabit LAN" },
    variants: { colors: ["White"] },
    stock: 20,
    rating: 4.5,
    reviews_count: 24,
    featured: 0,
    badge: "Hot"
  }
];

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products
  (name, slug, category, brand, price, compare_price, image, gallery, description, specs, variants, stock, rating, reviews_count, featured, badge)
  VALUES (@name, @slug, @category, @brand, @price, @compare_price, @image, @gallery, @description, @specs, @variants, @stock, @rating, @reviews_count, @featured, @badge)
`);

const insertMany = db.transaction((rows) => {
  for (const p of rows) {
    insertProduct.run({
      name: p.name,
      slug: slugify(p.name),
      category: p.category,
      brand: p.brand,
      price: p.price,
      compare_price: p.compare_price || null,
      image: p.image,
      gallery: JSON.stringify([p.image]),
      description: p.description,
      specs: JSON.stringify(p.specs || {}),
      variants: JSON.stringify(p.variants || {}),
      stock: p.stock,
      rating: p.rating,
      reviews_count: p.reviews_count,
      featured: p.featured,
      badge: p.badge
    });
  }
});

insertMany(products);

// Default admin user: username=admin password=admin123 (change after first login)
const adminExists = db.prepare("SELECT id FROM admins WHERE username = ?").get("admin");
if (!adminExists) {
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run("admin", hash);
  console.log("Created default admin -> username: admin | password: admin123");
}

console.log(`Seed complete. ${products.length} products ensured, ${categories.length} categories ensured.`);
