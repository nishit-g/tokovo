# Tokovo

Tokovo is a programmable phone-simulation engine for cinematic storytelling. It turns authored episodes into high-fidelity phone UI videos with React and Remotion.

## Status

Tokovo is preparing for its v1 public release. The current release contract is documented in [`docs/V1_STABILITY.md`](docs/V1_STABILITY.md), and the canonical release gate is:

```bash
pnpm verify:release
```

The project is not yet committed to broad API stability outside the v1 surfaces documented in the repo. Expect active iteration while the authoring DSL, plugin contracts, and rendering workflows settle.

## What Tokovo Is For

Tokovo is built for code-authored videos where the phone UI is part of the story:

- deterministic phone and OS simulation
- app plugins for messaging, social, feed, and workspace surfaces
- camera-aware cinematic framing
- Remotion-based preview and rendering
- checked-in episodes that can be validated, tested, and rendered repeatably

The key invariant is that the same episode code and same frame should always produce the same render output.

## Quick Start

Requirements:

- Node.js 20 or newer
- pnpm 10.28.2

Install dependencies:

```bash
pnpm install
```

Run the main development surfaces:

```bash
pnpm dev
```

Run the release gate:

```bash
pnpm verify:release
```

Render a fast local episode preview:

```bash
EPISODE_ID=entity-command-center pnpm --filter video-runner render:fast
```

## Architecture

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

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) describes the main runtime boundaries.
- [`docs/V1_STABILITY.md`](docs/V1_STABILITY.md) defines the v1 readiness bar.
- [`docs/operations/release.md`](docs/operations/release.md) documents the release gate.
- [`docs/operations/public-release.md`](docs/operations/public-release.md) tracks public-release readiness.
- [`ASSET_LICENSES.md`](ASSET_LICENSES.md) records bundled asset provenance.

## Useful Commands

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm validate
pnpm verify:release
pnpm build:video
pnpm --filter docs build
EPISODE_ID=entity-command-center pnpm --filter video-runner render:fast
```

## Contributing

Contributions are welcome once the repository is public. Start with [`CONTRIBUTING.md`](CONTRIBUTING.md), keep changes scoped, and run the relevant checks before opening a pull request.

For security issues, follow [`SECURITY.md`](SECURITY.md) instead of opening a public issue.

## License

Tokovo is released under the MIT License. See [`LICENSE`](LICENSE).
