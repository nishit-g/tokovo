# WhatsApp 10/10 acceptance gates

The package is complete only when every gate below is backed by an automated
check or a reviewed render artifact. A passing unit suite alone is not proof of
visual or product completeness.

## Runtime and authoring

- One persisted conversation collection and one selected `conversationId`.
- One public event shape from DSL through lowering and reduction; no aliases,
  payload duplication, normalization adapters, or silently dropped events.
- Snapshots validate every discriminated message and product entity, including
  cross-references. Missing state, conversations, messages, anchors, and assets
  fail before rendering.
- Every visible interactive state has a typed DSL event, schema, reducer
  transition, selector, semantic anchor, and deterministic visual result.

## Geometry and pixels

- React surfaces and semantic anchors consume the same layout recipes.
- Browser bounds and anchor bounds agree within 0.5 design pixels for every
  target in the QA matrix.
- A pinned Chromium/font/toolchain renders reviewed golden frames. CI performs
  exact pixel comparison and uploads the expected, actual, and diff images.
- Golden coverage includes narrow and wide iOS/Android devices, cutouts, light
  and dark UI, English and Arabic RTL, media viewers, status, calls, menus,
  keyboard states, delivery failures, and every message family.

## Product depth

- Messaging: send/receive/edit/delete/forward/info, selection, reactions,
  replies, search, unread navigation, polls, voice recording/playback, media
  upload/download/view-once/gallery, documents, contacts, and locations.
- Calls: incoming, outgoing, connecting, active, reconnecting, minimized, and
  ended states with group participants and authored controls.
- Updates: status create/view/pause/advance/reply/react/privacy/viewers and
  channel follow/mute/detail/feed/reaction states.
- Communities, settings, profiles, group administration, linked devices,
  privacy, storage, and backup surfaces are navigable authored state machines.

## UI quality

- Components use semantic color, type, spacing, radius, elevation, motion, and
  safe-area tokens; no presentation literals remain outside token definitions.
- Layout recipes remain readable without clipping from 320 to 480 design
  pixels, with long names, localized timestamps, enlarged type, and cutouts.
- Actionable controls are semantic, labelled, keyboard reachable, visibly
  focused, and have deterministic disabled/pressed states.
- Accessibility checks cover roles, names, tab order, focus, contrast, reduced
  motion, screen-reader output, and touch targets.

## Localization and performance

- User-visible state stores structured values, not prelocalized labels.
- Date, time, number, byte, duration, and plural formatting use pinned locale
  formatters. No handler writes English prose into state.
- English and Arabic RTL pass the full golden and accessibility matrix; adding
  another locale requires only catalog data.
- Projection and layout handle 10,000 messages, rendered chat windows remain
  bounded, conversation/update/call/community lists are windowed, and repeated
  frame rendering hits immutable caches without unbounded growth.

## Release evidence

- Package typecheck, tests, architecture tests, benchmarks, episode validation,
  full solution typecheck, lint, and release verification pass on Node 22 or 24.
- The final multi-device showcase is rendered from checked-in episode data and
  exercises the same golden-covered state matrix used by CI.
