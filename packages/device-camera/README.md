# @tokovo/device-camera

`@tokovo/device-camera` owns camera intents, anchor-aware framing support, camera diagnostics, and camera tooling for Tokovo.

## Responsibilities

- runtime camera behavior
- semantic-anchor framing helpers
- camera diagnostics and CLI support
- camera director integration used by `@tokovo/compiler`

## Current Authoring Modes

- compile-time camera direction through `CameraDirectorPlugin`
- explicit camera choreography through the DSL

Use the plugin for repetitive coverage. Use explicit camera code when the scene needs custom direction.
