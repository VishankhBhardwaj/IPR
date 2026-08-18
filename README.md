# IPR Portal deployment

The project has two deployable services:

- `Backend`: Express API and PostgreSQL/Prisma application.
- `Frontend`: Vite React single-page application.

## Backend

1. Create a PostgreSQL database and set the production variables from `Backend/.env.example` in your hosting provider. `DATABASE_URL`, `JWT_SECRET`, and `CLIENT_URL` are required when `NODE_ENV=production`.
2. Generate a long random `JWT_SECRET` (at least 32 characters). Do not commit a `.env` file.
3. From `Backend`, install and prepare the release:

   ```bash
   npm ci
   npm run db:generate
   npm run db:deploy
   npm start
   ```

4. Configure the platform health check as `GET /health` and expose the platform-provided `PORT`.

The included `Backend/Dockerfile` builds the API image. Run `npm run db:deploy` as a release/pre-deploy command before starting a new version; do not run schema migrations automatically in every application instance.

## Frontend

1. Copy `Frontend/.env.example` to `.env` locally, or set `VITE_API_URL` to the public API URL in your frontend host’s build environment. Do not include a trailing slash.
2. Build with:

   ```bash
   npm ci
   npm run build
   ```

3. Publish `Frontend/dist`. For Vercel, `Frontend/vercel.json` provides the required SPA fallback.
4. Set the backend `CLIENT_URL` to the exact frontend origin, for example `https://portal.example.com`. Use comma-separated origins only when genuinely needed.

## Production checklist

- Use a managed PostgreSQL service with backups and TLS.
- Run database migrations before rolling out application code.
- Set all secrets in the deployment provider’s secret manager, never in Git.
- Create a separate **read-only PostgreSQL user** for the optional AI database feature (`DB_*`).
- Confirm `https://your-api.example.com/health` returns `{ "status": "ok" }` after deployment.
- Test login, protected patent routes, and a browser refresh on a nested frontend route.
