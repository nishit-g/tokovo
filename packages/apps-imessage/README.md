# @tokovo/apps-imessage

`@tokovo/apps-imessage` is the iMessage plugin package for Tokovo.

## Responsibilities

- iMessage runtime reducer and initial state
- iMessage React views
- layout and anchor integration
- audio rules where needed
- track-builder and authoring helpers

## State Contract

`viewMode` should always be present, and chat-specific state should only be considered active when the current conversation context is available.

See `ANCHORS.md` for supported anchor IDs.
