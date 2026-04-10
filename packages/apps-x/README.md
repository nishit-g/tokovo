# @tokovo/apps-x

`@tokovo/apps-x` is the X plugin package for Tokovo.

## Responsibilities

- X runtime reducer and initial state
- X React views
- feed, thread, and compose layout support
- anchor integration for camera work
- track-builder and authoring helpers

## State Contract

`viewMode` should always be present. Thread-focused state should only be considered active when the current thread context is available.

See `ANCHORS.md` for anchor IDs.
