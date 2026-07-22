# Asset Licenses

This file tracks bundled assets that ship with the repository.

## Audio (Procedural SFX)

- Location: `apps/video-runner/public/sounds/**`
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

- Location: `apps/video-runner/public/{avatars,backgrounds,banners,link-preview,maps,media,placeholders,stickers,wallpapers}/**`
- Purpose: local episode fixtures and visual placeholders for app simulation demos
- Policy: keep only assets that are either referenced by registered episodes, used by docs, or intentionally kept as reusable fixtures for new examples. New third-party assets must include provenance and license notes in this file.
- `apps/video-runner/public/media/launch-board.svg` is an original deterministic fixture authored in-repo for the WhatsApp cinematic showcase.

## App Icons

- Location: `apps/video-runner/public/icons/**`
- Source: simplified vector fixtures authored in-repo for deterministic simulated UI
- Purpose: app identity in home-screen, status-bar, and notification render surfaces

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
