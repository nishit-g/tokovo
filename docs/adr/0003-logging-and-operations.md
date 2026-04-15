# ADR 0003: Logging And Operator Visibility

## Status

Accepted

## Decision

Tokovo logging is core infrastructure. It is not modeled as an app plugin.

The canonical logging model is:

- structured `LogEntry` objects from `@tokovo/core`
- engine observability hooks for replay lifecycle and event timing
- package/runtime bootstrap logs for registration and manifest composition
- render-service NDJSON job logs written next to artifacts

## Default Profiles

- `quiet`: production-like minimum noise
- `operator`: lifecycle visibility without per-event spam
- `full`: bootstrap, lifecycle, event, perf, and audio visibility

## Rules

- Runtime and render-service logs must carry correlation fields when available: `jobId`, `episodeId`, `event`, `frame`, `sourceSignature`.
- CLI and operator flows should expose named presets instead of forcing manual env-var memorization.
- Raw `console.*` is allowed only in the logging backend itself and in intentional CLI/script output.
- Failures should include a stable error code and render stage where applicable.

## Consequences

- Operators can switch between quiet, operator, and full trace modes without changing code.
- Boot, registration, replay, and render failures become diagnosable from logs and docs.
