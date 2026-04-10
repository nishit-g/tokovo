# Tokovo Camera Reference

This document captures the current camera-authoring expectations for Tokovo.

## Principles

- camera behavior must stay deterministic
- semantic anchors are preferred over brittle element-specific guesses
- long tracking spans are usually better than repeated focus-reset choreography

## Current Controls

Tokovo supports two main camera paths:

- compile-time direction through `CameraDirectorPlugin`
- explicit scene choreography through the camera DSL

## Good Practice

- use anchor-focused camera work
- prefer semantic targets like `lastMessage`, `typingIndicator`, `inputArea`, or other stable app anchors
- use explicit camera code for special beats and climactic moments

## Tooling

`@tokovo/device-camera` ships the `tokovo-camera` CLI for linting, previewing, and migration support.

## Constraint

Tokovo currently treats camera as a single render-time system across the composition, even when multiple devices are visible.
