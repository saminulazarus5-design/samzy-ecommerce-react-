export default function About() {
  return (
    <>
      <section className="hero" style={{ padding: "44px 0" }}>
        <div className="container" style={{ display: "block", textAlign: "center" }}>
          <h1 style={{ fontSize: 32 }}>About Samzy Communications</h1>
          <p style={{ color: "#c3cdea", maxWidth: 560, margin: "10px auto 0" }}>
            We're passionate about technology and committed to bringing you the best gadgets at the best prices.
          </p>
        </div>
      </section>
      <div className="container">
        <div className="split">
          <div>
            <h2 style={{ marginBottom: 12 }}>Our Story</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
              Samzy Communications started with a simple vision: to make genuine tech products accessible to everyone in Nigeria.
              We're a trusted name in smartphones, laptops, accessories and more, serving thousands of happy customers.
            </p>
          </div>
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600" alt="Samzy store" />
        </div>
        <div className="mission-grid">
          <div className="mission-card"><h3 style={{ marginBottom: 8 }}>Our Mission</h3><p style={{ color: "var(--muted)" }}>To provide genuine tech products to everybody with excellent service.</p></div>
          <div className="mission-card"><h3 style={{ marginBottom: 8 }}>Our Vision</h3><p style={{ color: "var(--muted)" }}>To be the number one trusted tech store in Nigeria.</p></div>
        </div>
      </div>
    </>
  );
}
