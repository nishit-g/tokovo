# Tokovo

[![Release Gate](https://github.com/nishit-g/tokovo/actions/workflows/release-gate.yml/badge.svg)](https://github.com/nishit-g/tokovo/actions/workflows/release-gate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-10.28.2-F69220.svg)](package.json)

Tokovo is a programmable phone-simulation engine for creators making shorts, reels, TikToks, episodes, and series where the phone UI carries the story.

Write the story as TypeScript. Tokovo turns it into deterministic portrait video with device frames, app state, messages, feeds, notifications, calls, keyboard input, camera movement, audio, and render artifacts generated from checked-in code.

![Tokovo phone simulation preview](apps/docs/public/showcase/launch-poster.png)

[Watch the demo clip](apps/docs/public/showcase/launch-clip.mp4)

## What Tokovo Does

Tokovo gives creators and production teams a code-first workflow for phone-native stories:

1. Script an episode in TypeScript.
2. Seed realistic app and OS state.
3. Direct the camera with semantic UI anchors.
4. Preview the result in Remotion Studio.
5. Render portrait MP4s for Shorts, Reels, TikTok, and episodic story formats.

Every message, feed item, notification, device frame, camera move, audio cue, and asset reference stays reviewable in git.

## Why It Exists

Phone stories are a repeatable format, but most teams still rebuild chats, feeds, notifications, and edits by hand in timeline editors. Tokovo makes that format programmable:

- create one episode template and render many variants
- keep story timing, app state, camera, and assets in version control
- preview with Remotion and ship portrait video for social and episodic formats
- validate episodes before render so the same frame produces the same output every time

## What You Can Build

Tokovo's v1 target surface covers:

| Surface            | Package                                                             | What it covers                                                          |
| ------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Device and OS      | `@tokovo/devices`, `@tokovo/device-*`                               | iPhone-style frames, status UI, keyboard, notifications, camera anchors |
| Messaging          | `@tokovo/apps-whatsapp`, `@tokovo/apps-imessage`                    | chats, group threads, typing, read states, media-style cards            |
| Social apps        | `@tokovo/apps-instagram`, `@tokovo/apps-x`, `@tokovo/apps-snapchat` | feeds, stories, profiles, DMs, notifications                            |
| Work apps          | `@tokovo/apps-linkedin`, `@tokovo/apps-teams`                       | message threads, channels, profiles, activity surfaces                  |
| Storytelling tools | `@tokovo/overlay`, `@tokovo/background`, `@tokovo/voice`            | captions, backgrounds, music/audio cues, voice tracks                   |
| Rendering          | `video-runner`, `@tokovo/render-service`                            | local Remotion preview, MP4 export, render-service primitives           |

## Render The Showcase

Start with the creator-series showcase:

```bash
EPISODE_ID=v2-creator-series-showcase pnpm --filter video-runner render:fast
```

The render writes an MP4 and manifest under `apps/video-runner/out/`.

Then try app-specific showcases:

```bash
EPISODE_ID=whatsapp-flagship-v2 pnpm --filter video-runner render:fast
EPISODE_ID=instagram-flagship-v2 pnpm --filter video-runner render:fast
EPISODE_ID=x-flagship-v2 pnpm --filter video-runner render:fast
EPISODE_ID=typewriter-flagship-v2 pnpm --filter video-runner render:fast
```

## First 10 Minutes

```bash
pnpm install
pnpm validate
EPISODE_ID=v2-creator-series-showcase pnpm --filter video-runner render:fast
```

For interactive preview:

```bash
pnpm --filter video-runner dev
```

## Local Development

Requirements:

- Node.js 20 or newer
- pnpm 10.28.2

Install dependencies:

```bash
pnpm install
```

Open the main development surfaces:

```bash
pnpm dev
```

Preview only the renderer:

```bash
pnpm --filter video-runner dev
```

## Showcase Episodes

These are good first renders when checking the v1 target surface:

| Episode ID                    | Shows                                                                      |
| ----------------------------- | -------------------------------------------------------------------------- |
| `v2-creator-series-showcase`  | lockscreen, notifications, app switching, typed keyboard, camera direction |
| `whatsapp-flagship-v2`        | chat list, group thread, updates, calls, typed replies                     |
| `instagram-flagship-v2`       | story, DM, profile, creator-facing pacing                                  |
| `x-flagship-v2`               | timeline, post detail, replies, notifications                              |
| `typewriter-flagship-v2`      | typewriter app, procedural sound effects, text timing                      |
| `screen-recording-exhaustive` | OS chrome and screen-recording realism                                     |

The full showcase matrix is documented in `apps/docs/app/showcase/page.mdx`.

## Repo Map

| Path                  | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `packages/episodes`   | canonical episode definitions, release/studio catalogs, validation   |
| `packages/dsl`        | timeline builder primitives for devices, camera, OS, audio, overlays |
| `packages/compiler`   | lowers episode definitions into renderable IR                        |
| `packages/core`       | deterministic runtime, registries, logging, validation               |
| `packages/renderer`   | React render surface and camera-aware layout                         |
| `packages/apps-*`     | app simulators for phone-native stories                              |
| `packages/device-*`   | OS-owned interactions: camera, keyboard, notifications               |
| `apps/video-runner`   | Remotion preview/render app                                          |
| `apps/docs`           | public documentation site                                            |
| `apps/web`            | marketing shell                                                      |
| `apps/render-service` | render-service CLI and render orchestration primitives               |

## Authoring Flow

1. Create a `*.episode.ts` file in `packages/episodes/src`.
2. Define metadata with `defineEpisode`.
3. Build the timeline with the code-first episode builder.
4. Register the episode in the release or studio catalog.
5. Validate with `pnpm validate`.
6. Preview in `video-runner`.
7. Render with `pnpm --filter video-runner render:fast`.

## Release Gate

The canonical release gate is:

```bash
pnpm verify:release
```

For focused local work, these are the checks most contributors will use:

```bash
pnpm lint:ox
pnpm lint:release
pnpm -s typecheck:solution
pnpm validate
pnpm --filter @tokovo/episodes test
pnpm --filter video-runner typecheck
pnpm --filter docs build
```

## Documentation

- `apps/docs/app/page.mdx` is the documentation home.
- `apps/docs/app/showcase/page.mdx` lists the current v1 showcase surface.
- `apps/docs/app/getting-started/quickstart/page.mdx` is the fastest render path.
- `apps/docs/app/getting-started/first-episode/page.mdx` explains the authoring shape.
- `apps/docs/app/guides/object-storage-assets/page.mdx` explains local and object-storage assets.
- `docs/ARCHITECTURE.md` describes runtime boundaries.
- `docs/V1_STABILITY.md` defines the v1 readiness bar.
- `docs/operations/release.md` documents the release gate.
- `docs/operations/public-release.md` tracks public-release readiness.
- `ASSET_LICENSES.md` records bundled asset provenance.

Run the docs site locally:

```bash
pnpm --filter docs dev
```

## V1 Readiness

The public v1 bar is intentionally strict:

- app simulators must own their reducers, views, anchors, and DSL helpers
- episodes must validate before they are rendered
- camera targets should resolve to semantic anchors instead of fallback boxes
- docs assets must be intentional, licensed, and listed in `ASSET_LICENSES.md`
- generated renders stay out of git unless they are part of the docs showcase

## Contributing

Start with `CONTRIBUTING.md`, keep changes scoped, and run the relevant checks before opening a pull request.

For security issues, follow `SECURITY.md` instead of opening a public issue.

## License

Tokovo is released under the MIT License. See `LICENSE`.
