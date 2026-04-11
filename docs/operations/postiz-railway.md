# Postiz On Railway

This is the production deployment path for Postiz in Tokovo.

## Architecture

- `www.tokovo.io` stays on Vercel
- Postiz runs on Railway, ideally at `postiz.tokovo.io`
- Tokovo continues to talk to Postiz over the public API
- Social OAuth tokens stay inside Postiz
- Production media storage should use R2, not local disk

## Railway services

Create one Railway project for Postiz and provision these services:

- `postiz-app`
- `temporal`
- `temporal-elasticsearch`
- `temporal-ui`
- `Postgres`
- `Redis`
- `Postgres-RU7-`

Current intended mapping:

- `Postgres` is the Postiz application database
- `Redis` is the Postiz application Redis
- `Postgres-RU7-` is the Temporal database

If you recreate the project, prefer clearer names, but keep the same separation.

## Public routing

Attach your public domain directly to `postiz-app`, but make sure the domain target port is set to `5000`.

This matters because the Postiz container exposes:

- `3000` for the backend API
- `4200` for the frontend
- `5000` for the nginx entrypoint that correctly joins both

On Railway, the working pattern is:

- service domain created with `targetPort: 5000`
- custom domain updated with `targetPort: 5000`

If you cannot control target port cleanly in Railway, use the optional Caddy fallback in:

- [`deploy/postiz/railway/proxy/Dockerfile`](/Users/nishit.gupta/personal/tokovo/deploy/postiz/railway/proxy/Dockerfile)

## App service

Deploy `postiz-app` from:

- [`deploy/postiz/railway/postiz-app/Dockerfile`](/Users/nishit.gupta/personal/tokovo/deploy/postiz/railway/postiz-app/Dockerfile)

The wrapper exists for one reason: Postiz's internal public proxy is on `5000`, while the backend runs on `3000`.

Set the environment from [`deploy/postiz/railway/postiz-app.env.example`](/Users/nishit.gupta/personal/tokovo/deploy/postiz/railway/postiz-app.env.example).

Important values:

- `MAIN_URL=https://postiz.tokovo.io`
- `FRONTEND_URL=https://postiz.tokovo.io`
- `NEXT_PUBLIC_BACKEND_URL=https://postiz.tokovo.io/api`
- `DATABASE_URL` should come from the Postiz Postgres service
- `REDIS_URL` should come from the Postiz Redis service
- `TEMPORAL_ADDRESS=temporal.railway.internal:7233`
- `STORAGE_PROVIDER=cloudflare`

Attach a persistent volume to `/uploads` even when using R2. It gives you a fallback path for local provider testing and migration safety.

## Temporal service

Temporal needs the same dynamic config file that we used locally in Docker Compose. Do not deploy it as a raw image without that file.

Deploy the Temporal service from:

- [`deploy/postiz/railway/temporal/Dockerfile`](/Users/nishit.gupta/personal/tokovo/deploy/postiz/railway/temporal/Dockerfile)

Required environment:

```env
DB=postgres12
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PWD=replace-with-temporal-postgres-password
POSTGRES_SEEDS=postgres-ru7.railway.internal
DYNAMIC_CONFIG_FILE_PATH=/etc/temporal/config/dynamicconfig/development-sql.yaml
ENABLE_ES=true
ES_SEEDS=temporal-elasticsearch.railway.internal
ES_VERSION=v7
TEMPORAL_NAMESPACE=default
```

## Elasticsearch service

`temporal-elasticsearch` can run from `elasticsearch:7.17.27`.

Set:

```env
cluster.routing.allocation.disk.threshold_enabled=true
cluster.routing.allocation.disk.watermark.low=512mb
cluster.routing.allocation.disk.watermark.high=256mb
cluster.routing.allocation.disk.watermark.flood_stage=128mb
discovery.type=single-node
ES_JAVA_OPTS=-Xms256m -Xmx256m
xpack.security.enabled=false
```

## Temporal UI service

`temporal-ui` can run from `temporalio/ui:2.34.0`.

Set:

```env
TEMPORAL_ADDRESS=temporal.railway.internal:7233
```

Expose it on a Railway domain or keep it private if you do not need public access.

## R2 mapping

Tokovo render-service uses `R2_*` or `TOKOVO_R2_*` variables. Postiz expects Cloudflare-named variables:

- `R2_ACCOUNT_ID` or account id from `R2_ENDPOINT` -> `CLOUDFLARE_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID` -> `CLOUDFLARE_ACCESS_KEY`
- `R2_SECRET_ACCESS_KEY` -> `CLOUDFLARE_SECRET_ACCESS_KEY`
- `R2_BUCKET` -> `CLOUDFLARE_BUCKETNAME`
- `R2_REGION` -> `CLOUDFLARE_REGION`
- `R2_PUBLIC_BASE_URL` -> `CLOUDFLARE_BUCKET_URL`

Use:

- [`scripts/postiz/print-postiz-r2-env.mjs`](/Users/nishit.gupta/personal/tokovo/scripts/postiz/print-postiz-r2-env.mjs)
- [`scripts/postiz/print-postiz-cloudflare-env.mjs`](/Users/nishit.gupta/personal/tokovo/scripts/postiz/print-postiz-cloudflare-env.mjs)

to derive the Postiz variables from an existing Tokovo env file.

To push those values directly into Railway:

- [`scripts/postiz/set-railway-postiz-storage.mjs`](/Users/nishit.gupta/personal/tokovo/scripts/postiz/set-railway-postiz-storage.mjs)

Example:

```bash
pnpm postiz:set-railway-storage /absolute/path/to/.env
```

Current state:

- Railway Postiz is still on `STORAGE_PROVIDER=local`
- this is deliberate until a Tokovo-specific bucket and valid Cloudflare auth are confirmed

## TikTok and media reachability

TikTok requires:

- HTTPS callback URLs
- HTTPS Terms and Privacy pages
- media files to be publicly reachable over HTTPS

For Tokovo:

- Terms: `https://www.tokovo.io/legal/terms`
- Privacy: `https://www.tokovo.io/legal/privacy`
- TikTok callback: `https://postiz.tokovo.io/integrations/social/tiktok`

Using `STORAGE_PROVIDER=cloudflare` with a public bucket URL is the correct production path.

## Current Railway project

The current project created for this rollout is:

- project name: `tokovo-postiz`
- project id: `45e1dad0-be3c-4a67-9bcb-005cee885cb3`

The current working Railway service domain for the app service is:

- `https://postiz-app-production-9e74.up.railway.app`

It is configured to target port `5000` and returns a working Postiz frontend.

The custom domain currently configured is:

- `postiz.tokovo.io`

DNS still needs to be updated:

- `postiz.tokovo.io` CNAME -> `m81d1086.up.railway.app`
