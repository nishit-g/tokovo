# Renderer Layering

Overlays are rendered above devices and should be:
- immune to camera transforms
- consistent across multi-device layouts

Repo paths:
- Overlay component: `packages/renderer/src/overlays/StoryOverlay.tsx`
- Exports: `packages/renderer/src/overlays/index.ts`, `packages/renderer/src/index.ts`
- Composition:
  - Multi-device: `packages/renderer/src/MultiDeviceRenderer.tsx`
  - Video runner: `apps/video-runner/src/EpisodeRenderer.tsx`

