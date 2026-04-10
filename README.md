# Tokovo

Tokovo is a programmable phone-simulation engine for cinematic storytelling. It turns authored episodes into high-fidelity phone UI videos with React and Remotion.

## Current Architecture

Tokovo is code-first and deterministic at render time.

Episode code in `packages/episodes` owns timing, pacing, camera, audio, app seed data, and final scene construction.

`apps/video-runner` and `@tokovo/render-service` render directly from the checked-in episode registry. `apps/web` is a plain marketing shell.

## Repo Map

### Compiler and authoring

- `@tokovo/ir`
- `@tokovo/core`
- `@tokovo/dsl`
- `@tokovo/compiler`
- `@tokovo/episodes`

### Device and OS

- `@tokovo/devices`
- `@tokovo/device-camera`
- `@tokovo/device-keyboard`
- `@tokovo/device-notifications`
- `@tokovo/overlay`

### App plugins

- `@tokovo/apps-whatsapp`
- `@tokovo/apps-imessage`
- `@tokovo/apps-x`
- `@tokovo/apps-linkedin`
- `@tokovo/apps-snapchat`
- `@tokovo/apps-teams`
- `@tokovo/apps-typewriter`

### Rendering and media

- `@tokovo/react`
- `@tokovo/renderer`
- `@tokovo/background`
- `@tokovo/voice`

### Apps

- `apps/video-runner`
- `apps/web`
- `apps/docs`

## Authoring Flow

1. write the cinematic `*.episode.ts` in `packages/episodes`
2. register it in an episode catalog
3. preview through `video-runner`
4. render through `video-runner` or `@tokovo/render-service`

## Useful Commands

```bash
pnpm build
pnpm test
pnpm build:video
pnpm --filter docs build
EPISODE_ID=entity-command-center pnpm --filter video-runner render:fast
```

## Key Invariant

Same episode code and same frame should always produce the same render output.
