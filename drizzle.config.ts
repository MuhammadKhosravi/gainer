import { defineConfig } from "drizzle-kit";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
