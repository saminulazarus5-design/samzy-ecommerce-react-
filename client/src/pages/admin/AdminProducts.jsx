import { useEffect, useState } from "react";
import { adminApi } from "../../api";
import { formatNaira } from "../../utils";

const EMPTY = { id: "", name: "", category: "", brand: "", price: "", stock: "", image: "", description: "", badge: "", featured: false };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null); // null = modal closed

  const load = () => adminApi("/products").then((d) => setProducts(d.products));
  useEffect(() => { load(); }, []);

  const shown = products.filter((p) => [p.name, p.category, p.brand].some((v) => v.toLowerCase().includes(q.toLowerCase())));
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const { id, ...rest } = form;
    const body = JSON.stringify({ ...rest, price: Number(rest.price), stock: Number(rest.stock) });
    try {
      id ? await adminApi(`/products/${id}`, { method: "PUT", body }) : await adminApi("/products", { method: "POST", body });
      setForm(null); load();
    } catch (err) { alert(err.message); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await adminApi(`/products/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <>
      <div className="admin-topbar">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={() => setForm(EMPTY)}>+ Add Product</button>
      </div>
      <div className="admin-content">
        <div className="panel">
          <div className="toolbar">
            <input type="text" placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} />
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{shown.length} products</span>
          </div>
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Category</th><th>Brand</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}>
                  <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={p.image} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover", background: "#f2f4f9" }} />{p.name}
                  </td>
                  <td>{p.category}</td><td>{p.brand}</td><td>{formatNaira(p.price)}</td><td>{p.stock}</td><td>{p.featured ? "✅" : "—"}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setForm({ ...EMPTY, ...p, badge: p.badge || "", featured: !!p.featured })}>Edit</button>{" "}
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <div className="modal-overlay open">
          <div className="modal">
            <h3>{form.id ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={save}>
              <div className="field"><label>Product Name</label><input value={form.name} onChange={set("name")} required /></div>
              <div className="field-row">
                <div className="field"><label>Category</label><input value={form.category} onChange={set("category")} placeholder="e.g. Smartphones" required /></div>
                <div className="field"><label>Brand</label><input value={form.brand} onChange={set("brand")} required /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Price (₦)</label><input type="number" value={form.price} onChange={set("price")} required /></div>
                <div className="field"><label>Stock</label><input type="number" value={form.stock} onChange={set("stock")} required /></div>
              </div>
              <div className="field"><label>Image URL</label><input value={form.image} onChange={set("image")} placeholder="https://..." /></div>
              <div className="field"><label>Description</label><textarea rows="3" value={form.description} onChange={set("description")} /></div>
              <div className="field"><label>Badge</label>
                <select value={form.badge} onChange={set("badge")}><option value="">None</option><option>New</option><option>Hot</option></select>
              </div>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, marginBottom: 16 }}>
                <input type="checkbox" checked={form.featured} onChange={set("featured")} /> Show in Featured Products
              </label>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn" style={{ background: "#f1f3f8" }} onClick={() => setForm(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
