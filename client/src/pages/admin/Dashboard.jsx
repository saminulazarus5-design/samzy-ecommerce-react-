import { useEffect, useState } from "react";
import { adminApi } from "../../api";
import { formatNaira } from "../../utils";

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { adminApi("/stats").then(setS).catch(console.error); }, []);

  const cards = s && [
    ["Total Products", s.totalProducts], ["Total Orders", s.totalOrders], ["Pending Orders", s.pendingOrders],
    ["Completed Orders", s.completedOrders], ["Total Sales", formatNaira(s.totalSales)]
  ];

  return (
    <>
      <div className="admin-topbar">
        <h1>Dashboard</h1>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>
      <div className="admin-content">
        <div className="stat-grid">
          {cards?.map(([label, value]) => <div className="stat-card" key={label}><div className="label">{label}</div><div className="value">{value}</div></div>)}
        </div>
        <div className="panel">
          <h3>Recent Orders</h3>
          <table className="admin-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {s?.recentOrders.length === 0 && <tr><td colSpan="6" style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>No orders yet</td></tr>}
              {s?.recentOrders.map((o) => (
                <tr key={o.order_number}>
                  <td><strong style={{ color: "var(--blue)" }}>{o.order_number}</strong></td>
                  <td>{o.full_name}</td><td>{formatNaira(o.total)}</td>
                  <td><span className={`pill ${o.payment_status}`}>{o.payment_status}</span></td>
                  <td><span className={`pill ${o.order_status}`}>{o.order_status}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
