# Postiz On Coolify (Same AWS VM)

This is the recommended low-cost migration path now that Yoopbook is already stable on the shared AWS/Coolify VM.

## Recommendation

- Deploy Postiz on the same AWS VM for now.
- Keep it isolated in its own Coolify project and its own databases.
- Keep Railway running as rollback until the migration is verified.

Why this is reasonable:

- The current AWS VM has significant free headroom.
- Postiz's current official self-host path is Docker Compose with the Temporal stack.
- Postiz docs say their Compose setup has been tested on a `2 GB RAM / 2 vCPU` Ubuntu VM baseline.

## Target architecture

Create one Coolify project named `Postiz` with one Docker Compose resource from:

- `deploy/postiz/docker-compose.coolify.yml`

Services in that stack:

- `postiz`
- `postiz-postgres`
- `postiz-redis`
- `temporal`
- `temporal-postgresql`
- `temporal-elasticsearch`
- `temporal-ui`

Isolation rules:

- Do not share Postiz databases with Yoopbook.
- Do not share Postiz Redis with Yoopbook.
- Keep Postiz volumes separate.

## Domains

- Public app: `postiz.tokovo.io`
- Optional Temporal UI:
  - keep internal-only initially, or
  - expose later on something like `temporal.postiz.tokovo.io`

The public service must target Postiz's internal nginx/public port:

- container port `5000`

## Environment

Start from:

- `deploy/postiz/postiz.coolify.env.example`

Important production values:

- `MAIN_URL=https://postiz.tokovo.io`
- `FRONTEND_URL=https://postiz.tokovo.io`
- `NEXT_PUBLIC_BACKEND_URL=https://postiz.tokovo.io/api`
- `STORAGE_PROVIDER=cloudflare`
- Cloudflare R2 credentials
- provider OAuth credentials you actually use

Current Railway production already uses:

- Cloudflare R2
- Postgres
- Redis
- Temporal
- cron enabled

So the Coolify env should mirror Railway, not the local-only example file.

## Coolify setup

1. Create a new project: `Postiz`
2. Create a new Docker Compose resource from the Tokovo repo
3. Select:
   - compose file: `deploy/postiz/docker-compose.coolify.yml`
4. Add the env values from your production env file
5. Expose only the `postiz` service publicly on `postiz.tokovo.io`
6. Do not expose `postiz-postgres`, `postiz-redis`, or `temporal-postgresql`
7. Keep `temporal-ui` private initially unless you explicitly need it

## Data migration order

1. Keep Railway Postiz live
2. Deploy the Coolify Postiz stack on AWS
3. Confirm the blank/new instance loads
4. Dump Railway Postiz application Postgres
5. Restore that dump into `postiz-postgres`
6. Re-deploy or restart the `postiz` service
7. Verify:
   - admin login
   - connected social accounts
   - scheduled jobs
   - uploads/storage path
   - API key generation/usage
8. Switch `postiz.tokovo.io` only after those checks pass
9. Keep Railway as rollback for a short soak period

Notes:

- Redis is ephemeral and usually does not need a migration.
- The important state is the Postiz application Postgres data and any persistent uploads/config.
- Because production already uses R2, media storage should not be tied to local disk alone.

## Best current decision

- Cheapest path: same VM
- Cleanest long-term path: separate VM later if Postiz usage grows or Temporal/Elasticsearch become noisy

So the recommendation is:

- run Postiz on the same VM now
- split it to its own VM only if actual usage justifies it later
