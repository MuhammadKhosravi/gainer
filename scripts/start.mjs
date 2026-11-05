import { cp, access } from "node:fs/promises";
import nextEnv from "@next/env";
process.env.NODE_ENV = "production";
nextEnv.loadEnvConfig(process.cwd());
process.env.HOSTNAME = process.env.APP_HOST || "0.0.0.0";
try {
  await access(".next/standalone/server.js");
} catch {
  throw new Error(
    "Production build missing. Run npm run build before npm start.",
  );
}
await cp(".next/static", ".next/standalone/.next/static", { recursive: true });
await cp("public", ".next/standalone/public", { recursive: true });
await import("../.next/standalone/server.js");
