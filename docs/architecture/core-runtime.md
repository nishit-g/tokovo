# Core Runtime

Tokovo core owns replay, registries, structured logging, and runtime observability.

## Logging

- `@tokovo/core` is the single logging authority
- Logs are structured by component and level
- Sinks can write to console, memory, or NDJSON files
- Engine observability is registered through middleware and lifecycle hooks

## Preparation

- `prepareTrackEpisode()` in `@tokovo/compiler` is the supported preparation entrypoint
- Legacy core preparation APIs are no longer part of the public surface

## Engine

- Replay is deterministic for the same initial world, events, and frame
- Middleware and lifecycle hooks are explicit runtime registrations
- Plugin reducers must be registered centrally during bootstrap
