import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container error-page">
      <h1>404</h1><h2>Page Not Found</h2>
      <p style={{ color: "var(--muted)", margin: "10px 0 20px" }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
