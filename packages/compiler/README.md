# @tokovo/compiler

`@tokovo/compiler` lowers authored episode structures into runtime-friendly data for deterministic playback.

## Responsibilities

- lower track IR into runtime events
- normalize authored episode input
- host compile-time plugins such as camera, typing-indicator, and keyboard automation

## Current Role

This package belongs between `@tokovo/dsl` and `@tokovo/core`.

It should:

- stay deterministic
- avoid renderer concerns
- transform authored intent into runtime-ready data

## Built-In Plugin Surface

Current exported compile-time plugins include:

- `CameraDirectorPlugin`
- `TypingIndicatorPlugin`
- `KeyboardPlugin`

Those plugins are optional authoring accelerators. They should help eliminate repetitive timeline code, but they do not replace explicit scene direction when an episode needs custom pacing.

See:

- `docs/KEYBOARD_PLUGIN.md`
- `docs/TYPING_INDICATOR_PLUGIN.md`
