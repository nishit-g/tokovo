# @tokovo/apps-whatsapp

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
