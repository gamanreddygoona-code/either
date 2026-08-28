import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let appInstance = null;

export default async function handler(req, res) {
  if (!appInstance) {
    try {
      const mod = require("../dist/server.vercel.cjs");
      appInstance = mod.default || mod;
    } catch (err) {
      console.error("Failed to load backend bundle:", err);
      return res.status(500).json({ error: "Backend initialization failed", details: err.message });
    }
  }
  return appInstance(req, res);
}
