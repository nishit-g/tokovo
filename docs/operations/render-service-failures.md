# Render-Service Failures

Render-service failures now carry a stable `errorCode` and `errorStage`.

## Stages

- `cli`: invalid command or operator input
- `bootstrap`: render data preparation before composition selection
- `preflight`: environment and dependency checks
- `bundle`: Remotion bundle construction
- `browser`: browser startup and reuse
- `composition`: composition selection
- `render-media`: video render
- `render-poster`: poster frame render
- `storage`: artifact upload or storage configuration
- `artifacts`: metadata write or artifact lookup
- `render`: top-level job wrapper

## Codes

- `CLI_INVALID_ARGUMENT`: an operator flag or CLI argument is invalid
- `CLI_UNKNOWN_COMMAND`: unsupported render-service subcommand
- `ARTIFACT_NOT_FOUND`: no previous artifact was found for the requested episode
- `RENDER_DATA_FAILED`: video-runner library preparation failed
- `RENDER_PREFLIGHT_FAILED`: doctor/preflight checks failed
- `BUNDLE_FAILED`: Remotion bundle creation failed
- `BROWSER_LAUNCH_FAILED`: browser startup failed
- `COMPOSITION_SELECT_FAILED`: composition lookup failed
- `MEDIA_RENDER_FAILED`: video render failed
- `POSTER_RENDER_FAILED`: poster render failed
- `STORAGE_CONFIG_INVALID`: R2 upload was requested without a valid configuration
- `STORAGE_UPLOAD_FAILED`: artifact upload to R2 failed
- `ARTIFACT_WRITE_FAILED`: metadata/log artifact writing failed
- `RENDER_JOB_FAILED`: top-level render wrapper failure

## Operator Flow

1. Read `errorCode` and `errorStage` first.
2. If the failure is `preflight`, run `pnpm render:doctor`.
3. If the failure is `bundle`, `browser`, `composition`, `render-media`, or `render-poster`, rerun with `pnpm render:smoke:trace` or `pnpm render:episode:trace`.
4. If the failure is `storage`, verify R2 settings in `apps/render-service/.env.local`.
5. Check the job-local `logs.ndjson` artifact for the correlated `jobId`, `episodeId`, and `sourceSignature`.
