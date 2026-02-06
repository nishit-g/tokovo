# Tokovo Architecture Guide

This document describes the architectural decisions and package boundaries in Tokovo.

## Package Hierarchy

```
@tokovo/core       Pure logic layer (no React, no UI)
     ↓
@tokovo/react      React bindings, UI types, registries
     ↓
@tokovo/renderer   React components for rendering
     ↓
@tokovo/apps-*     App-specific plugins (WhatsApp, etc.)
```

## Core Principles

### 1. Core is Headless
`@tokovo/core` contains pure business logic with **zero React dependencies**:
- Engine replay functions
- Event handlers
- Type definitions
- Config management

**ESLint enforces this** - importing `react`, `@tokovo/react`, or `@tokovo/renderer` from core will fail linting.

### 2. Immutable Config
The global config is deeply frozen via `createConfig()`:
```typescript
import { createConfig, TokovoConfig } from "@tokovo/core";

// Default config is immutable (frozen)
TokovoConfig.timing.defaultTransitionDuration = 100; // Throws!

// Create custom config for testing/overrides
const customConfig = createConfig({ timing: { ... } });
```

### 3. Render Mode Safety
In render mode, the engine enforces strict requirements:
- `replay()` throws - use `replayIncremental()` with StateCache
- Missing devices throw instead of silently failing
- Missing view state throws instead of guessing

### 4. Layout Caching
Two levels of caching:
1. **Per-conversation cache** (WhatsApp): Hashes message content, edits, reactions, previews
2. **Per-frame cache** (renderer): Caches layout output by world signature

## Package Boundaries (Enforced by ESLint)

| From Package | Cannot Import |
|--------------|---------------|
| `@tokovo/core` | `@tokovo/react`, `@tokovo/renderer`, `react` |
| `@tokovo/renderer` | `@tokovo/apps-*` (use registries) |

## Episode Registry

```typescript
import { createEpisodeRegistry } from "@tokovo/episodes";
const registry = createEpisodeRegistry();

// Get snapshot for multi-process pipelines
const episodes = getEpisodeRegistrySnapshot(registry);
```

## Legacy Exports

Deprecated exports are in `@tokovo/devices/legacy`:
```typescript
// ⚠️ Deprecated - use registries instead
import { iPhone16Frame } from "@tokovo/devices/legacy";
```

## Test Coverage

- **Core**: Comprehensive unit tests
- **Renderer**: `layout-engine.test.ts` - determinism tests
- **Apps**: `layout-cache.test.ts` - hash invalidation tests
