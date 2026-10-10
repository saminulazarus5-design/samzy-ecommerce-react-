import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatNaira, starString } from "../utils";

export default function ProductCard({ product: p }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const add = () => {
    addItem(p, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="product-card">
      {p.badge && <span className={`badge ${p.badge}`}>{p.badge}</span>}
      <Link to={`/products/${p.slug}`} className="thumb"><img src={p.image} alt={p.name} /></Link>
      <div className="body">
        <Link to={`/products/${p.slug}`}><h3>{p.name}</h3></Link>
        <div className="stars">{starString(p.rating)} <span>({p.reviews_count})</span></div>
        <div className="price">{formatNaira(p.price)}</div>
        <button className="btn btn-primary btn-sm" onClick={add}>{added ? "Added ✓" : "Add to Cart"}</button>
      </div>
    </div>
  );
}
