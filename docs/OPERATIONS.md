# Tokovo Operations

**Status:** Canonical release, logging, and failure-response runbook  
**Toolchain:** Node.js `22.22.0` and pnpm `10.28.2` through mise

This is the only root operations document. It covers local verification, the release gate,
structured logging, render-service failures, cache diagnosis, and public-release hygiene.

## Toolchain

`.mise.toml` is the toolchain source of truth:

```bash
mise install
mise exec -- pnpm install
```

Use `mise exec --` in CI and non-interactive shells. Commands must not fall through to an
unsupported system Node installation.

## Focused verification

Use the smallest checks that prove the current change:

```bash
mise exec -- pnpm lint:ox
mise exec -- pnpm lint:release
mise exec -- pnpm -s typecheck:solution
mise exec -- pnpm --filter @tokovo/episodes test
mise exec -- pnpm --filter @tokovo/apps-whatsapp test
mise exec -- pnpm --filter @tokovo/apps-x test
mise exec -- pnpm --filter video-runner typecheck
mise exec -- pnpm --filter docs build
```

Do not run the full release gate after every local edit. Run it before a release or when a change
crosses enough boundaries that focused evidence is insufficient.

## Release gate

The only canonical release command is:

```bash
mise exec -- pnpm verify:release
```

The root script currently runs:

1. camera hard-cut policy;
2. visual-editor hard-cut policy;
3. asset-provenance verification;
4. package lint;
5. Oxlint;
6. release ESLint;
7. render-determinism policy lint;
8. solution typecheck;
9. episode/workspace validation;
10. package tests;
11. workspace builds;
12. independent render-determinism proof;
13. render-service smoke test;
14. documentation typecheck, lint, tests, and build.

The exact `package.json` script is authoritative if this list ever drifts.

A release branch must not merge while this gate is red. Render smoke and documentation verification
are release requirements because Tokovo is not healthy if it cannot produce a real artifact or
explain its current architecture.

## Render commands

Local interactive preview:

```bash
mise exec -- pnpm --filter video-runner dev
```

Fast review render:

```bash
EPISODE_ID=v2-creator-series-showcase \
  mise exec -- pnpm --filter video-runner render:fast
```

Release render:

```bash
EPISODE_ID=v2-creator-series-showcase \
  mise exec -- pnpm render:episode
```

Reference benchmark:

```bash
mise exec -- pnpm render:benchmark
```

See [Rendering and Performance](./RENDERING.md) for profiles, cache identity, measured phases, and
benchmark interpretation.

## Structured logging

Logging is core runtime infrastructure, not an app plugin. Logs come from:

- `@tokovo/core` replay and registries;
- runtime lifecycle and middleware observability;
- compiler and plugin bootstrap;
- renderer and camera;
- render-service job execution.

Render jobs write correlated NDJSON beside their artifacts unless `TOKOVO_LOG_PATH` overrides the
destination:

```text
out/renders/<episode-id>/<job-id>/logs.ndjson
```

### Logging controls

| Variable                         | Purpose                                                     |
| -------------------------------- | ----------------------------------------------------------- |
| `TOKOVO_LOG_PROFILE`             | `quiet`, `operator`, or `full` preset                       |
| `TOKOVO_LOG_LEVEL`               | `debug`, `info`, `warn`, or `error`                         |
| `TOKOVO_LOG_COMPONENTS`          | comma-separated component allowlist; `*` disables filtering |
| `TOKOVO_LOG_CONSOLE`             | pretty console output                                       |
| `TOKOVO_LOG_COLORS`              | ANSI color control                                          |
| `TOKOVO_LOG_TIMESTAMPS`          | timestamp prefix control                                    |
| `TOKOVO_LOG_INCLUDE_STACKS`      | include serialized error stacks                             |
| `TOKOVO_LOG_EVENTS`              | per-event engine lifecycle logs                             |
| `TOKOVO_LOG_PERF`                | timing logs                                                 |
| `TOKOVO_LOG_AUDIO`               | audio policy and playback logs                              |
| `TOKOVO_LOG_TIMING_THRESHOLD_MS` | minimum duration for a performance event                    |
| `TOKOVO_LOG_PATH`                | override NDJSON output path                                 |

Browser preview can set the equivalent `globalThis.__TOKOVO_*` flags before runtime bootstrap.

### Recommended profiles

`quiet` keeps production-like noise low. `operator` shows lifecycle, registration, and job progress
without per-event logs. `full` enables bootstrap, lifecycle, event, performance, and audio traces.

Full local diagnosis:

```bash
TOKOVO_LOG_PROFILE=full \
TOKOVO_LOG_LEVEL=debug \
TOKOVO_LOG_COMPONENTS='*' \
TOKOVO_LOG_INCLUDE_STACKS=true \
TOKOVO_LOG_EVENTS=true \
TOKOVO_LOG_PERF=true \
TOKOVO_LOG_AUDIO=true \
TOKOVO_LOG_TIMING_THRESHOLD_MS=1 \
mise exec -- pnpm render:episode:trace
```

Production-like local run:

```bash
TOKOVO_LOG_PROFILE=operator \
TOKOVO_LOG_LEVEL=info \
TOKOVO_LOG_INCLUDE_STACKS=false \
TOKOVO_LOG_EVENTS=false \
TOKOVO_LOG_PERF=false \
TOKOVO_LOG_AUDIO=false \
mise exec -- pnpm render:episode
```

Useful shortcuts:

