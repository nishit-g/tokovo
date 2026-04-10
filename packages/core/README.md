# @tokovo/core

`@tokovo/core` is the deterministic runtime layer for Tokovo.

## Responsibilities

- replay and world-state computation
- engine registries and runtime contracts
- shared runtime types
- audio primitives and policies

## Key Rule

`@tokovo/core` must stay headless. It should not depend on React, renderer code, or app UI packages.

## What It Exposes

- world and event types
- replay helpers
- engine registries
- audio state and mixer primitives

## Role In The System

`@tokovo/core` sits after authoring and compilation, and before rendering. Same authored input and same frame should always produce the same runtime state.

See `docs/ARCHITECTURE.md` at the repo root for the current boundary overview and `docs/AUDIO.md` for audio-specific details.
