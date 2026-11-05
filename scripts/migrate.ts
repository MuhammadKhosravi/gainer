import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
async function main() {
  const { db, pool } = await import("../src/lib/db");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Database migrations applied");
  await pool.end();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
