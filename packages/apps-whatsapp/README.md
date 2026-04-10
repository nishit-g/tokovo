# @tokovo/apps-whatsapp

`@tokovo/apps-whatsapp` is the WhatsApp plugin package for Tokovo.

## Responsibilities

- WhatsApp runtime reducer and initial state
- WhatsApp React views
- deterministic chat and feed layout support
- anchor integration for camera work
- audio rules and assets
- DSL track-builder support

## State Contract

- `viewMode` is required
- when the app is in chat mode, a conversation context must be available

See `ANCHORS.md` for anchor IDs and `LAYOUT_LOGIC.md` for layout-specific notes.
