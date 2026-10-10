import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Dev: React runs on :5173 and forwards /api calls to the Express server.
// The API port is read from PORT in the project's root .env file (default 3000).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "..", "");
  const apiPort = env.PORT || 3000;
  return {
    plugins: [react()],
    server: { port: 5173, proxy: { "/api": `http://localhost:${apiPort}` } }
  };
});
