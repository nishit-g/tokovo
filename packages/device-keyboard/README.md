# @tokovo/device-keyboard

`@tokovo/device-keyboard` is Tokovo's deterministic multilingual text-input capability.

## Responsibilities

- serializable, field-scoped input-session contracts
- compile-time preparation of grapheme-safe operations
- random-access evaluation of drafts, selection, IME composition, and submission
- locale, direction, platform, theme, and presentation resolution
- the single canonical software-keyboard painter

## Current Role

Apps declare stable field IDs and read them with `useInputField`. A normal WhatsApp `send(..., { input })` and the advanced `.input(deviceId, fieldId, options)` builder both prepare the same canonical input program. Core does not store keyboard state, app runtime events do not trigger keyboard side effects, and no app owns a keyboard painter.

## Keyboard flow verification

The iOS painter separates predictive suggestions, key rows, and the lower globe/dictation controls. It uses authored light/dark appearance, sentence capitalization, mirrored key-preview edge placement, and independent entrance/exit durations. Suggestions and corrections are scripted—not a live language model or a claim to reproduce Apple's prediction engine.

Both chat composers use `DraftText` from `@tokovo/react`: grapheme-safe selection highlighting, cursor positioning, activity-reset blinking, and a four-line text viewport that follows the caret. Browser measurement is confined to this small composer viewport; it never measures conversation history.

Input evaluation retains bounded checkpoints. Keyboard appearance is cached per immutable prepared session, and active-key lookup uses a binary-search index. `keyboard-flow.test.ts` verifies reverse seeking and that warmed projections do not rescan the authored operation array. Its timing report measures input projection only, not React painting or video encoding.

WhatsApp and iMessage remote typing indicators are silent by default. Only prepared local input operations generate automatic key audio; this avoids duplicate clicks and orphaned typing loops when a received message clears an indicator. Stylized remote typing sound must be explicitly authored as episode audio.

Run `mise exec -- pnpm --filter @tokovo/device-keyboard test` and render `imessage-chat-motion-proof` / `whatsapp-chat-motion-proof` to inspect typing, a deliberate pause, word selection, suggestion replacement, numeric entry, sending, and dismissal.

Reference: [Apple's iOS 26 typing guide](https://support.apple.com/guide/iphone/type-with-the-onscreen-keyboard-iph3c50f96e/ios). Bundled typography remains Tokovo's licensed substitute; this is not a pixel-identical system keyboard. Navigation transitions remain a separate follow-up.
