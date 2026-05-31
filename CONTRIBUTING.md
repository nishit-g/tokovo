# Contributing To Tokovo

Thanks for helping improve Tokovo. This repo is a TypeScript monorepo for deterministic phone UI simulation, episode authoring, and Remotion rendering.

## Development Setup

Requirements:

- Node.js 20 or newer
- pnpm 10.28.2

Install dependencies:

```bash
pnpm install
```

Run local development:

```bash
pnpm dev
```

## Repo Workflow

1. Open an issue or discussion for larger behavior changes.
2. Keep pull requests focused on one package, workflow, or user-visible behavior where possible.
3. Add or update tests for runtime, compiler, package contract, and rendering behavior changes.
4. Update docs when authoring syntax, plugin boundaries, package responsibilities, or release workflows change.
5. Run the narrowest relevant checks locally, then run the full release gate before release-oriented PRs.

## Checks

Common checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate
pnpm build
```

Canonical release check:

```bash
pnpm verify:release
```

`pnpm verify:release` is intentionally broader than normal development checks. It includes linting, typechecking, episode workspace validation, package builds, render smoke coverage, and docs verification.

## Determinism Bar

Tokovo's core invariant is:

> Same authored input and same frame should produce the same runtime state and render output.

Changes that affect replay, compilation, layout, camera behavior, asset loading, or app plugin state should preserve deterministic behavior and avoid hidden runtime dependencies on wall-clock time, DOM measurement, network state, or process-local mutable globals.

## Pull Request Checklist

- The change is scoped and described clearly.
- Tests cover the behavior or the PR explains why coverage is not applicable.
- Docs are updated when public behavior changes.
- Generated artifacts, local env files, and render outputs are not committed unless intentionally part of the change.
- Relevant package builds pass.
- `pnpm verify:release` passes for release-blocking changes.

## Security

Do not report vulnerabilities in public issues. Follow [`SECURITY.md`](SECURITY.md).
