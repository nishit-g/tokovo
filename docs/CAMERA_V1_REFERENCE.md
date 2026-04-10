# Tokovo Camera Reference

This document captures the current camera-authoring expectations for Tokovo v1.

## Principles

- camera behavior must stay deterministic
- semantic anchors beat brittle pixel guessing
- long tracking spans are usually better than repeated reset choreography
- app packages should expose stable semantic regions before camera code gets complicated

## Authoring Paths

Tokovo supports two camera paths:

1. compile-time direction through `CameraDirectorPlugin`
2. explicit choreography through the camera DSL

Use the director for sane defaults and explicit camera code for hero beats, reveals, and multi-step
focus transitions.

## Preferred Anchor Targets

Prefer semantic targets such as:

- `device`
- `app`
- `header`
- `content`
- `inputArea`
- `lastMessage`
- app-specific semantic regions like feed cards, profile hero, notification rows, or call controls

Avoid camera code that depends on:
- raw DOM assumptions
- row indexes without stable fallback anchors
- one-off geometry embedded directly in episode code

## Authoring Guidance

- use `focus()` for clear handoffs
- use tracking spans for scrolling or live conversational motion
- keep shock effects short and intentional
- verify camera behavior against a real render, not only preview

## V1 Camera Bar

An app package is not camera-ready until:

1. its key screens emit semantic regions
2. its anchor provider maps those regions into stable anchor names
3. flagship and exhaustive episodes demonstrate the anchor set
4. the camera can traverse list, detail, composer, and notification states without collapsing to fallback framing

## Tooling

`@tokovo/device-camera` remains the camera system package and the `tokovo-camera` CLI remains the
right place for linting, previewing, and migration support.

## Constraint

Tokovo currently treats camera as one render-time system across the composition, even when multiple
devices are visible. Multi-device episodes should still author focus intentionally and avoid
conflicting concurrent camera intent.
