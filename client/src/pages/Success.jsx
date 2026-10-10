import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";
import { formatNaira } from "../utils";

export default function Success() {
  const [params] = useSearchParams();
  const { clear } = useCart();
  const [state, setState] = useState({ status: "loading" });
  const ran = useRef(false); // avoid double-verify in React StrictMode

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) return setState({ status: "error", message: "No payment reference found in the URL." });

    api(`/payment/verify/${reference}`)
      .then(({ status, order }) => {
        if (status === "success") {
          clear();
          sessionStorage.removeItem("samzy_pending_order");
          setState({ status: "success", order });
        } else setState({ status: "failed" });
      })
      .catch((e) => setState({ status: "error", message: e.message }));
  }, [params, clear]);

  const { status, order, message } = state;

  return (
    <div className="container">
      <div className="success-box">
        {status === "loading" && <p>Verifying your payment…</p>}
        {status === "success" && (
          <>
            <div className="check">✓</div>
            <h2>Payment Successful!</h2>
            <p>Your order has been placed successfully.</p>
            <div className="success-detail">
              <div><span>Order ID</span><strong>{order.order_number}</strong></div>
              <div><span>Amount Paid</span><strong>{formatNaira(order.total)}</strong></div>
            </div>
            <Link to={`/track?order=${order.order_number}`} className="btn btn-primary btn-block" style={{ marginBottom: 10 }}>View Order Details</Link>
            <Link to="/products" className="btn btn-outline btn-block">Continue Shopping</Link>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="check" style={{ background: "var(--red)" }}>✕</div>
            <h2 style={{ color: "var(--red)" }}>Payment Failed</h2>
            <p>Your payment could not be confirmed. Please try again.</p>
            <Link to="/payment" className="btn btn-primary btn-block">Try Again</Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="check" style={{ background: "var(--red)" }}>✕</div>
            <h2 style={{ color: "var(--red)" }}>Verification Error</h2>
            <p>{message}</p>
            <Link to="/cart" className="btn btn-primary btn-block">Back to Cart</Link>
          </>
        )}
      </div>
    </div>
  );
}
