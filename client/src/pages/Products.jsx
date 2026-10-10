import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

const PRICE_RANGES = [
  ["", "All prices"], ["0-50000", "Under ₦50,000"], ["50000-150000", "₦50,000 - ₦150,000"],
  ["150000-400000", "₦150,000 - ₦400,000"], ["400000-1000000", "₦400,000 - ₦1,000,000"], ["1000000-999999999", "₦1,000,000+"]
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "All";
  const search = params.get("search") || "";
  const featured = params.get("featured") || "";

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState("popular");
  const [draft, setDraft] = useState({ price: "", brand: "" }); // edited in the sidebar
  const [applied, setApplied] = useState({ price: "", brand: "" }); // sent to the API

  useEffect(() => {
    api("/products/categories").then((d) => setCategories(d.categories));
    api("/products/brands").then((d) => setBrands(d.brands));
  }, []);

  useEffect(() => {
    const q = new URLSearchParams();
    if (category !== "All") q.set("category", category);
    if (search) q.set("search", search);
    if (featured) q.set("featured", featured);
    if (applied.brand) q.set("brand", applied.brand);
    if (applied.price) { const [min, max] = applied.price.split("-"); q.set("min", min); q.set("max", max); }
    q.set("sort", sort);
    api(`/products?${q}`).then((d) => setProducts(d.products)).catch(console.error);
  }, [category, search, featured, sort, applied]);

  const setCategory = (c) => {
    const next = new URLSearchParams(params);
    c === "All" ? next.delete("category") : next.set("category", c);
    setParams(next);
  };

  const clear = () => { setParams({}); setDraft({ price: "", brand: "" }); setApplied({ price: "", brand: "" }); };

  return (
    <>
      <div className="container page-head">
        <div className="breadcrumb"><Link to="/">Home</Link> / {category !== "All" ? category : "All Products"}</div>
      </div>
      <div className="container listing-layout">
        <aside className="filters-card">
          <h4>Categories</h4>
          <label className="filter-option">
            <input type="radio" checked={category === "All"} onChange={() => setCategory("All")} /> All Products
          </label>
          {categories.map((c) => (
            <label className="filter-option" key={c.id}>
              <input type="radio" checked={category === c.name} onChange={() => setCategory(c.name)} /> {c.name}
            </label>
          ))}

          <h4>Filter</h4>
          <div className="field">
            <label>Price Range</label>
            <select value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })}>
              {PRICE_RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <h4>Brand</h4>
          {brands.map((b) => (
            <label className="filter-option" key={b}>
              <input type="radio" name="brand" checked={draft.brand === b} onChange={() => setDraft({ ...draft, brand: b })} /> {b}
            </label>
          ))}

          <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={() => setApplied(draft)}>Apply Filter</button>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={clear}>Clear</button>
        </aside>

        <div>
          <div className="listing-toolbar">
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Showing {products.length} products</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Sort by: Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <div className="product-grid">
            {products.length
              ? products.map((p) => <ProductCard key={p.id} product={p} />)
              : <p style={{ gridColumn: "1/-1", color: "var(--muted)", padding: 30 }}>No products match your filters.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
