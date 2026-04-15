# Tokovo Logging

Tokovo now treats logging as core runtime infrastructure, not as an app plugin concern.

## What Logs Exist

- Core structured logs from `@tokovo/core`
- Runtime lifecycle and middleware logs from engine observability
- Plugin registration and lookup logs from bootstrap and plugin manager
- Render-service job logs written as `logs.ndjson` alongside render artifacts

## How Logs Show Up

### Local console

Console logging is pretty-printed with:

- level badges
- component colors
- timestamps
- correlation tags such as `job`, `episode`, `event`, `frame`, and `sig`

### Render-service artifacts

Each render-service job writes structured NDJSON logs next to the artifact output unless overridden with `TOKOVO_LOG_PATH`.

Typical path:

```text
out/renders/<episode-id>/<job-id>/logs.ndjson
```

## Logging Controls

These flags are read from environment variables by Node runtimes:

- `TOKOVO_LOG_PROFILE`
  Values: `quiet`, `operator`, `full`
- `TOKOVO_LOG_LEVEL`
  Values: `debug`, `info`, `warn`, `error`
- `TOKOVO_LOG_COMPONENTS`
  Comma-separated component filter, for example `render-service,engine,plugin`
- `TOKOVO_LOG_CONSOLE`
  Enables or disables pretty console output
- `TOKOVO_LOG_COLORS`
  Enables or disables ANSI colors in Node consoles
- `TOKOVO_LOG_TIMESTAMPS`
  Enables or disables timestamp prefixes
- `TOKOVO_LOG_INCLUDE_STACKS`
  Includes stack traces in serialized error payloads
- `TOKOVO_LOG_EVENTS`
  Emits per-event engine lifecycle logs
- `TOKOVO_LOG_PERF`
  Emits timing/performance logs
- `TOKOVO_LOG_AUDIO`
  Emits audio policy and playback logs
- `TOKOVO_LOG_TIMING_THRESHOLD_MS`
  Minimum event duration before a perf log is emitted
- `TOKOVO_LOG_PATH`
  Overrides the NDJSON output path for Node jobs

## Browser / Studio Flags

When you need to toggle logs inside browser-driven preview flows, set globals before the runtime boots:

```ts
globalThis.__TOKOVO_LOG_LEVEL = "debug";
globalThis.__TOKOVO_LOG_COMPONENTS = ["engine", "plugin", "renderer"];
globalThis.__TOKOVO_LOG_CONSOLE = true;
globalThis.__TOKOVO_LOG_COLORS = true;
globalThis.__TOKOVO_LOG_TIMESTAMPS = true;
globalThis.__TOKOVO_LOG_INCLUDE_STACKS = true;
globalThis.__TOKOVO_LOG_EVENTS = true;
globalThis.__TOKOVO_LOG_PERF = true;
globalThis.__TOKOVO_LOG_AUDIO = false;
globalThis.__TOKOVO_LOG_TIMING_THRESHOLD_MS = 1;
```

## Recommended Defaults

### Named Profiles

- `quiet`
  Production-like minimum noise. Event, perf, and audio tracing stay off unless explicitly enabled.
- `operator`
  Shows lifecycle, registration, and job progress without per-event spam.
- `full`
  Shows bootstrap, lifecycle, per-event flow, perf timing, and audio traces.

### Full lifecycle visibility

Use this when you want to watch bootstrap, plugin registration, replay boundaries, per-event processing, and timing in real time:

```text
TOKOVO_LOG_PROFILE=full
TOKOVO_LOG_LEVEL=debug
TOKOVO_LOG_COMPONENTS=*
TOKOVO_LOG_CONSOLE=true
TOKOVO_LOG_COLORS=true
TOKOVO_LOG_TIMESTAMPS=true
TOKOVO_LOG_INCLUDE_STACKS=true
TOKOVO_LOG_EVENTS=true
TOKOVO_LOG_PERF=true
TOKOVO_LOG_AUDIO=true
TOKOVO_LOG_TIMING_THRESHOLD_MS=1
```

What you will see with that preset:

- runtime bootstrap start and completion
- each runtime manifest entry registration
- plugin registration and plugin lookup hits
- replay start/end hooks
- per-event engine processing logs
- event timing logs above the threshold
- audio policy/playback logs
- render-service preflight, bundle, composition, browser, and artifact logs

`TOKOVO_LOG_COMPONENTS=*` means “do not filter by component.” Leaving the variable unset has the same effect.

### Local debugging

```text
TOKOVO_LOG_PROFILE=full
TOKOVO_LOG_LEVEL=debug
TOKOVO_LOG_COMPONENTS=app,engine,plugin,render-service,renderer,compiler
TOKOVO_LOG_CONSOLE=true
TOKOVO_LOG_COLORS=true
TOKOVO_LOG_TIMESTAMPS=true
TOKOVO_LOG_INCLUDE_STACKS=true
TOKOVO_LOG_EVENTS=true
TOKOVO_LOG_PERF=true
TOKOVO_LOG_TIMING_THRESHOLD_MS=1
```

### Internal production-like runs

```text
TOKOVO_LOG_PROFILE=operator
TOKOVO_LOG_LEVEL=info
TOKOVO_LOG_COMPONENTS=app,engine,plugin,render-service,compiler
TOKOVO_LOG_CONSOLE=true
TOKOVO_LOG_COLORS=true
TOKOVO_LOG_TIMESTAMPS=true
TOKOVO_LOG_INCLUDE_STACKS=false
TOKOVO_LOG_EVENTS=false
TOKOVO_LOG_PERF=false
TOKOVO_LOG_AUDIO=false
```

## Operator Expectations

- Runtime bootstrap should log plugin registration and catalog profile selection.
- Full-visibility runs should show each manifest entry as it registers.
- Engine observability should log replay boundaries, event timing, and replay failures.
- Plugin validation and registration should log warnings and overwrite conditions.
- Render-service jobs should always carry `jobId` and `episodeId` correlation.

If logs are noisy, reduce `TOKOVO_LOG_LEVEL`, narrow `TOKOVO_LOG_COMPONENTS`, or disable `TOKOVO_LOG_EVENTS`.

## Operator Shortcuts

- `pnpm dev:trace`
- `pnpm dev:operator`
- `pnpm dev:render:trace`
- `pnpm render:doctor:trace`
- `pnpm render:smoke:trace`
- `pnpm render:episode:trace`

For render failures and next-step diagnostics, see `docs/operations/render-service-failures.md`.
