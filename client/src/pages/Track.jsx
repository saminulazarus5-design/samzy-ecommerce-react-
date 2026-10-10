import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { formatNaira } from "../utils";

const STEPS = [
  ["processing", "Processing", "Your order has been confirmed"],
  ["packed", "Packed", "Your order is being packed"],
  ["shipped", "Shipped", "Your order is on the way"],
  ["delivered", "Delivered", "Expected/completed delivery"]
];

export default function Track() {
  const [params] = useSearchParams();
  const [number, setNumber] = useState(params.get("order") || "");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const track = async (n) => {
    setError(""); setOrder(null);
    try { setOrder((await api(`/orders/track/${n}`)).order); } catch (e) { setError(e.message); }
  };

  useEffect(() => { if (params.get("order")) track(params.get("order")); }, []); // eslint-disable-line

  const idx = order ? STEPS.findIndex((s) => s[0] === order.order_status) : -1;

  return (
    <div className="container centered-card">
      <div className="form-card">
        <h3>Track Your Order</h3>
        <form style={{ display: "flex", gap: 8, marginBottom: 20 }} onSubmit={(e) => { e.preventDefault(); number.trim() && track(number.trim()); }}>
          <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Enter your order number (e.g. SMZ-10001)"
            style={{ flex: 1, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8 }} />
          <button className="btn btn-primary" type="submit">Track</button>
        </form>
        {error && <div className="alert alert-error">{error}</div>}
        {order && (
          <>
            <div style={{ marginBottom: 16 }}>
              <strong>Order #{order.order_number}</strong>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Placed on {new Date(order.created_at).toLocaleDateString()}</div>
            </div>
            {STEPS.map(([key, title, desc], i) => (
              <div key={key} className={`track-step ${i <= idx ? "done" : ""}`}><div><h4>{title}</h4><p>{desc}</p></div></div>
            ))}
            <div style={{ marginTop: 16, fontSize: 13 }}>
              Payment status: <strong>{order.payment_status}</strong> · Total: <strong>{formatNaira(order.total)}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
