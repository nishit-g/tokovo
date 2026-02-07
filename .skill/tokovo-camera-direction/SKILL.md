---
name: tokovo-camera-direction
description: "Camera direction for Tokovo: camera DSL usage, anchors, framing, scale/zoom semantics, and movement recipes. Use when planning or debugging camera moves, focus, or anchor framing."
---

# Tokovo Camera Direction

## Overview
Plan and validate camera movement using Tokovo's camera DSL, anchors, and framing rules. Use this skill to design camera sequences, troubleshoot framing, and prevent scaling mistakes.

## Quick Start
1. Identify the target UI element and anchor.
2. Use camera DSL to set or animate scale/position.
3. Validate anchor rects (Tokovo v1 uses pixel-space `Rect` in viewport coordinates).
4. Test the sequence in video runner + smoke suite.

## Direction Checkpoints
- **Anchors**: anchors are plain IDs (`"lastMessage"`, `"tweet_card"`, `"keyboard"`).
- **Device-owned anchors** (always available): `device`, `app`, `keyboard`, `dynamicIsland`, `notification_banner`.
- **Scale**: keep camera scale consistent with layout + device scale.
- **Movement**: prefer explicit durations and easing.

## Always Read First
- Tokovo invariants: `../tokovo-core-architecture/references/v1-invariants.md`

## Decision Tree
- Need camera DSL usage? See `references/camera-dsl.md`.
- Need anchor rules? See `references/anchors-and-framing.md`.
- Need movement recipes? See `references/movement-recipes.md`.
- Need scaling rules? See `references/scaling-and-units.md`.

## References
- `references/camera-dsl.md`
- `references/anchors-and-framing.md`
- `references/movement-recipes.md`
- `references/scaling-and-units.md`
- `references/anti-patterns.md`
- `references/troubleshooting.md`
