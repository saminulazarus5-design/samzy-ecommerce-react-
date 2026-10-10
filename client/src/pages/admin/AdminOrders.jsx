import { useEffect, useState } from "react";
import { adminApi } from "../../api";
import { formatNaira } from "../../utils";

const STATUSES = ["processing", "packed", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(null); // selected order with items
  const [status, setStatus] = useState("");

  const load = () => adminApi(`/orders${filter ? `?status=${filter}` : ""}`).then((d) => setOrders(d.orders));
  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  const view = async (id) => {
    const { order } = await adminApi(`/orders/${id}`);
    setOpen(order); setStatus(order.order_status);
  };

  const save = async () => {
    await adminApi(`/orders/${open.id}/status`, { method: "PATCH", body: JSON.stringify({ order_status: status }) });
    setOpen(null); load();
  };

  return (
    <>
      <div className="admin-topbar"><h1>Orders</h1></div>
      <div className="admin-content">
        <div className="panel">
          <div className="toolbar">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{orders.length} orders</span>
          </div>
          <table className="admin-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan="7" style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>No orders found</td></tr>}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><strong>{o.order_number}</strong></td><td>{o.full_name}</td><td>{formatNaira(o.total)}</td>
                  <td><span className={`pill ${o.payment_status}`}>{o.payment_status}</span></td>
                  <td><span className={`pill ${o.order_status}`}>{o.order_status}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => view(o.id)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="modal-overlay open">
          <div className="modal">
            <h3>Order {open.order_number}</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>{open.full_name} · {open.email} · {open.phone}</p>
            <p style={{ fontSize: 13, marginBottom: 14 }}>{open.address}, {open.city}, {open.state}</p>
            <table className="admin-table" style={{ marginBottom: 14 }}>
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
              <tbody>{open.items.map((i) => <tr key={i.id}><td>{i.name} {i.variant && `(${i.variant})`}</td><td>{i.qty}</td><td>{formatNaira(i.price * i.qty)}</td></tr>)}</tbody>
            </table>
            <p style={{ fontWeight: 700, marginBottom: 14 }}>Total: {formatNaira(open.total)} · Payment: <span className={`pill ${open.payment_status}`}>{open.payment_status}</span></p>
            <div className="field"><label>Order Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn" style={{ background: "#f1f3f8" }} onClick={() => setOpen(null)}>Close</button>
              <button className="btn btn-primary" onClick={save}>Update Status</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
