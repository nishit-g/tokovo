# Tokovo Architecture Guide

This document describes the package boundaries that keep Tokovo deterministic while staying code-first.

## Runtime Hierarchy

```text
Episodes and DSL
  -> compiler and ir
  -> core replay
  -> react and renderer
  -> video-runner
```

## Core Principles

### 1. Core Is Headless

`@tokovo/core` contains pure runtime logic with zero React dependencies.

### 2. Determinism Is Non-Negotiable

Renders must depend on committed manifest artifacts, committed episode code, and explicit runtime registration, not on live CMS reads or hidden mutable state.

### 3. Code Is Canonical For Authoring Data

Episodes, app snapshots, initial views, assets, and per-device theme choices live in checked-in TypeScript.

### 4. Story Logic Stays In Code

`*.episode.ts` files own scene choreography, timing, camera direction, audio direction, and app sequencing.

## Frame-0 Bootstrap Model

Tokovo supports exactly one bootstrap model:

- `device()` defines device and OS state only
- `snapshot(appId, deviceId, data)` defines plugin-owned app data before frame 0
- `view(appId, deviceId, data)` defines the explicit frame-0 UI route
- timeline events define live mutations after frame 0

Legacy device-owned app history is not supported. The compiler does not synthesize app conversations, feeds, or threads.

## Plugin Ownership

Each app plugin owns:

- the snapshot schema
- the initial-view schema
- version migration rules for those schemas
- validation before hydration
- hydration into runtime state

This keeps app-domain logic inside app packages and keeps `@tokovo/compiler` orchestration-only.

## Local Workflow

1. edit episode code
2. build the video surface
3. preview or render from the checked-in repo state
