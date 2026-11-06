# جوانه · Javaneh

A Persian-first weight-gain diary for adults: personal calorie estimates, Iranian food search, daily meal logs, weight trends, and practical snack ideas. Built with Next.js/TypeScript, PostgreSQL, Drizzle, Better Auth, Tailwind and Radix Dialog. Fonts are bundled locally.

## Local development

Requires Node.js 22.12+ (Node 24 tested), npm, and PostgreSQL 17 (or Docker Compose).

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local`. Set a unique database password and a random authentication secret of at least 32 characters. `openssl rand -hex 32` can generate one. Do not commit this file.
3. With Docker, set `POSTGRES_PASSWORD` in your shell to the same password in `DATABASE_URL` and run `docker compose -f compose.dev.yaml up -d db`. Existing database volumes retain their original password.
4. Run `npm run db:migrate` (safe to repeat).
5. Run `npm run dev` and open the application on port 3000. Set `BETTER_AUTH_URL` to the exact origin used in the browser; this also protects authenticated writes against cross-origin requests.
6. Create an account and complete onboarding. No sample accounts or fabricated user history are installed.

For Codex cloud tasks, use the existing isolated checkout rather than creating another Git worktree unless explicitly requested. Processes and containers must not be assumed to survive an environment restore; restart services using the commands above.

## Checks

```sh
npm run db:migrate
npm run test
npm run typecheck
npm run build
npm run test:e2e
```

The browser suite starts a production server against the configured database. It creates disposable test accounts and deletes them at the end of successful tests. Use a separate test database for CI; failed tests may leave test accounts. The browser executable defaults to `/usr/bin/chromium` in this cloud environment; set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` on another system, or change the Playwright config to use an installed Playwright browser. Tests cover Persian input, calorie calculations, signup, persistent logs, editing, personal foods, saved meals, weight history, export, responsive RTL, and account deletion.

## Build and run everything with Docker Compose

```sh
cp .env.compose.example .env
# Edit .env. Generate two independent values with: openssl rand -hex 32
# Set POSTGRES_PASSWORD and BETTER_AUTH_SECRET to those values.
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

Open http://localhost:3000. Compose starts PostgreSQL, waits for its health check, applies the versioned database migrations, and then starts the app. The app health check verifies its database connection. Both application images use the same multi-stage Dockerfile; migration and runtime containers run as a non-root user. PostgreSQL has no published port by default. The app binds to loopback so it can be placed behind your HTTPS reverse proxy.

To use another host port, change `APP_PORT` and `BETTER_AUTH_URL` together in `.env`. For a public deployment, use your actual HTTPS origin for `BETTER_AUTH_URL`; configure the reverse proxy to forward to the loopback port. The configured origin must match the browser URL for authentication and diary writes.

In this managed cloud environment, add the supplied proxy CA during builds:

```sh
docker compose -f compose.yaml -f compose.proxy.yaml up -d --build
```

`compose.proxy.yaml` reads `CODEX_PROXY_CERT` and mounts it as a BuildKit secret. Normal machines do not need that override. TLS verification stays enabled and the CA is not copied into image layers.

For an update, pull the code and rerun `docker compose up -d --build`. For an explicit migration run use `docker compose run --rm migrate`. Use `docker compose down` to stop services while retaining data. **`docker compose down -v` deletes the database volume**, so use it only for intentionally disposable data. Back up the database before upgrades; schema downgrades are not automatic.

For development with Next.js outside Docker, use the database-only command in the local development section. `.env.local` supplies host-side application settings; `.env` supplies Compose interpolation. Both are ignored by Git and excluded from Docker build context.

## Production

Set `DATABASE_URL`, a unique `BETTER_AUTH_SECRET`, and an HTTPS `BETTER_AUTH_URL`. Apply migrations before starting the new release. Terminate TLS at your reverse proxy; keep PostgreSQL off the public Internet. Run `npm run build` followed by `npm start`, or build the provided Dockerfile. Back up PostgreSQL regularly and test restoration. Never use the example database password in production.

For Docker builds behind the managed environment's HTTPS proxy, pass `--secret id=proxy_ca,src="$CODEX_PROXY_CERT"`; the Dockerfile mounts the certificate only during dependency installation. For ordinary builds without a proxy, the optional mount is unused. Build the `migrate` target to run migrations as a separate release job; build the default `runner` target for the application. Migrations are not run automatically on every server start.

## Product behavior and limits

- Adult BMI and Mifflin–St Jeor maintenance estimates; a 300 kcal surplus is suggested only below BMI 25. All estimates are starting points, not medical advice. Users may edit their goals. Under-18s and self-reported pregnancy/breastfeeding, unintended weight loss, or eating-disorder history are directed away from automatic onboarding.
- Protein guidance is a general 1.2 g/kg reference, not a personalized medical prescription.
- The 100-food starter catalog is deliberately labeled approximate. It is **not** an authoritative Iranian nutrition table. Dish and household portion values vary. Validate and license a proper food dataset before marketing nutritional accuracy. Personal foods can use label values per 100g, including custom portion weights.
- Meal logs snapshot nutrient values. Subsequent catalog edits cannot rewrite past nutrition. Saved meals and yesterday's diary can be repeated; users can edit/delete the resulting entries independently.
- Dates are stored as ISO calendar dates and presented in Persian/Jalali. The default day and reminder clock use Asia/Tehran. Weight trends use actual time intervals; the dotted line averages up to seven recorded measurements, not necessarily seven calendar days.
- Meal ideas are not automatically filtered for allergies. The interface explicitly asks users to check ingredients. Preferences are private notes for now.
- Reminder messages run **only while the app is open**; there are no push notifications, SMS, or background reminders.
- Email/password auth works without third-party login. Email verification and password recovery are not configured: they require a transactional email provider before public launch. Better Auth's default rate limiting is per process; multi-instance deployments need shared rate limiting.
- Data is scoped to the signed-in user. JSON export and permanent account deletion are available in settings; deletion cascades through sessions and all diary data. Backups have their own retention policy.
- No offline synchronization, AI calorie estimates, barcode scanner, wearable integration, or automatic calorie adjustment is included.

A production launch still needs food-data validation, email delivery/recovery, backup/retention operations, and review of health/privacy copy for the intended market. Nothing is deployed or published automatically.
