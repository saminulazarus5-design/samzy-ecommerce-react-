import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { DELIVERY_FEE, formatNaira } from "../utils";

export default function Cart() {
  const { items, count, subtotal, updateQty, removeItem, clear } = useCart();
  const navigate = useNavigate();
  const total = items.length ? subtotal + DELIVERY_FEE : 0;

  return (
    <>
      <div className="container page-head">
        <div className="breadcrumb"><Link to="/">Home</Link> / Cart</div>
      </div>
      <div className="container cart-layout">
        <div>
          <div className="section-head">
            <h2>Your Cart ({count} item{count === 1 ? "" : "s"})</h2>
            <a href="#" onClick={(e) => { e.preventDefault(); if (items.length && confirm("Clear all items from your cart?")) clear(); }}>Clear Cart</a>
          </div>

          {!items.length && (
            <div className="empty-state">
              <div className="icon">🛒</div><h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything yet.</p>
              <Link to="/products" className="btn btn-primary" style={{ marginTop: 14 }}>Start Shopping</Link>
            </div>
          )}

          {items.map((i) => (
            <div className="cart-item" key={`${i.id}-${i.variant}`}>
              <img src={i.image} alt={i.name} />
              <div className="info">
                <h4>{i.name}</h4>
                <div className="meta">{i.variant}</div>
                <div className="qty-control" style={{ marginTop: 6 }}>
                  <button onClick={() => updateQty(i.id, i.variant, i.qty - 1)}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => updateQty(i.id, i.variant, i.qty + 1)}>+</button>
                </div>
              </div>
              <div className="price">
                {formatNaira(i.price * i.qty)}
                <div className="remove" onClick={() => removeItem(i.id, i.variant)}>Remove</div>
              </div>
            </div>
          ))}
        </div>

        <div className="summary-card">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
          <div className="summary-row"><span>Delivery Fee</span><span>{formatNaira(items.length ? DELIVERY_FEE : 0)}</span></div>
          <div className="summary-row total"><span>Total</span><span>{formatNaira(total)}</span></div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} disabled={!items.length} onClick={() => navigate("/checkout")}>
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </>
  );
}
