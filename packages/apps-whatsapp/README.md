# @tokovo/apps-whatsapp

## Long-thread regression

`whatsapp-chat-motion-proof` covers 24 seeded messages, date separators, typing, a small reacted
bubble, keyboard corrections, a composed photo reply, menus, media open/close,
back navigation and camera following. Render with:

```sh
mise exec -- pnpm build:video
mise exec -- pnpm --filter @tokovo/render-service render --episode whatsapp-chat-motion-proof --profile review --job chat-motion
```

The mounted thread now consumes the camera layout's message positions instead of independently
flowing bubbles. Arrival slots settle over 0.24 seconds from authored time, with no previous-frame
state. Keyboard occlusion and a four-line composer share the layout input projection. Explicit
`deliveredAt`/`readAt` frames take precedence over inferred delivery. Reaction clusters display up
to three emoji plus an overflow count, with matching camera bounds. Existing date, unread and
contact-photo projection remains app-owned.

`@tokovo/apps-whatsapp` is Tokovo's deterministic WhatsApp simulation package.

## Responsibilities

- WhatsApp runtime reducer and initial state
- strict snapshot, event, and lifecycle validation
- device-scoped locale, media/status viewers, gesture, and reply-composer state
- deterministic English and Arabic RTL React surfaces
- immutable thread projection, deterministic 120-message render windows, and measured 10,000-message layout support
- cinematic subjects for screens, messages, media, actions, and replies
- point/span DSL authoring and explicit runtime registration

## State Contract

- `locale` is always explicit (`en-US` or `ar`); unknown locales fail validation
- message IDs are stable, unique authoring contracts; positional references fail
- media transfer and playback are separate state machines
- media viewer, long-press, swipe-reply, and reply composer are authored state
- delivery failure/retry and fullscreen Status progression are explicit events
- `messages` is the only persisted conversation collection; derived indexes never compete with rendered state
- the removed `isPlaying`, `playProgress`, `VOICE_PLAY`, and `VOICE_PAUSE`
  contracts are rejected rather than translated
- missing messages, conversations, subjects, plugins, and invalid lifecycle transitions fail loudly

## Verification

```bash
pnpm --filter @tokovo/apps-whatsapp typecheck
pnpm --filter @tokovo/apps-whatsapp test
pnpm --filter @tokovo/apps-whatsapp benchmark:long-thread
pnpm --filter @tokovo/apps-whatsapp lint
EPISODE_ID=whatsapp-interaction-matrix-v3 pnpm --filter video-runner render:fast
```

See `CINEMATIC_SUBJECTS.md` for subject IDs and `LAYOUT_LOGIC.md` for layout-specific notes.

## Authoring coherent interactions

Incoming messages no longer mark outgoing messages read or discard the reading target.
Author `MESSAGE_READ` when the story requires a read receipt. Outgoing sends return to
the live edge and consume an active reply, including media sends. An explicit `replyTo`
on the send takes precedence. Dismissing an already-consumed reply is harmless.

Navigation closes gestures and viewers, retains authored text drafts, and restores each
conversation's saved reply and semantic reading target. Push/pop direction respects the
authored English or Arabic locale. Motion uses event frames, never CSS transitions or
previous-frame React state. Media and Status controls respect device safe areas.

Set `isFavorite: true` on a snapshot conversation to include it in Favorites and Calls
favorites. Pinning remains independent. Draft previews use the localized `chat.draft`
label. Supported locales remain `en-US` and `ar`; this is not a claim of arbitrary-language
translation support. Date interpretation remains deterministic UTC.

Within a WhatsApp track callback, scroll tab content in logical points:

```ts
wa.at("3s").scrollScreen("calls", 240, "0.4s");
wa.at("5s").scrollScreen("calls", 0, "0.3s");
```

Offsets persist per screen and animate deterministically, including random frame seeks.
Authors must choose offsets within their content; automatic content-bound clamping is
not implemented. Chat scrolling uses semantic message targets instead of pixel offsets.

## Layout and performance boundaries

- `WHATSAPP_INTERACTION_TOKENS` owns menu geometry and navigation/viewer durations.
  Existing theme palettes and typography own action colors and labels.
- Message menus share their selected-bubble geometry with semantic camera anchors.
  Copy and Info availability depends on message content and ownership.
- Text sizing uses word-aware, grapheme-safe explicit line breaks shared with text
  rendering, an ASCII fast path, and a bounded 1,024-entry measurement cache.
  Advances are conservative estimates, **not full font shaping**. Exact typography for
  all scripts and shaped emoji remains a fidelity limitation.
- Calls and Updates no longer discard rows at arbitrary six/four-item limits. Chat-list
  sort/filter logic is shared with camera layout and memoized in the view. Secondary
  screens are not virtualized; very large lists still need a dedicated rendering budget.
- The default generated keyboard click is mounted only for its short cue window.
  Custom keyboard assets retain their existing duration behavior. Click timbre has not
  been redesigned or listening-tested by this change.

Evidence: reducer, message-layout, message-actions, canonical-contract, localization and
long-thread tests cover these contracts. The call path is authored track → strict event
schema → reducer → shared layout → React surface. Run the commands above and render
`whatsapp-chat-motion-proof` for the single-device flow, or `whatsapp-cinematic-flagship`
for English/Arabic multi-device coverage. The latter has authored device-cropping camera
shots and is not a pixel-fidelity reference for every surface.
