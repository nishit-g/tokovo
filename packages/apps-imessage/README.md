# @tokovo/apps-imessage

`@tokovo/apps-imessage` is the iMessage plugin package for Tokovo.

## Responsibilities

- iMessage runtime reducer and initial state
- iMessage React views
- layout and subject integration
- audio rules where needed
- track-builder and authoring helpers

## State Contract

`viewMode` should always be present, and chat-specific state should only be considered active when the current conversation context is available.

See `CINEMATIC_SUBJECTS.md` for supported subject IDs.

## Native UI regression proof

The visual target is a restrained iOS 17-era Messages layout, not a pixel-exact replica of every
iOS release. Reference: [Apple's Messages guide](https://support.apple.com/guide/iphone/send-and-reply-to-messages-iph82fb73ba3/17.0/ios/17.0).

`imessage-native-ui` is a 24-second visual proof covering a single bubble, sender runs, multiline
text, replies, tapbacks, edited/unsent states, photos, voice-note presentation, links, SMS drafts,
light/dark themes, the conversation list, contact details, and the shared-photo grid.

```sh
mise exec -- pnpm build:video
mise exec -- pnpm --filter @tokovo/render-service render -- --episode imessage-native-ui --profile review --job native-ui
```

Headers and composer use border-box heights with device-provided insets. Short threads start below
the header; overflowing threads remain bottom-aligned to keep recent messages visible. Sender IDs,
not merely incoming/outgoing direction, determine grouping. Replies resolve only to earlier messages.
Unsent messages never paint their old text or media. Images use Tokovo's shared asset resolver.

The UI remains an episode-driven simulation: displayed controls do not implement a live messaging,
calling, payment, or voice-recording service. Voice-note waveforms show authored data or deterministic
fallback bars; audio playback must be authored separately.

## Long conversations and keyboard motion

`imessage-chat-motion-proof` seeds 24 messages across two dates, then exercises incoming typing,
a short reacted bubble, a multiline keyboard draft, send/delivered/read timing, a photo reply,
and a camera follow. Render it with the command above, replacing the episode ID.

The UI consumes the same per-message slots as the headless camera layout. Arrival slots settle
over 0.24 seconds from authored frames; scrolling is random-access safe. The device's interactive
bottom inset owns keyboard clearance, and the composer grows to four lines. Text wrapping uses
conservative headless glyph advances with explicit shared line breaks, not native font shaping.
Rich attachments use bounded presentation slots; this is not a general document viewer.

Message `timestamp` remains the arrival **frame**. Optional `sentAt` is authored epoch milliseconds
for UTC date separators/list times. Optional `deliveredAt` and `readAt` are receipt **frames** and
are supported by `send(..., options)` as well as snapshots. No read receipt is invented.
Receiving into the visible chat clears that sender's typing state without adding unread messages;
sending clears the conversation draft. Input cadence, pauses and corrections use the existing
episode `.input()` contract; submission and the app send should share a frame.
