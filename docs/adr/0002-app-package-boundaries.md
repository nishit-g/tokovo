# ADR 0002: App Package Boundaries

## Status

Accepted

## Decision

Large app packages stay as single workspace packages, but they must expose domain boundaries through explicit subpath exports.

Canonical app package surfaces:

- root package export: authoring-friendly public surface only
- `/plugin`: runtime registration and manifest fragment
- `/contract`: bootstrap, schema, and event contracts
- `/dsl`: authoring helpers
- `/runtime`: reducer and selector consumers
- `/ui`: render components only
- `/lowering`: compiler/lowering helpers when needed

## Rules

- Root barrels must not re-export runtime, UI, lowering, camera, or asset internals.
- `contract` stays headless and cannot import `runtime`, `ui`, or `plugin`.
- `runtime` cannot depend on `ui` or plugin assembly.
- `dsl` and `lowering` cannot depend on `ui` or plugin assembly.
- `plugin` may compose other domains, but should stay thin and declarative.

## Consequences

- Consumers use intentional entrypoints instead of depending on package sprawl.
- Large app packages remain manageable without splitting the workspace graph further.
- ESLint can enforce the architecture instead of relying on convention.
