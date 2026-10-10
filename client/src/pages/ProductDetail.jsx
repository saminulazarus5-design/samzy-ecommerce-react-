import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";
import { formatNaira, starString } from "../utils";

const COLORS = {
  black: "#111", white: "#fff", pink: "#f4b5c8", blue: "#3b82f6", gray: "#9ca3af", gold: "#d4af37", silver: "#c0c0c0",
  "space gray": "#4b4f56", midnight: "#0f172a", navy: "#1e3a8a", lilac: "#c4b5fd", yellow: "#facc15", green: "#22c55e",
  starlight: "#f5f0e6", violet: "#8b5cf6"
};

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState("");
  const [storage, setStorage] = useState("");
  const [tab, setTab] = useState("desc");
  const [img, setImg] = useState("");

  useEffect(() => {
    api(`/products/${slug}`)
      .then(({ product }) => {
        setP(product);
        setColor(product.variants.colors?.[0] || "");
        setStorage(product.variants.storage?.[0] || "");
        setImg(product.image);
        document.title = `${product.name} — Samzy Communications`;
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <div className="container empty-state"><h3>{error}</h3><Link to="/products" className="btn btn-primary">Back to shop</Link></div>;
  if (!p) return <div className="container empty-state">Loading…</div>;

  const variant = [color, storage].filter(Boolean).join(" / ");
  const gallery = p.gallery.length ? p.gallery : [p.image];

  return (
    <>
      <div className="container page-head">
        <div className="breadcrumb"><Link to="/">Home</Link> / <Link to="/products">Shop</Link> / {p.name}</div>
      </div>
      <div className="container pd-layout">
        <div className="pd-thumbs">
          {gallery.map((g) => <div className="thumb-sm" key={g} onClick={() => setImg(g)}><img src={g} alt="" /></div>)}
        </div>
        <div className="pd-main-img"><img src={img} alt={p.name} /></div>

        <div className="pd-info">
          <h1>{p.name}</h1>
          <div className="stars">{starString(p.rating)} <span style={{ color: "var(--muted)" }}>({p.reviews_count} reviews)</span></div>
          <div className="price">{formatNaira(p.price)}</div>
          <div className="stock-pill">{p.stock > 0 ? "🟢 In Stock" : "🔴 Out of Stock"}</div>

          {p.variants.colors?.length > 0 && (
            <>
              <div className="pd-section-label">Color: {color}</div>
              <div className="option-row">
                {p.variants.colors.map((c) => (
                  <div key={c} className={`swatch ${c === color ? "selected" : ""}`} style={{ background: COLORS[c.toLowerCase()] || "#e5e7eb" }} onClick={() => setColor(c)} title={c} />
                ))}
              </div>
            </>
          )}
          {p.variants.storage?.length > 0 && (
            <>
              <div className="pd-section-label">Storage</div>
              <div className="option-row">
                {p.variants.storage.map((s) => <div key={s} className={`chip ${s === storage ? "selected" : ""}`} onClick={() => setStorage(s)}>{s}</div>)}
              </div>
            </>
          )}

          <div className="pd-section-label">Quantity</div>
          <div className="qty-control">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button onClick={() => setQty(qty + 1)}>+</button>
          </div>

          <div className="pd-actions">
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={p.stock < 1} onClick={() => { addItem(p, qty, variant); alert("Added to cart!"); }}>Add to Cart</button>
            <button className="btn btn-outline" style={{ flex: 1 }} disabled={p.stock < 1} onClick={() => { addItem(p, qty, variant); navigate("/cart"); }}>Buy Now</button>
          </div>
          <div className="pd-trust"><span>✅ 100% Original</span><span>🛡️ 1 Year Warranty</span><span>↩️ 7 Days Return</span></div>

          <div className="pd-tabs">
            {[["desc", "Description"], ["specs", "Specifications"], ["reviews", "Reviews"]].map(([k, l]) => (
              <div key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</div>
            ))}
          </div>
          <div className={`tab-panel ${tab === "desc" ? "active" : ""}`}><p>{p.description}</p></div>
          <div className={`tab-panel ${tab === "specs" ? "active" : ""}`}>
            <table className="spec-table"><tbody>
              {Object.entries(p.specs || {}).map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}
            </tbody></table>
          </div>
          <div className={`tab-panel ${tab === "reviews" ? "active" : ""}`}>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>No reviews yet — be the first to review this product.</p>
          </div>
        </div>
      </div>
    </>
  );
}
