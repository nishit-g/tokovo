# Agent Guide

This repository is a TypeScript monorepo for Tokovo, an AI-native studio for multi-device shows that happen inside phones. Treat it as a deterministic rendering engine, not a normal web app.

## Product Shape

- Tokovo authors phone-native episodes in checked-in TypeScript.
- Episodes can stage one or many devices, simulated apps, OS surfaces, camera direction, sound, voice, backgrounds, overlays, and render settings.
- The core invariant is deterministic replay: the same authored input and same frame should produce the same runtime state and render output.

## Repo Map

- `packages/episodes`: canonical episode definitions, curated catalogs, validation, runtime plugin manifest.
- `packages/dsl`: fluent authoring builders for devices, app tracks, camera, audio, overlay, and device tracks.
- `packages/compiler`: lowering, compiler plugins, bootstrap preparation, audio/camera directors.
- `packages/core`: headless runtime, world state, event replay, registries, logging contracts.
- `packages/renderer`: React render surface and camera-aware layout.
- `packages/apps-*`: app simulators. Each app owns snapshots, views, reducers, selectors, layouts, anchors, DSL helpers, and audio rules.
- `packages/device-*` and `packages/devices`: device profiles, chrome, camera, keyboard, notifications, and OS-owned interactions.
- `apps/video-runner`: local Remotion preview and MP4 render surface.
- `apps/render-service`: render-service CLI and render orchestration primitives.
- `apps/docs`: public docs site.
- `apps/web`: marketing site.

## Commands

Use `pnpm` with Node.js 20 or newer.

```bash
pnpm install
pnpm validate
pnpm --filter video-runner dev
EPISODE_ID=v2-creator-series-showcase pnpm --filter video-runner render:fast
```

Focused checks:

```bash
pnpm lint:ox
pnpm lint:release
pnpm -s typecheck:solution
pnpm --filter @tokovo/episodes test
pnpm --filter web typecheck
pnpm --filter docs build
```

Release gate:

```bash
pnpm verify:release
```

## Engineering Rules

- Keep changes scoped. Avoid broad refactors unless they are required for the user-visible behavior.
- Prefer existing package boundaries and local helper APIs over new abstractions.
- Use structured TypeScript data and package contracts rather than ad hoc string parsing.
- Core runtime code must stay headless and must not depend on React, Remotion, browser APIs, wall-clock time, or live network state.
- Runtime registration must be explicit. Missing plugins, anchors, assets, or catalogs should fail loudly.
- App semantics belong in app packages, not in the compiler or renderer.
- Camera targets should use semantic anchors. Do not hardcode one-off DOM geometry or render-pixel guesses in episode code.
- Audio cues, generated sounds, voice tracks, backgrounds, and overlays should be declared as episode data.
- Multi-device episodes should author device focus intentionally and avoid conflicting concurrent camera intent.
- Generated renders, local output folders, caches, secrets, and env files should stay out of git unless they are intentional docs showcase assets.

## Public Repo Hygiene

- Do not introduce personal names, private jokes, unlicensed media, or brand/style references that make the public repo look like a private scratchpad.
- Keep docs aligned with the actual package surface. If authoring syntax, plugin boundaries, render flows, or release workflows change, update docs in the same change.
- Check `ASSET_LICENSES.md` before adding bundled media or generated assets.

## Useful References

- `README.md`: public positioning and first-run commands.
- `CONTRIBUTING.md`: contributor workflow and PR checklist.
- `docs/ARCHITECTURE.md`: runtime and package boundaries.
- `docs/V1_STABILITY.md`: v1 readiness bar.
- `docs/CAMERA_V1_REFERENCE.md`: camera authoring rules.
- `apps/docs/app/showcase/page.mdx`: showcase catalog and render commands.
