import { useEffect, useState } from "react";
import { adminApi } from "../../api";

export default function AdminCustomers() {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  useEffect(() => { adminApi("/customers").then((d) => setAll(d.customers)); }, []);

  const list = all.filter((c) => c.full_name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="admin-topbar"><h1>Customers</h1></div>
      <div className="admin-content">
        <div className="panel">
          <div className="toolbar">
            <input type="text" placeholder="Search customers..." value={q} onChange={(e) => setQ(e.target.value)} />
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{list.length} customers</span>
          </div>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Location</th><th>Joined</th></tr></thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan="5" style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>No customers yet</td></tr>}
              {list.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name}</td><td>{c.email}</td><td>{c.phone || "—"}</td>
                  <td>{[c.city, c.state].filter(Boolean).join(", ") || "—"}</td><td>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
