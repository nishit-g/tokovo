# @tokovo/compiler

`@tokovo/compiler` lowers authored episode structures into runtime-friendly data for deterministic playback.

## Responsibilities

- lower track IR into runtime events
- normalize authored episode input
- host compile-time plugins such as typing-indicator automation
- prepare stage and camera programs independently from story replay
- prepare explicit input sessions for deterministic replay
- prepare notification intents, interactions, policy, and action effects

## Current Role

This package belongs between `@tokovo/dsl` and `@tokovo/core`.

It should:

- stay deterministic
- avoid renderer concerns
- transform authored intent into runtime-ready data

## Built-In Plugin Surface

Current exported compile-time plugins include:

- `AudioDirectorPlugin`
- `OSDirectorPlugin`
- `TypingIndicatorPlugin`

Those plugins are optional authoring accelerators. They should help eliminate repetitive timeline code, but they do not replace explicit scene direction when an episode needs custom pacing.

See `docs/ENGINEERING_HANDBOOK.md` for the canonical compilation and prepared-program architecture.
