---
name: tokovo-authoring
description: Use when creating, editing, validating, or reviewing Tokovo phone-native episodes, app simulators, device systems, camera direction, audio cues, overlays, docs, or render workflows in this repository.
---

# Tokovo Authoring

Use this skill for Tokovo repo work. Tokovo is a deterministic TypeScript monorepo for multi-device shows that happen inside phones.

## Core Rules

- Same authored input and same frame must produce the same runtime state and render output.
- Code is the source of truth: episodes, snapshots, views, device state, camera, audio, overlays, backgrounds, and catalogs live in checked-in TypeScript.
- App packages own app semantics. Do not move snapshot/view/reducer/layout/anchor behavior into the compiler or renderer.
- Runtime registration must be explicit. Missing plugins, anchors, catalogs, or assets should fail loudly.
- Camera work should use semantic anchors. Avoid one-off DOM geometry and render-pixel guesses.
- Sound, voice, background, overlay, and render decisions should be declared in episode data.
- Multi-device episodes should intentionally direct focus across devices.
- Do not commit generated renders, local outputs, caches, secrets, or env files unless they are intentional docs showcase assets.

## First Files To Read

- `AGENTS.md` for repo-wide agent instructions.
- `README.md` for public positioning and quickstart commands.
- `docs/ARCHITECTURE.md` for package boundaries.
- `docs/V1_STABILITY.md` for release readiness.
- `docs/CAMERA_V1_REFERENCE.md` for camera authoring.
- `apps/docs/app/showcase/page.mdx` for current showcase episodes.

## Common Commands

```bash
pnpm validate
pnpm -s typecheck:solution
pnpm --filter @tokovo/episodes test
pnpm --filter video-runner typecheck
```

For release-oriented changes:

```bash
pnpm verify:release
```

Preview and render:

```bash
pnpm --filter video-runner dev
EPISODE_ID=v2-creator-series-showcase pnpm --filter video-runner render:fast
```

## Episode Workflow

1. Add or edit a `*.episode.ts` file under `packages/episodes/src`.
2. Define metadata with `defineEpisode`.
3. Use the code-first episode builder for devices, snapshots, views, app tracks, camera, audio, overlays, and device tracks.
4. Register the episode in the release or studio catalog.
5. Run `pnpm validate`.
6. Preview in `apps/video-runner`.
7. Render at least one real pass before treating camera/layout changes as done.

## Public Repo Hygiene

- Keep names, sample stories, and copy public-ready.
- Avoid private jokes, personal sample names, unlicensed media, and style references that imply affiliation with another brand.
- Update docs when public authoring syntax, plugin boundaries, package responsibilities, or release commands change.
