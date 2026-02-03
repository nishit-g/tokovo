# V1 Stability Checklist

This checklist defines the minimum bar for a stable V1 release.

**Release Checklist**
1. `pnpm install` completed with no lockfile conflicts.
2. `pnpm build` completed without errors.
3. `pnpm lint` completed without errors.
4. `pnpm --filter @tokovo/core test` completed without errors.
5. No secrets present in the repo or workspace.
6. `tokovo-validate` runs from the built CLI (`packages/episodes/dist/cli.js`).
7. App event contract is consistent: `kind: "APP"`, `type: <EVENT_TYPE>`, `payload: { ... }`.
8. `WorldState` and `AudioState` shapes are single-sourced.
9. Remotion dependencies are version-aligned.
10. Documentation uses public package exports (no `src/` deep imports).

**Stability Invariants**
1. Same `initialWorld`, `events`, and `t` always produce the same `WorldState`.
2. App reducers only mutate their own `appState` slice.
3. No rendering side-effects during module import.
4. Audio policy state is serializable.

**Build Commands**
1. `pnpm build`
2. `pnpm lint`
3. `pnpm --filter @tokovo/core test`
4. `pnpm --filter @tokovo/core test:coverage`

## Current Status (February 3, 2026)
1. Build: PASS (`pnpm build`)
2. Lint: PASS (`pnpm lint`).
3. Core tests: BLOCKED (`pnpm --filter @tokovo/core test`) - `vitest` binary missing in this environment.
4. CLI validate (source): PASS (`pnpm --filter @tokovo/episodes validate`) - help output works.
5. CLI validate (built): PASS (`node packages/episodes/dist/cli.js`).
6. Install: BLOCKED (`pnpm install`) - network access unavailable in this environment, lockfile not updated after dependency changes.
7. Coverage: READY (`pnpm --filter @tokovo/core test:coverage`) - requires `pnpm install` to run. Scope includes `src/audio/**`, `src/validation/**`, and engine registry/middleware/event-handlers.
