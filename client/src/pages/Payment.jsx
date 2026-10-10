import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { formatNaira } from "../utils";

const METHODS = [
  ["card", "💳", "Card (Visa, Mastercard, Verve)"],
  ["bank_transfer", "🏦", "Bank Transfer"],
  ["ussd", "📟", "USSD"],
  ["bank_account", "🏛️", "Bank Account"],
  ["qr_code", "▦", "QR Code"]
];

export default function Payment() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState("card");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const num = sessionStorage.getItem("samzy_pending_order");
    if (!num) return navigate("/cart");
    api(`/orders/${num}`).then((d) => setOrder(d.order)).catch((e) => setError(e.message));
  }, [navigate]);

  const pay = async () => {
    setBusy(true); setError("");
    try {
      const { authorization_url } = await api("/payment/initialize", {
        method: "POST",
        body: JSON.stringify({ order_number: order.order_number, method, callback_url: `${window.location.origin}/success` })
      });
      window.location.href = authorization_url; // Paystack hosted checkout
    } catch (err) {
      setError(err.message); setBusy(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480, padding: "40px 20px" }}>
      <div className="form-card" style={{ textAlign: "center" }}>
        <div className="logo" style={{ justifyContent: "center", color: "var(--navy)", marginBottom: 8 }}>
          <span className="logo-badge">S</span><span>SAMZY<br /><small style={{ color: "var(--muted)" }}>COMMUNICATIONS</small></span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 6 }}>Secure Payment</p>
        {!order ? <p>{error || "Loading…"}</p> : (
          <>
            <h2 style={{ marginBottom: 6 }}>Pay {formatNaira(order.total)}</h2>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>Order ID: {order.order_number} • {order.email}</p>

            <div style={{ textAlign: "left", background: "var(--bg)", borderRadius: 8, padding: 12, marginBottom: 18 }}>
              {order.items.map((i) => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0" }}>
                  <span>{i.name} × {i.qty}</span><span>{formatNaira(i.price * i.qty)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, paddingTop: 6, borderTop: "1px solid var(--border)", marginTop: 6, fontWeight: 700 }}>
                <span>Total</span><span>{formatNaira(order.total)}</span>
              </div>
            </div>

            <div style={{ textAlign: "left" }}>
              <div className="pd-section-label" style={{ marginTop: 0 }}>Choose Payment Method</div>
              <div className="pay-methods">
                {METHODS.map(([v, icon, label]) => (
                  <div key={v} className={`pay-method ${method === v ? "selected" : ""}`} onClick={() => setMethod(v)}>
                    <span className="ic">{icon}</span> {label}
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}
            <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={pay} disabled={busy}>
              {busy ? "Redirecting to Paystack..." : "Pay Now"}
            </button>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 16 }}>🔒 Powered by Paystack</p>
          </>
        )}
      </div>
    </div>
  );
}
