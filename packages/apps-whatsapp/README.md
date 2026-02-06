# @tokovo/apps-whatsapp

WhatsApp app plugin for Tokovo (runtime + UI + layouts + anchors + audio + DSL).

## What This Plugin Provides
- Runtime reducer + initial state (`viewMode` invariants enforced).
- UI root view (`WhatsappChatView`) and iOS strategy wiring.
- Layout strategies:
  - `FEED`: chat list + tab screens (status/calls/communities/settings)
  - `CHAT`: deterministic message layout + semantic regions
- Anchor provider (`anchorProvider`) exposing layout semantic anchors for the camera engine.
- Audio rules + sound assets.
- DSL extension for episode authoring.

## App State Invariants (Contract)
- `appState.app_whatsapp.viewMode` is required.
- When `viewMode === "CHAT"`, `conversationId` must be set.
- Screen mapping (canonical):
  - `currentScreen === "chat"` => `viewMode = "CHAT"`
  - everything else => `viewMode = "FEED"`

## Anchors (Authoring Contract)
See `ANCHORS.md`.

## Tokens / Theme
- Design tokens: `src/config/tokens.ts`
- Theme API: `src/config/theme.ts`
- Theme context: `src/ui/ThemeContext.tsx`

## Tests
```bash
pnpm --filter @tokovo/apps-whatsapp test
pnpm --filter @tokovo/apps-whatsapp build
```
