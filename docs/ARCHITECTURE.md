# Tokovo Architecture Guide

Tokovo is a deterministic, code-first system for rendering scripted device experiences.
The architecture is intentionally split so authoring, compilation, runtime replay, app plugins,
device chrome, and rendering each have a narrow job.

## Stack Overview

```text
Episode definitions and DSL
  -> @tokovo/ir
  -> @tokovo/compiler
  -> @tokovo/core
  -> app and device plugins
  -> @tokovo/react and @tokovo/renderer
  -> video-runner / render-service
```

## Non-Negotiable Principles

### 1. Determinism First

The same authored input and the same frame must always produce the same runtime state and the same
render output.

Tokovo must not depend on:
- live CMS reads
- hidden mutable state
- import-time registration side effects
- non-versioned app bootstrap behavior

### 2. Core Stays Headless

`@tokovo/core` owns runtime state transitions, registries, replay, and engine contracts. It must
not depend on React or Remotion.

### 3. Code Is The Source Of Truth

Episodes, snapshots, initial views, device state, themes, backgrounds, camera direction, audio
direction, and curated catalogs all live in checked-in TypeScript.

### 4. Plugins Own App Semantics

App packages own their bootstrap schemas, reducers, selectors, lowering, layouts, anchors, and UI.
The compiler orchestrates them; it does not invent app-domain state.

## Authoring Model

Tokovo now has one authoring model for frame-0 app state:

- `device(id, profile, options)` defines device and OS state
- `snapshot(appId, deviceId, data)` seeds plugin-owned app data before frame 0
- `view(appId, deviceId, data)` optionally selects the explicit initial surface
- tracks and timeline events describe mutations after frame 0

This means:
- app history is not authored through device state
- the compiler does not synthesize conversations, feeds, threads, or notifications
- plugins validate and hydrate their own snapshots and views

## Package Responsibilities

### `@tokovo/ir`

Canonical authored-data and track-event contracts.

### `@tokovo/dsl`

The fluent episode builder:
- devices
- snapshots and views
- app tracks
- camera/audio/overlay/device tracks
- compiler-plugin wiring

### `@tokovo/compiler`

Compilation and preparation:
- lower tracks into runtime events
- run compiler plugins
- orchestrate plugin-owned bootstrap contracts
- produce prepared runtime input for replay and rendering

### `@tokovo/core`

Deterministic replay and runtime:
- world state
- reducer registries
- event indexing
- engine contracts
- device and app runtime types

### App Packages

Each app plugin owns:
- snapshot schema
- initial-view schema
- bootstrap validation and hydration
- runtime reducer and selectors
- DSL entrypoints and lowering
- layouts and semantic anchors
- UI surfaces

### Device / System Packages

System realism packages own:
- devices and chrome metrics
- keyboard
- notifications
- camera direction
- overlays and OS surfaces

## Episode Catalog Model

Tokovo now exposes a storybook-style episode catalog.

Canonical catalog types:
- `app_showcase_flagship`
- `app_showcase_exhaustive`
- `app_showcase_theme`
- `system_showcase`
- `story`
- `test`
- `legacy`

Visible curated catalogs are:
- `showcases/apps`
- `showcases/system`
- `stories`

Legacy content remains runnable under `legacy`, but curated catalogs should contain only new
enterprise episodes.

## Runtime Registration

Registration must stay explicit.

That applies to:
- app plugins in `video-runner` and render runtimes
- episode catalogs in runner registries
- anchors, behaviors, and lowering contracts

If a plugin is not registered, Tokovo should fail loudly rather than guess.

## Device Realism Layer

System chrome is now treated as first-class product surface, not decoration.

That includes:
- status bar
- Dynamic Island
- lockscreen
- call overlays
- notifications
- keyboard lift and safe-area behavior

These surfaces should scale from device logical metrics, not hardcoded render-pixel guesses.

## Recommended Local Workflow

1. Author or edit the episode in TypeScript.
2. Validate snapshot/view/bootstrap assumptions in the relevant plugin package.
3. Build the affected packages.
4. Preview the episode in `video-runner`.
5. Render at least one real still or media pass before calling the change done.
