# Asset Licenses

This file tracks bundled assets that ship with the repository.

## Audio (Procedural SFX)

- Location: `apps/video-runner/public/sounds/**`
- Source: procedurally generated in-repo (no samples)
- Generator: `scripts/generate-procedural-sfx.mjs`

## Demo Video

- Location: `apps/docs/public/showcase/launch-clip.mp4`
- Source: copied from `apps/video-runner/public/media/launch-clip.mp4`
- Purpose: documentation showcase preview

## Demo Poster

- Location: `apps/docs/public/showcase/launch-poster.png`
- Source: generated from `apps/docs/public/showcase/launch-clip.mp4` with `ffmpeg`
- Purpose: README and documentation preview image

## App and Story Media

- Location: `apps/video-runner/public/{avatars,backgrounds,banners,link-preview,maps,media,placeholders,stickers,wallpapers}/**`
- Purpose: local episode fixtures and visual placeholders for app simulation demos
- Policy: keep only assets that are either referenced by registered episodes, used by docs, or intentionally kept as reusable fixtures for new examples. New third-party assets must include provenance and license notes in this file.
