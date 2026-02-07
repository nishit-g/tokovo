# QA and Testing

## Minimal WorldState for Tests
Use canonical defaults:
- `DEFAULT_BASE_CAMERA_STATE`
- `DEFAULT_AUDIO_STATE`

Example pattern:
- Create minimal world state with `appState`, `devices`, `camera`, `audio`.
- Use Immer `produce` around reducer calls.

## Reducer Tests
- One test per runtime event type.
- Assert state changes only, no time/random side effects.

## Selector Tests
- Validate selector output for default, populated, and empty cases.

## DSL/Lowering Tests
- Validate TrackEvents generated from DSL with deterministic IDs.
- Validate lowering outputs RuntimeEvents with expected payloads.

## Smoke Tests
- Register plugin in `apps/video-runner/src/runtime.ts`.
- Add or update a small v2 episode that uses the plugin.
- Ensure `pnpm --filter video-runner test` passes (smoke suite).

## Determinism Tests
- Run the same episode twice and verify stable output (no frame drift or ID changes).
