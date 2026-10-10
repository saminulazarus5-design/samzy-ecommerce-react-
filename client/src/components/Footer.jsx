import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ color: "#fff", marginBottom: 10 }}>
              <span className="logo-badge">S</span><span>SAMZY<br /><small>COMMUNICATIONS</small></span>
            </div>
            <p>Your one-stop shop for quality tech. Smartphones, laptops, accessories and more — all in one place.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Shop</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Customer Service</h4>
            <ul>
              <li><Link to="/login">My Account</Link></li>
              <li><Link to="/track">Track Order</Link></li>
              <li><Link to="/contact">Returns Policy</Link></li>
              <li><Link to="/contact">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact Us</h4>
            <ul>
              <li>📞 +234 801 234 5678</li>
              <li>✉️ support@samzy.com</li>
              <li>📍 Lagos, Nigeria</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Samzy Communications. All rights reserved.</span>
          <span>Made in Nigeria 🇳🇬</span>
        </div>
      </div>
    </footer>
  );
}
