# @tokovo/apps-imessage

Tokovo's `app_imessage` plugin (iMessage-style UI) for episode authoring and rendering.

## What This Plugin Provides
- Runtime reducer + initial state (`viewMode` is always set)
- UI views
- Layout strategies (emit semantic regions for anchors)
- Layout-driven anchor provider (camera focus targets)
- Audio rules + sounds (send/receive/typing)

## App State Invariants
`app_imessage` must always satisfy:
- `viewMode` is a Tokovo core `ViewKind`
- When `viewMode === "CHAT"`, `conversationId` must be set

Mapping:
- `currentScreen === "list"` -> `viewMode = "FEED"`
- `currentScreen === "chat"` -> `viewMode = "CHAT"` + `conversationId = activeConversationId`
- `currentScreen === "info" | "media"` -> `viewMode = "FULLSCREEN"`

## Anchors
See `ANCHORS.md` for supported anchor IDs and when they exist.

## Tests
```sh
pnpm --filter @tokovo/apps-imessage test
```

