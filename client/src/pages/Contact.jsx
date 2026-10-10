import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="container" style={{ padding: "30px 0" }}>
      <h1 style={{ marginBottom: 20 }}>Get in Touch</h1>
      <p style={{ color: "var(--muted)", maxWidth: 520, marginBottom: 30 }}>We're here to help — reach out to us for any questions, orders or support.</p>
      <div className="split" style={{ alignItems: "start", paddingTop: 0 }}>
        <div>
          <div className="mission-card" style={{ marginBottom: 14 }}>📞 <strong>Phone</strong><br /><span style={{ color: "var(--muted)" }}>+234 801 234 5678</span></div>
          <div className="mission-card" style={{ marginBottom: 14 }}>✉️ <strong>Email</strong><br /><span style={{ color: "var(--muted)" }}>support@samzy.com</span></div>
          <div className="mission-card" style={{ marginBottom: 14 }}>📍 <strong>Address</strong><br /><span style={{ color: "var(--muted)" }}>Lagos, Nigeria</span></div>
          <div className="mission-card">🕑 <strong>Business Hours</strong><br /><span style={{ color: "var(--muted)" }}>Mon - Sat: 8am - 8pm, Sun: 10am - 4pm</span></div>
        </div>
        <div className="form-card">
          <h3>Send Us a Message</h3>
          {sent && <div className="alert alert-success">Thanks! Your message has been sent — we'll get back to you soon.</div>}
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); e.target.reset(); }}>
            <div className="field"><label>Full Name</label><input required /></div>
            <div className="field"><label>Email Address</label><input type="email" required /></div>
            <div className="field"><label>Message</label><textarea rows="4" required /></div>
            <button className="btn btn-primary btn-block" type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
