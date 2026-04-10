# Postiz Deployment For Tokovo

Tokovo uses Postiz as the publishing control plane. Social credentials and OAuth tokens belong in Postiz, not in Tokovo.

## Files

- `deploy/postiz/docker-compose.yml`
- `deploy/postiz/postiz.env.example`
- `deploy/postiz/dynamicconfig/development-sql.yaml`

## Local startup

1. Copy the env template:

   `cp deploy/postiz/postiz.env.example deploy/postiz/postiz.env`

2. Fill in at minimum:

   - `JWT_SECRET`
   - `POSTIZ_DB_PASSWORD`
   - provider credentials for the platforms you will actually use
   - keep `DISABLE_REGISTRATION=false` for the first login, then switch it back to `true` after creating the initial admin account if you want to lock the instance down

3. Start Postiz with persistent volumes:

   `docker compose --env-file deploy/postiz/postiz.env -f deploy/postiz/docker-compose.yml up -d`

4. Open:

   - Postiz UI: `http://localhost:4007`
   - Temporal UI: `http://localhost:8080`

## Tokovo env

Tokovo only needs Postiz integration config:

```bash
POSTIZ_BASE_URL=http://localhost:4007
POSTIZ_API_KEY=...
PUBLISHING_STORAGE_ROOT=/absolute/path/to/tokovo/.tokovo/publishing
PUBLISHING_DB_PATH=/absolute/path/to/tokovo/.tokovo/publishing/metadata.db
PUBLISHING_ARTIFACT_SCAN_ROOT=/absolute/path/to/tokovo/out
```

The Postiz API key is created inside Postiz after first login. Do not commit it.

## Persistence and resets

This compose file uses named Docker volumes for:

- Postiz Postgres
- Postiz Redis
- Postiz uploads/config
- Temporal Postgres
- Temporal Elasticsearch

Safe operations:

- `docker compose -f deploy/postiz/docker-compose.yml restart`
- `docker compose --env-file deploy/postiz/postiz.env -f deploy/postiz/docker-compose.yml down`
- `docker compose --env-file deploy/postiz/postiz.env -f deploy/postiz/docker-compose.yml up -d`

Destructive operation:

- `docker compose --env-file deploy/postiz/postiz.env -f deploy/postiz/docker-compose.yml down -v`

`down -v` deletes the named volumes and wipes connected-account state, schedules, uploads, and Postiz database contents.

## Recovery expectations

If containers are recreated without deleting volumes, Postiz state survives.

If volumes are deleted, recovery requires restoring the Postiz Postgres data from backup and restoring any external storage you rely on.
