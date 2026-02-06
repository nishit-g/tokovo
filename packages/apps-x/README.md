# @tokovo/apps-x

Tokovo's `app_x` plugin (X/Twitter-style UI) for episode authoring and rendering.

## What This Plugin Provides
- Runtime reducer + initial state (`viewMode` is always set)
- UI views
- Layout strategies (emit semantic regions for anchors)
- Layout-driven anchor provider (camera focus targets)
- Optional audio rules (tap + notification soft)

## App State Invariants
`app_x` must always satisfy:
- `viewMode: "FEED" | "CHAT" | "FULLSCREEN" | ...` (Tokovo core `ViewKind`)
- When `viewMode === "CHAT"`, `conversationId` must be set (we map to `activeThreadId`)

Mapping:
- `currentScreen === "compose"` -> `viewMode = "FULLSCREEN"`
- `currentScreen === "thread"` -> `viewMode = "CHAT"` + `conversationId = activeThreadId`
- otherwise -> `viewMode = "FEED"`

## Anchors
See `ANCHORS.md` for supported anchor IDs and when they exist.

## Tests
```sh
pnpm --filter @tokovo/apps-x test
```

