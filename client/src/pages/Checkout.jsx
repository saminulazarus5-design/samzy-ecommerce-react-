import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";
import { DELIVERY_FEE, formatNaira } from "../utils";

const STATES = ["Lagos", "Abuja (FCT)", "Rivers", "Oyo", "Kano", "Enugu", "Delta", "Other"];

export default function Checkout() {
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", address: "", state: "", city: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!items.length) navigate("/cart"); }, [items, navigate]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const { order } = await api("/orders", {
        method: "POST",
        body: JSON.stringify({ ...form, items, delivery_fee: DELIVERY_FEE })
      });
      sessionStorage.setItem("samzy_pending_order", order.order_number);
      navigate("/payment");
    } catch (err) {
      setError(err.message); setBusy(false);
    }
  };

  return (
    <>
      <div className="container page-head">
        <div className="breadcrumb"><Link to="/">Home</Link> / <Link to="/cart">Cart</Link> / Checkout</div>
      </div>
      <div className="container cart-layout">
        <div className="form-card">
          <h3>Shipping Information</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form id="checkout-form" onSubmit={submit}>
            <div className="field"><label>Full Name</label><input value={form.full_name} onChange={set("full_name")} placeholder="Enter your full name" required /></div>
            <div className="field"><label>Email Address</label><input type="email" value={form.email} onChange={set("email")} placeholder="Enter your email" required /></div>
            <div className="field"><label>Phone Number</label><input type="tel" value={form.phone} onChange={set("phone")} placeholder="Enter your phone number" required /></div>
            <div className="field"><label>Delivery Address</label><input value={form.address} onChange={set("address")} placeholder="Enter your address" required /></div>
            <div className="field-row">
              <div className="field">
                <label>State</label>
                <select value={form.state} onChange={set("state")} required>
                  <option value="">Select state</option>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field"><label>City</label><input value={form.city} onChange={set("city")} placeholder="Enter your city" required /></div>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>You'll choose how to pay (card, bank transfer, USSD…) on the next step.</p>
          </form>
        </div>

        <div className="summary-card">
          <h3>Order Summary</h3>
          <div style={{ marginBottom: 12 }}>
            {items.map((i) => (
              <div key={`${i.id}-${i.variant}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span>{i.name} {i.variant && `(${i.variant})`} × {i.qty}</span><span>{formatNaira(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="summary-row"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
          <div className="summary-row"><span>Delivery Fee</span><span>{formatNaira(DELIVERY_FEE)}</span></div>
          <div className="summary-row total"><span>Total</span><span>{formatNaira(subtotal + DELIVERY_FEE)}</span></div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} type="submit" form="checkout-form" disabled={busy}>
            {busy ? "Processing..." : "Continue to Payment"}
          </button>
        </div>
      </div>
    </>
  );
}
