import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { adminApi } from "../api";
import { useScopedCss } from "./StoreLayout";
import css from "../styles/admin.css?inline";

const LINKS = [
  ["/admin", "📊", "Dashboard", true],
  ["/admin/products", "📦", "Products"],
  ["/admin/orders", "🧾", "Orders"],
  ["/admin/customers", "👥", "Customers"]
];

export default function AdminLayout() {
  useScopedCss(css);
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);

  // Guard: every admin page requires a valid admin session.
  useEffect(() => {
    adminApi("/stats").then(() => setOk(true)).catch(() => navigate("/admin/login"));
  }, [navigate]);

  const logout = async (e) => {
    e.preventDefault();
    await adminApi("/logout", { method: "POST" }).catch(() => {});
    navigate("/admin/login");
  };

  if (!ok) return null;

  return (
    <div className="admin-shell">
      <div className="admin-sidebar">
        <div className="brand"><span className="logo-badge">S</span><span>SAMZY ADMIN</span></div>
        <nav className="admin-nav">
          {LINKS.map(([to, icon, label, end]) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "active" : "")}>
              {icon} <span className="label">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="logout"><a href="#" onClick={logout}>🚪 Logout</a></div>
      </div>
      <div className="admin-main"><Outlet /></div>
    </div>
  );
}
