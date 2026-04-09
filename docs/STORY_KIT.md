# Story-Kit Standard

Story-kit is the canonical high-level authoring layer for new production episodes.

## Use Story-Kit When

- the episode reuses known personas, assets, style kits, or device kits
- you want Studio-editable cast/device/style configuration
- a projection helper already exists for the app payload you need

Use low-level DSL directly when the work is purely scene choreography or a one-off prototype with no reusable casting layer.

## Canonical Pattern

```ts
const ep = storyEpisode("mega-x", {
  fps: 30,
  duration: "25s",
  title: "Mega X",
})

applyStudioStoryKitConfig(ep, megaXStoryKitConfig)

const kit = ep.kit()

ep.device("phone", phone.profile, kit.project.device("main_phone", {
  profile: "iphone16",
  app: "app_x",
}).options)
```

Rules:

- `storyEpisode(...)` is the default entrypoint for new production episodes.
- `kit.project.*` is the preferred route for app-facing objects.
- low-level `.device(...)` is still allowed, but it should define the final render device shape, not replace story-kit casting.

## Precedence

Resolution order is:

1. pack defaults
2. cast and device overrides
3. episode-level overrides

That means:

- `Episode > Cast/Device > Pack`

Examples:

- app theme override on a story-kit device beats the style kit theme
- cast avatar override beats the persona pack avatar
- explicit episode background beats the style kit background

## Mixed Authoring Rule

If an episode authors explicit low-level DSL devices, creator must not auto-materialize logical story-kit devices into IR.

This prevents duplicate same-app devices in IR and protects app initial state during prepare.

Use this split:

- story-kit devices: logical casting, pack-driven defaults
- low-level render devices: actual runtime devices passed to the DSL

## Projection Helpers

Use helpers instead of hand-building app payloads when they exist.

Current supported helpers:

- `kit.project.device(...)`
- `kit.project.whatsappConversation(...)`
- `kit.project.imessageConversation(...)`
- `kit.project.snapchatConversation(...)`
- `kit.project.xUser(...)`
- `kit.project.linkedinUser(...)`

If an app has no projection helper yet, raw payloads are still allowed.

## Studio Scope

Creator Studio edits:

- starter packs
- story-kit pack selection
- cast assignments
- logical device/style defaults

Creator Studio does not edit:

- scene beats
- camera choreography
- timeline timing
- app interaction choreography

Those stay code-first in the episode file.

## Canonical Examples

- WhatsApp: `/Users/nishit.gupta/personal/tokovo/packages/episodes/src/production/mega-v2-episode-whatsapp.episode.ts`
- X: `/Users/nishit.gupta/personal/tokovo/packages/episodes/src/production/mega-x.episode.ts`
- Crossover: `/Users/nishit.gupta/personal/tokovo/packages/episodes/src/production/story-kit-crossover-showcase.episode.ts`

Their editable Studio-owned setup lives in matching `*.story-kit.ts` sidecar files.
