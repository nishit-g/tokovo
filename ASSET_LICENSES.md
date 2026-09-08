# Asset Licenses

This file tracks bundled assets that ship with the repository.

## Audio (Procedural SFX)

- Location: `packages/assets/public/sounds/**`
- Source: procedurally generated in-repo (no samples)
- Generator: `scripts/generate-procedural-sfx.mjs`

## Demo Video

- Location: `apps/docs/public/showcase/launch-clip.mp4`
- Source: clipped from the rendered `v2-creator-series-showcase` Remotion output
- Render command: `EPISODE_ID=v2-creator-series-showcase OUT_FILE=out/public-release/v2-creator-series-showcase-full.mp4 CONCURRENCY=4 pnpm --filter video-runner render:fast`
- Clip command: `ffmpeg -ss 27.5 -i apps/video-runner/out/public-release/v2-creator-series-showcase-full.mp4 -t 7 ... apps/docs/public/showcase/launch-clip.mp4`
- Purpose: documentation showcase preview

## Demo Poster

- Location: `apps/docs/public/showcase/launch-poster.png`
- Source: generated from the rendered `v2-creator-series-showcase` Remotion output with `ffmpeg`
- Purpose: README and documentation preview image

## App and Story Media

- Location: `packages/assets/public/{avatars,backgrounds,banners,link-preview,maps,media,placeholders,stickers,wallpapers}/**`
- Purpose: original or generated local episode fixtures for app simulation demos
- License: `LicenseRef-Tokovo-Original-Fixture`; distributed with this repository for Tokovo examples and renders
- Per-file inventory: `packages/assets/public/asset-provenance.json` records the content hash, byte size, source category, and license of every bundled render asset.
- Policy: placeholder assets are forbidden. New third-party assets must declare their exact source and license here and in the per-file manifest before release validation passes.
- `packages/assets/public/media/launch-board.svg` is an original deterministic fixture authored in-repo for the WhatsApp cinematic showcase.
- `packages/assets/public/media/apology-template.svg` is an original deterministic incident-card fixture authored in-repo for the multi-app drama story.

## App Icons

- Location: `packages/assets/public/icons/**`
- Source: simplified vector fixtures authored in-repo for deterministic simulated UI
- Purpose: app identity in home-screen, status-bar, and notification render surfaces
- License: `LicenseRef-Tokovo-Original-Fixture`

## Device Calibration Assets

- Location: `packages/assets/public/assets/**`
- Source: original in-repository device calibration fixtures
- License: `LicenseRef-Tokovo-Original-Fixture`

## Demo Voice Fixtures

- Location: `packages/assets/public/voice/**`
- Source: generated demo voice and its deterministic timing manifest, including procedural character voice rendered by `@tokovo/blurb-voice`
- License: `LicenseRef-Tokovo-Original-Fixture`

## Performer Character Fixtures

- Location: `packages/assets/public/performers/**`
- Source: original generated character art created for Tokovo, chroma-keyed and split into deterministic full-body reaction poses in-repo
- License: `LicenseRef-Tokovo-Original-Fixture`
- Purpose: reusable performer identity and emotion poses in authored episodes

## Deterministic UI Fonts

- Packages: `@fontsource-variable/inter@5.3.0`, `@fontsource-variable/roboto@5.3.0`, `@fontsource-variable/roboto-mono@5.3.0`, `@fontsource-variable/noto-sans@5.3.0`, `@fontsource-variable/noto-sans-arabic@5.3.0`, `@fontsource-variable/noto-sans-devanagari@5.3.0`, and `@fontsource-variable/noto-sans-jp@5.3.0`
- Loaded by: `apps/video-runner` for every app and OS render surface through `@tokovo/visual-system`
- Source: Fontsource distributions of the named upstream font families
- License: SIL Open Font License 1.1 (`OFL-1.1`), included in each npm package
- Purpose: pin distinct iOS-style, Android-style, Arabic, Devanagari, and Japanese glyph metrics so renders never depend on host operating-system fonts

## Reviewed Render Goldens

- Location: `apps/video-runner/test-assets/render-goldens/**`
- Source: generated in-repo from checked-in deterministic Tokovo episodes
- Purpose: exact pixel regression coverage for reviewed UI states and system-surface lifecycles
