import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

// One component powers both /login and /register.
export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify(form) });
      navigate("/");
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="container" style={{ maxWidth: 420, padding: "50px 20px" }}>
      <div className="form-card">
        <h3>{isRegister ? "Create Your Account" : "Welcome Back"}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          {isRegister && <div className="field"><label>Full Name</label><input value={form.full_name} onChange={set("full_name")} required /></div>}
          <div className="field"><label>Email Address</label><input type="email" value={form.email} onChange={set("email")} required /></div>
          {isRegister && <div className="field"><label>Phone Number</label><input type="tel" value={form.phone} onChange={set("phone")} /></div>}
          <div className="field"><label>Password</label><input type="password" minLength={isRegister ? 6 : undefined} value={form.password} onChange={set("password")} required /></div>
          <button className="btn btn-primary btn-block" type="submit">{isRegister ? "Register" : "Login"}</button>
        </form>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 16 }}>
          {isRegister ? <>Already have an account? <Link to="/login" style={{ color: "var(--blue)", fontWeight: 600 }}>Login</Link></>
            : <>Don't have an account? <Link to="/register" style={{ color: "var(--blue)", fontWeight: 600 }}>Register</Link></>}
        </p>
      </div>
    </div>
  );
}
