# @tokovo/renderer

`@tokovo/renderer` is the React and Remotion rendering surface for Tokovo.

## Responsibilities

- render devices and app surfaces from runtime state
- compute layout for chat, feed, lockscreen, transition, and other view types
- render camera and audio layers with deterministic frame behavior

## Important Boundary

`@tokovo/renderer` should render through registries and runtime contracts. It should not become the place where app-specific behavior is hardcoded.

## Layout Model

Renderer layout is view-kind driven:

- chat
- feed
- story or sequence-style full-screen views
- lockscreen
- transition

The layout layer should stay deterministic and avoid DOM measurement-dependent behavior.
