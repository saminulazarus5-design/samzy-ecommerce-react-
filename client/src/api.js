// Small fetch wrapper used by every page. Cookies (auth) are sent automatically.
export async function api(path, options = {}) {
  const res = await fetch("/api" + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    const err = new Error(data.error || "Something went wrong");
    err.status = res.status;
    throw err;
  }
  return data;
}

export const adminApi = (path, options) => api("/admin" + path, options);
