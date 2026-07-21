# @tokovo/device-keyboard

`@tokovo/device-keyboard` is Tokovo's deterministic multilingual text-input capability.

## Responsibilities

- serializable, field-scoped input-session contracts
- compile-time preparation of grapheme-safe operations
- random-access evaluation of drafts, selection, IME composition, and submission
- locale, direction, platform, theme, and presentation resolution
- the single canonical software-keyboard painter

## Current Role

Apps declare stable field IDs and read them with `useInputField`. A normal WhatsApp `send(..., { input })` and the advanced `.input(deviceId, fieldId, options)` builder both prepare the same canonical input program. Core does not store keyboard state, app runtime events do not trigger keyboard side effects, and no app owns a keyboard painter.
