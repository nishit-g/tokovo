# KeyboardPlugin

`KeyboardPlugin` is a compile-time helper in `@tokovo/compiler` that reduces repetitive keyboard choreography in authored episodes.

## Purpose

Use it when an episode has repeated message-entry beats and you want keyboard behavior generated consistently instead of hand-authoring every keyboard event.

## Scope

The plugin is an authoring accelerator. It does not replace explicit scene direction when a sequence needs custom timing or custom keyboard behavior.

## Recommended Use

- enable it for repetitive text-entry flows
- keep explicit overrides for special dramatic beats
- verify the resulting pacing in `video-runner`
