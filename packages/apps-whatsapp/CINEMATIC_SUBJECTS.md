# WhatsApp cinematic subjects (`app_whatsapp`)

WhatsApp camera targets come from the headless layout strategies. They do not depend on DOM queries or render-pixel guesses.

## Stable semantic subjects

- `header`, `profile`, `chat_thread`, `input_area`
- `typing_indicator` while a remote participant is typing
- `reply_composer` while swipe-to-reply has selected a message
- `message_actions` while a completed long press exposes message actions
- `last-message` and `last-media` as deterministic dynamic selectors

## Exact message entities

Use `cameraSubject.entity(deviceId, "app_whatsapp", "message", messageId, region)` with one of:

- `bubble`
- `reply`
- `media`
- `reactions`

Message IDs are the stable authoring contract. Positional aliases and legacy spellings are
intentionally unsupported. Missing authored subjects follow the shot's explicit fail, skip, or
single-declared-fallback policy instead of broadening to guessed geometry.

Long threads retain the complete authored history in headless state while the React tree mounts a deterministic window of at most 120 messages. Opening an unread conversation centers its stable first-unread ID; a newly authored message returns the viewport to the latest window.
