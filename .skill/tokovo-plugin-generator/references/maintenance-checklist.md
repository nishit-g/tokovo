# Maintenance Checklist

Use this checklist when the core architecture or generator templates change.

## Generator Templates
- Verify anchors exist and are wired in `plugin.ts`.
- Verify layout strategies exist and are wired in `plugin.ts`.
- Verify tokens + theme exist and UI uses them.
- Verify `eventKinds` list matches runtime event types.
- Verify module augmentation exists and imports are correct.
- Verify determinism rules (no `Date.now()`/`Math.random()`).

## Docs Sync
- Update `apps/docs/app/concepts/plugins/page.mdx` if plugin contract changes.
- Update `apps/docs/app/concepts/anchors/page.mdx` if anchor rules change.
- Update `apps/docs/app/packages/*` pages if new systems or APIs are added.
- Update `apps/docs/app/guides/building-app-plugin/page.mdx` when generator output changes.

## Camera/Anchors
- Anchor schema or framing changes → update templates + docs.
- Camera scale/zoom changes → update recipes + guides.

## Devices/Scaling
- Device profile or pixel density changes → update scaling references + recipes.
- Renderer scale changes → update output scaling sections in docs.

## Static Assets/Config
- Any asset registry changes → update templates and docs.
- TokovoConfig defaults change → update docs and system deep dive.
