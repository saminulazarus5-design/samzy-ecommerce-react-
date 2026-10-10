const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "samzy_dev_secret_change_me";

function sign(payload, expiresIn = "7d") {
  return jwt.sign(payload, SECRET, { expiresIn });
}

function requireAuth(req, res, next) {
  const token = req.cookies?.samzy_token || (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

function requireAdmin(req, res, next) {
  const token = req.cookies?.samzy_admin_token || (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Admin login required" });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "admin") throw new Error("not admin");
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired admin session" });
  }
}

module.exports = { sign, requireAuth, requireAdmin, SECRET };
