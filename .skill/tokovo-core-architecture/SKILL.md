---
name: tokovo-core-architecture
description: Tokovo core runtime architecture, event routing, registries, WorldState, determinism rules, and plugin contract tiers. Use when explaining or modifying engine behavior, plugin registration flow, event kinds, state shape, or config defaults.
---

# Tokovo Core Architecture

## Overview
Explain and validate Tokovo's core runtime architecture and invariants. Use this skill when you need to reason about event flow, WorldState shape, registries, determinism rules, or the plugin contract across the engine.

## Quick Start
1. Identify the question: event routing, state shape, registries, determinism, or config defaults.
2. Open the relevant reference in `references/`.
3. Cross-check the repo paths listed in the reference before making changes.

## Architecture Checkpoints
- **Event pipeline**: Track → Lowering → Runtime → Reducer → WorldState → UI.
- **Registries**: app reducers, eventKinds, views, layouts, anchors, assets.
- **Determinism**: no `Date.now()` or `Math.random()` in runtime path.
- **WorldState**: appState, devices, camera, audio, config.
- **Plugin tiers**: Tier A/B/C/D responsibilities and required fields.

## Decision Tree
- Need to understand event routing? See `references/events-and-routing.md`.
- Need to reason about state shape? See `references/world-state.md`.
- Need registry/lifecycle details? See `references/registries-and-lifecycle.md`.
- Need determinism rules? See `references/determinism.md`.
- Need config defaults? See `references/config-and-defaults.md`.
- Need the non-negotiables? See `references/v1-invariants.md`.

## References
- `references/architecture.md`
- `references/world-state.md`
- `references/events-and-routing.md`
- `references/registries-and-lifecycle.md`
- `references/determinism.md`
- `references/config-and-defaults.md`
- `references/maintenance-checklist.md`
- `references/v1-invariants.md`
