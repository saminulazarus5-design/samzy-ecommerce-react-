import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Shop" },
  { to: "/products?featured=1", label: "Deals" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" }
];

export default function Header() {
  const { count } = useCart();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="site-header">
      <div className="header-top">
        <Link to="/" className="logo">
          <span className="logo-badge">S</span>
          <span>SAMZY<br /><small>COMMUNICATIONS</small></span>
        </Link>
        <form className="search-bar" onSubmit={onSearch}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for products, brands..." />
          <button type="submit">🔍</button>
        </form>
        <div className="header-actions">
          <Link to="/login">👤 Account</Link>
          <Link to="/cart">🛒 Cart <span className="cart-count">{count}</span></Link>
        </div>
      </div>
      <nav className="main-nav">
        <ul>
          {NAV.map((n) => (
            <li key={n.label}>
              <NavLink to={n.to} end={n.end} className={({ isActive }) => (isActive && n.label !== "Deals" ? "active" : "")}>
                {n.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
