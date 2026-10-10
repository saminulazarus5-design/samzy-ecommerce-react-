import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

const ICONS = {
  Smartphones: "📱", Laptops: "💻", Tablets: "📱", Accessories: "🎧", Chargers: "🔌",
  Earphones: "🎧", "Smart Watches": "⌚", "Power Banks": "🔋", Networking: "📶"
};

const TESTIMONIALS = [
  { name: "Chidera A.", city: "Lagos", text: "Great service and genuine products. I'm a repeat customer!" },
  { name: "Blessing O.", city: "Port Harcourt", text: "Delivery was super fast and the packaging was perfect." },
  { name: "Emeka J.", city: "Port Harcourt", text: "The best tech store in Nigeria. Highly recommended!" }
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api("/products/categories").then((d) => setCategories(d.categories)).catch(console.error);
    api("/products?featured=1&limit=4").then((d) => setFeatured(d.products)).catch(console.error);
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-text">
            <h1>Your Trusted<br />Tech Store</h1>
            <p>Smartphones, laptops, accessories and more — all in one place. Genuine products, fast delivery, secure payment.</p>
            <Link to="/products" className="btn btn-primary">Shop Now →</Link>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600" alt="Tech products" />
          </div>
        </div>
      </section>

      <div className="container">
        <div className="feature-strip">
          {[["✅", "Original Products", "100% Genuine"], ["🚚", "Fast Delivery", "Across Nigeria"],
            ["🔒", "Secure Payment", "Multiple Options"], ["🎧", "24/7 Support", "We're always here"]].map(([i, t, s]) => (
            <div className="feature-item" key={t}><div className="icon">{i}</div><div><h4>{t}</h4><p>{s}</p></div></div>
          ))}
        </div>

        <section className="section">
          <div className="section-head"><h2>Shop by Category</h2><Link to="/products">View All →</Link></div>
          <div className="cat-grid">
            {categories.map((c) => (
              <Link key={c.id} className="cat-card" to={`/products?category=${encodeURIComponent(c.name)}`}>
                <div className="icon">{ICONS[c.name] || "🛍️"}</div><span>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head"><h2>Featured Products</h2><Link to="/products?featured=1">View All →</Link></div>
          <div className="product-grid">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>

        <section className="section">
          <div className="promo-banner">
            <div><h3>Get the best deals on your favorite gadgets!</h3><p>Shop now and enjoy amazing discounts.</p></div>
            <Link to="/products?featured=1" className="btn btn-primary">View Deals →</Link>
          </div>
        </section>

        <section className="section">
          <div className="section-head"><h2>Why Choose Samzy Communications?</h2></div>
          <div className="why-grid">
            {[["🛡️", "Genuine Products", "100% authentic and original"], ["💰", "Best Prices", "Affordable and fair pricing"],
              ["⚡", "Fast & Reliable Delivery", "Get your order on time"], ["❤️", "Excellent Support", "We're here to help"]].map(([i, t, s]) => (
              <div className="why-card" key={t}><div className="icon">{i}</div><h4>{t}</h4><p>{s}</p></div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head"><h2>What Our Customers Say</h2></div>
          <div className="testi-grid">
            {TESTIMONIALS.map((t) => (
              <div className="testi-card" key={t.name}>
                <div className="who">
                  <div className="avatar">{t.name[0]}</div>
                  <div><strong>{t.name}</strong><div style={{ fontSize: 11, color: "var(--muted)" }}>{t.city}</div></div>
                </div>
                <p>"{t.text}"</p><div className="stars">★★★★★</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="newsletter">
            <h3>Subscribe to Our Newsletter</h3>
            <p>Get updates on new arrivals, deals and more.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); e.target.reset(); }}>
              <input type="email" placeholder="Enter your email" required />
              <button className="btn btn-primary" type="submit">Subscribe</button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