- `mise exec -- pnpm dev:trace`;
- `mise exec -- pnpm dev:operator`;
- `mise exec -- pnpm dev:render:trace`;
- `mise exec -- pnpm render:doctor:trace`;
- `mise exec -- pnpm render:smoke:trace`;
- `mise exec -- pnpm render:episode:trace`.

Every render-service log should carry `jobId` and `episodeId`; signatures, frame, output, shot,
device, app, and event identities should be added where relevant.

## Render-service failure model

Render-service failures carry stable `errorCode` and `errorStage`.

### Stages

| Stage                       | Meaning                                  |
| --------------------------- | ---------------------------------------- |
| `cli`                       | invalid operator input                   |
| `bootstrap`                 | render-data preparation                  |
| `preflight`                 | environment and dependency checks        |
| `bundle`                    | Remotion bundle construction             |
| `browser`                   | browser launch or reuse                  |
| `composition`               | composition selection                    |
| `render-media`              | video render                             |
| `camera-texture-render`     | camera capture and reusable plate render |
| `camera-texture-compositor` | optical maps, chunks, concat, and mux    |
| `render-poster`             | poster render                            |
| `storage`                   | artifact upload or storage configuration |
| `artifacts`                 | metadata or artifact writing             |
| `render`                    | top-level job wrapper                    |

### Codes

| Code                            | Meaning                                          |
| ------------------------------- | ------------------------------------------------ |
| `CLI_INVALID_ARGUMENT`          | invalid flag or CLI argument                     |
| `CLI_UNKNOWN_COMMAND`           | unsupported render-service command               |
| `ARTIFACT_NOT_FOUND`            | requested prior artifact does not exist          |
| `RENDER_DATA_FAILED`            | video-runner preparation failed                  |
| `RENDER_PREFLIGHT_FAILED`       | doctor/preflight failed                          |
| `BUNDLE_FAILED`                 | Remotion bundle creation failed                  |
| `BROWSER_LAUNCH_FAILED`         | browser startup failed                           |
| `COMPOSITION_SELECT_FAILED`     | composition lookup failed                        |
| `MEDIA_RENDER_FAILED`           | video rendering failed                           |
| `CAM_TEXTURE_RENDER_FAILED`     | release camera capture or plate rendering failed |
| `CAM_TEXTURE_COMPOSITOR_FAILED` | optical composition, concat, or mux failed       |
| `POSTER_RENDER_FAILED`          | poster rendering failed                          |
| `STORAGE_CONFIG_INVALID`        | upload requested without valid configuration     |
| `STORAGE_UPLOAD_FAILED`         | artifact upload failed                           |
| `ARTIFACT_WRITE_FAILED`         | metadata or log writing failed                   |
| `RENDER_JOB_FAILED`             | top-level render wrapper failed                  |

### Operator response

1. Read `errorCode` and `errorStage`.
2. Read the job-local `logs.ndjson` using `jobId`, `episodeId`, and `sourceSignature`.
3. For `preflight`, run `mise exec -- pnpm render:doctor`.
4. For bundle, browser, composition, media, or poster failures, run
   `mise exec -- pnpm render:smoke:trace` or `mise exec -- pnpm render:episode:trace`.
5. For storage failures, verify the render-service environment and object-storage credentials.
6. Preserve the failure packet, camera diagnostics, render metadata, and projection hashes.

## Cache diagnosis

Cache corruption is a miss, never a successful artifact. Relevant events include:

- `camera.layer-plate.cache.hit|miss|store|store-failed`;
- `camera.texture.chunk.cache.hit|miss|store|store-failed`;
- `camera.texture.chunks.done`.

Miss reasons include `not-found`, `manifest-invalid`, `size-mismatch`, `checksum-mismatch`, and
`read-failed`.

Use a fresh root to distinguish cache state from renderer correctness:

```bash
TOKOVO_RENDER_CACHE_ROOT=/absolute/path/to/empty-cache \
  mise exec -- pnpm render:episode
```

Disable cache completely:

```bash
TOKOVO_RENDER_CACHE=off mise exec -- pnpm render:episode
```

Preserve intermediate optical graphs and maps:

```bash
TOKOVO_KEEP_CAMERA_WORKDIR=1 mise exec -- pnpm render:episode:trace
```

## Public-release checklist

Before a public tag:

- [ ] `mise exec -- pnpm verify:release` passes from a clean checkout.
- [ ] Default-branch protection requires `.github/workflows/release-gate.yml`.
- [ ] README installation, authoring, rendering, and support claims match the repository.
- [ ] `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and `CHANGELOG.md` are
      current.
- [ ] Issue and pull-request templates match maintainer workflow.
- [ ] `ASSET_LICENSES.md` covers bundled asset provenance and licenses.
- [ ] `.env.example` files contain placeholders only.
- [ ] No secrets, local `.env`, generated render output, or caches are tracked.
- [ ] Workspace packages remain private until an explicit publishing policy exists.
- [ ] Release notes are drafted from `CHANGELOG.md`.

Pre-publish audit:

```bash
git status --short
git ls-files | rg '(^|/)\.env($|\.)|\.pem$|secret|key' || true
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm verify:release
```

Npm publishing is currently out of scope while workspace packages are private.

## Incident evidence

Do not close a rendering incident with only “rerun passed.” Preserve:

- exact commit and toolchain;
- episode, source revision, source signature, and bundle-source signature;
- render profile, plan, output, and inclusive frame range;
- cache state;
- error code and stage;
- correlated NDJSON;
- camera diagnostics and failure packet;
- output hashes;
- the successful comparison run, if any.
