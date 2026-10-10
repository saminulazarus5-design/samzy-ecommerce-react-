import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api";
import { useScopedCss } from "../../layouts/StoreLayout";
import css from "../../styles/admin.css?inline";

export default function AdminLogin() {
  useScopedCss(css);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await adminApi("/login", { method: "POST", body: JSON.stringify(form) });
      navigate("/admin");
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span className="logo-badge" style={{ width: 34, height: 34, background: "var(--blue)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>S</span>
          <div><strong>SAMZY ADMIN</strong><div style={{ fontSize: 11, color: "var(--muted)" }}>Dashboard Login</div></div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="field"><label>Username</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <button className="btn btn-primary" type="submit" style={{ width: "100%", justifyContent: "center" }}>Login</button>
        </form>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 16 }}>Default: <strong>admin</strong> / <strong>admin123</strong> (change after first login)</p>
      </div>
    </div>
  );
}
