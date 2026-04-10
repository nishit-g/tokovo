# V1 Stability Checklist

This checklist defines the current minimum bar for a stable Tokovo release.

## Release Checklist

1. `pnpm build` passes.
2. `pnpm test` passes for the relevant packages.
3. `pnpm --filter docs build` passes.
4. A real episode render path is verified through `video-runner` or `@tokovo/render-service`.
5. Documentation reflects public package boundaries and the code-first flow.

## Stability Invariants

1. Same authored input and same frame produce the same runtime state.
2. Core replay remains headless and deterministic.
3. Runtime registration stays explicit.
4. Renders are driven entirely from checked-in code and assets.
