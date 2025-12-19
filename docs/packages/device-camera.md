# @tokovo/device-camera

> **Enterprise-Grade Cinematic Camera System**

The `@tokovo/device-camera` package is the single source of truth for all camera-related logic in Tokovo. It provides a complete cinematic camera system with timeline-based effects, semantic anchor tracking, automatic camera direction (DirectorLite), and frame-accurate transforms.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Package Structure](#package-structure)
3. [Core Concepts](#core-concepts)
4. [Type System](#type-system)
5. [Data Flow](#data-flow)
6. [Effect Processors](#effect-processors)
7. [Anchor System](#anchor-system)
8. [DirectorLite (Auto Camera)](#directorlite-auto-camera)
9. [DSL Integration](#dsl-integration)
10. [Lowering Pipeline](#lowering-pipeline)
11. [Coding Patterns](#coding-patterns)
12. [API Reference](#api-reference)
13. [Integration Guide](#integration-guide)
14. [Best Practices](#best-practices)
15. [Migration Guide](#migration-guide)

---

## Architecture Overview

### Design Philosophy

The camera system follows these enterprise principles:

1. **Single Source of Truth**: All camera logic lives in `@tokovo/device-camera`
2. **Pure Functions**: Processors and reducers are stateless and deterministic
3. **Discriminated Unions**: Type-safe effect handling with exhaustive pattern matching
4. **Registry Pattern**: Extensible processors and anchors via registries
5. **Facade Pattern**: `@tokovo/core` provides backward-compatible API that delegates to device-camera

### Package Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                         Apps / Plugins                          │
│                                                                 │
│   Can import from either:                                       │
│   - @tokovo/core (facade, backward compatible)                  │
│   - @tokovo/device-camera (direct, recommended for new code)    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│  @tokovo/core                                                     │
│                                                                   │
│  - Re-exports camera types from device-camera                     │
│  - AnchorRegistry facade delegates to device-camera              │
│  - Backward compatible API                                        │
└────────────────────────────┬─────────────────────────────────────┘
                             │ depends on
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│  @tokovo/device-camera                                            │
│                                                                   │
│  - Types: CameraEffect, CameraTransform, CameraState             │
│  - Processors: Zoom, Shake, Focus, Track, Reset                  │
│  - Anchors: Registry, Providers, Snapshots                        │
│  - Director-Lite: Automatic camera from signals                   │
│  - Reducer: Event → Effect transformation                         │
│  - Lowering: DSL IR → Runtime events                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## Package Structure

```
packages/device-camera/
├── src/
│   ├── index.ts              # Main export barrel
│   ├── types/
│   │   └── index.ts          # Core type definitions
│   ├── processors/
│   │   ├── index.ts          # Processor registry + processActiveEffects
│   │   ├── zoom.ts           # Zoom effect processor
│   │   ├── shake.ts          # Shake effect processor
│   │   ├── focus.ts          # Anchor focus processor
│   │   ├── track.ts          # Anchor tracking processor
│   │   └── reset.ts          # Reset to neutral processor
│   ├── anchors/
│   │   ├── index.ts          # Anchor exports
│   │   ├── registry.ts       # AnchorProvider registry (source of truth)
│   │   └── types.ts          # Anchor type definitions
│   ├── director-lite/
│   │   ├── index.ts          # DirectorLite exports
│   │   ├── derive.ts         # Pure effect derivation
│   │   ├── signals.ts        # Signal extraction from events
│   │   ├── strategy.ts       # Camera strategy/rules
│   │   └── types.ts          # Director types
│   ├── reducer/
│   │   └── index.ts          # Camera event → effect reducer
│   ├── lowering/
│   │   └── handler.ts        # DSL IR → Runtime event lowering
│   └── utils/
│       └── index.ts          # Easing, math utilities
└── package.json
```

---

## Core Concepts

### CameraEffect

A `CameraEffect` represents a camera movement or transformation over time. Effects are timeline-based with explicit start and end frames.

```typescript
interface EffectBase {
    id: string;           // Unique identifier
    startFrame: number;   // When effect begins
    endFrame: number;     // When effect ends
    deviceId?: string;    // Target device (multi-device support)
}
```

### CameraTransform

A `CameraTransform` represents the camera's state at a specific frame - the output of processing effects.

```typescript
interface CameraTransform {
    scale: number;        // Zoom level (1.0 = normal)
    translateX: number;   // Horizontal pan (pixels)
    translateY: number;   // Vertical pan (pixels)
    rotation: number;     // Rotation (degrees)
    shakeX: number;       // Horizontal shake offset
    shakeY: number;       // Vertical shake offset
    originX: number;      // Transform origin X (0-1)
    originY: number;      // Transform origin Y (0-1)
}
```

### CameraState

The reducer maintains a `CameraState` with all active effects:

```typescript
interface CameraState {
    activeEffects: CameraEffect[];
    currentView?: CameraView;
    deviceId?: string;
}
```

---

## Type System

The camera system uses **discriminated unions** for type-safe effect handling:

```typescript
// Base effect with timing
interface EffectBase {
    id: string;
    startFrame: number;
    endFrame: number;
    deviceId?: string;
}

// Zoom effect
interface ZoomEffect extends EffectBase {
    type: "zoom";
    targetScale: number;
    targetX?: number;
    targetY?: number;
    originX?: number;
    originY?: number;
    easing?: EasingType;
}

// Shake effect
interface ShakeEffect extends EffectBase {
    type: "shake";
    intensity: number;
    frequency?: number;
    decay?: number;
}

// Focus effect (anchor-based)
interface FocusEffect extends EffectBase {
    type: "focus";
    anchorId: string;
    scale?: number;
    padding?: number;
    preset?: string;
}

// Track effect (anchor following)
interface TrackEffect extends EffectBase {
    type: "track";
    anchorId: string;
    scale?: number;
    lag?: number;
}

// Reset to neutral
interface ResetEffect extends EffectBase {
    type: "reset";
    easing?: EasingType;
}

// Discriminated union
type CameraEffect =
    | ZoomEffect
    | ShakeEffect
    | FocusEffect
    | TrackEffect
    | ResetEffect;
```

### Easing Types

```typescript
type EasingType =
    | "linear"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "spring";
```

---

## Data Flow

The camera system follows a unidirectional data flow:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. DSL AUTHORING                                                │
│                                                                 │
│    camera.at(0).animate({ scale: 1.5, duration: 30 })          │
│    camera.at(30).focus("lastMessage")                          │
│    camera.at(60).shake({ intensity: 0.5 })                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ generates
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. TRACK EVENTS (IR)                                            │
│                                                                 │
│    { kind: "CAMERA", type: "ANIMATE_START", at: 0, ... }       │
│    { kind: "CAMERA", type: "FOCUS", at: 30, ... }              │
│    { kind: "CAMERA", type: "SHAKE_START", at: 60, ... }        │
└────────────────────────────┬────────────────────────────────────┘
                             │ lowering (cameraV2Lowering)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. RUNTIME EVENTS                                               │
│                                                                 │
│    { kind: "CAMERA", type: "ZOOM", at: 0, duration: 30, ... }  │
│    { kind: "CAMERA", type: "FOCUS", at: 30, anchor: "...", ... }│
│    { kind: "CAMERA", type: "SHAKE", at: 60, intensity: 0.5 }   │
└────────────────────────────┬────────────────────────────────────┘
                             │ reducer (cameraReducer)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. CAMERA STATE                                                 │
│                                                                 │
│    activeEffects: [                                             │
│      { type: "zoom", startFrame: 0, endFrame: 30, ... },       │
│      { type: "focus", startFrame: 30, endFrame: 60, ... },     │
│      { type: "shake", startFrame: 60, endFrame: 75, ... }      │
│    ]                                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ processActiveEffects(t, effects, ...)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. CAMERA TRANSFORM (per frame)                                 │
│                                                                 │
│    { scale: 1.25, translateX: 50, translateY: -20, ... }       │
└────────────────────────────┬────────────────────────────────────┘
                             │ applies to <div style={transform}>
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. VISUAL OUTPUT                                                │
│                                                                 │
│    Camera smoothly zooms, pans, shakes, follows anchors         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Effect Processors

Each effect type has a dedicated processor that transforms camera state for a given frame.

### Processor Interface

```typescript
interface EffectProcessor<T extends CameraEffect> {
    type: T["type"];
    process(ctx: ProcessContext<T>): CameraTransform;
}

interface ProcessContext<T extends CameraEffect> {
    t: number;                          // Current frame
    effect: T;                          // The effect being processed
    transform: CameraTransform;         // Current transform state
    anchorSnapshot?: AnchorSnapshot;    // Resolved anchors
    viewport?: { width: number; height: number };
}
```

### Processor Registry

```typescript
// Register a custom processor
registerProcessor({
    type: "custom",
    process(ctx) {
        // Calculate transform based on ctx.effect
        return { ...ctx.transform, scale: ctx.effect.customValue };
    }
});

// Process all active effects for frame t
const transform = processActiveEffects(
    t,              // Current frame
    effects,        // CameraEffect[]
    initialTransform,
    anchorSnapshot,
    viewport
);
```

### Built-in Processors

| Processor | Effect Type | Description |
|-----------|-------------|-------------|
| `ZoomProcessor` | `zoom` | Scale and translate with easing |
| `ShakeProcessor` | `shake` | Procedural camera shake with decay |
| `FocusProcessor` | `focus` | Frame an anchor with optional scale |
| `TrackProcessor` | `track` | Follow an anchor with optional lag |
| `ResetProcessor` | `reset` | Smoothly return to neutral |

---

## Anchor System

Anchors provide semantic camera targets like "lastMessage" or "inputArea" instead of pixel coordinates.

### Anchor Provider

```typescript
interface AnchorProvider {
    appId: string;                              // e.g., "app_whatsapp"
    framing: Record<string, AnchorFraming>;     // Framing configs per anchor
    getAnchors(                                 // Dynamic anchor resolver
        world: WorldState,
        layout: unknown,
        deviceId: string
    ): AnchorSnapshot;
}
```

### Anchor Registration

```typescript
// Register an anchor provider
import { registerAnchorProvider } from "@tokovo/device-camera";

registerAnchorProvider({
    appId: "app_whatsapp",
    framing: {
        lastMessage: { 
            anchorPoint: { x: 0.5, y: 0.5 }, 
            targetFill: 0.6 
        },
        inputArea: { 
            anchorPoint: { x: 0.5, y: 0.9 }, 
            targetFill: 0.8 
        },
    },
    getAnchors(world, layout, deviceId) {
        // Extract current message rects from layout
        return {
            anchors: {
                lastMessage: { x: 50, y: 400, width: 300, height: 60 },
                inputArea: { x: 0, y: 780, width: 393, height: 72 },
            },
            deviceId,
            appId: "app_whatsapp",
        };
    }
});
```

### Facade Pattern (Backward Compatibility)

`@tokovo/core` provides a facade that delegates to device-camera:

```typescript
// These are equivalent:
import { registerAnchorProvider } from "@tokovo/device-camera";
import { AnchorRegistry } from "@tokovo/core";

// Both work - core delegates to device-camera
registerAnchorProvider(myProvider);
AnchorRegistry.register(myProvider);
```

---

## DirectorLite (Auto Camera)

DirectorLite automatically generates camera movements from event signals when no manual camera is active.

### How It Works

1. **Signal Extraction**: Events are converted to `DirectorSignal[]`
2. **Rule Matching**: Signals match against strategy rules
3. **Effect Derivation**: Matched rules generate `DerivedCameraEffect[]`
4. **Conversion**: Effects are converted to `CameraEffect[]` via `convertToEffects()`
5. **Processing**: Effects go through the standard processor pipeline

### Usage

```typescript
import { 
    deriveDirectorEffects, 
    extractSignals,
    convertToEffects,
    processActiveEffects 
} from "@tokovo/device-camera";

// 1. Extract signals from events
const signals = extractSignals(eventsInWindow, t, windowSize);

// 2. Derive camera effects
const result = deriveDirectorEffects({
    t,
    signals,
    layoutModel: { messageRects: {}, viewport },
    manualCameraEffects: [],  // Skip if manual camera active
});

// 3. Convert to standard effects
const effects = convertToEffects(result.effects, t);

// 4. Process through registry
const transform = processActiveEffects(t, effects, baseTransform, anchors, viewport);
```

### Custom Strategies

```typescript
import { DirectorStrategy, Rule } from "@tokovo/device-camera";

const MyStrategy: DirectorStrategy = {
    getRules(signalType) {
        switch (signalType) {
            case "NewMessage":
                return [{
                    effect: "FocusAnchor",
                    category: "framing",
                    anchor: "lastMessage",
                    durationFrames: 45,
                    cooldownFrames: 30,
                    priority: 10,
                }];
            default:
                return [];
        }
    }
};
```

---

## DSL Integration

Camera movements are authored using the `CameraTrackBuilder`:

```typescript
import { CameraTrackBuilder } from "@tokovo/dsl/v2";

episode.track("camera", CameraTrackBuilder, (camera) => {
    // Instant set
    camera.at(0).set({ scale: 1.0, x: 0, y: 0 });

    // Animated zoom
    camera.at(30).animate({ 
        scale: 1.5, 
        duration: 45, 
        easing: "ease-out" 
    });

    // Focus on anchor
    camera.at(90).focus("lastMessage", { 
        scale: 1.3, 
        duration: 30 
    });

    // Camera shake
    camera.at(120).shake({ 
        intensity: 0.5, 
        frequency: 15, 
        decay: 0.8 
    }).for(15);

    // Track anchor
    camera.at(150).track("inputArea", { 
        scale: 1.2, 
        lag: 5 
    }).until(200);

    // Reset to neutral
    camera.at(200).reset({ duration: 30 });
});
```

---

## Lowering Pipeline

The compiler uses `cameraV2Lowering` to transform DSL events to runtime events:

```typescript
import { cameraV2Lowering } from "@tokovo/device-camera";

// In compiler/v2/lowering.ts
case "CAMERA":
    return cameraV2Lowering(event, { fps: ctx.fps });
```

### Event Mapping

| DSL Event | Runtime Event |
|-----------|---------------|
| `SET` | `CUT` |
| `ANIMATE_START` | `ZOOM` |
| `FOCUS` | `ANCHOR_FOCUS` |
| `TRACK_START` | `ANCHOR_TRACK` |
| `SHAKE_START` | `SHAKE` |
| `RESET` | `RESET` |

---

## Coding Patterns

### Pattern 1: Pure Processors

Processors are pure functions with no side effects:

```typescript
// ✅ Good - pure function
function process(ctx) {
    const progress = (ctx.t - ctx.effect.startFrame) / duration;
    return {
        ...ctx.transform,
        scale: lerp(1, ctx.effect.targetScale, progress)
    };
}

// ❌ Bad - side effects
function process(ctx) {
    globalState.lastFrame = ctx.t;  // Side effect!
    return { ... };
}
```

### Pattern 2: Discriminated Union Exhaustiveness

Use exhaustive switch for type safety:

```typescript
function handleEffect(effect: CameraEffect) {
    switch (effect.type) {
        case "zoom": return handleZoom(effect);
        case "shake": return handleShake(effect);
        case "focus": return handleFocus(effect);
        case "track": return handleTrack(effect);
        case "reset": return handleReset(effect);
        default:
            // TypeScript error if case is missing
            const _exhaustive: never = effect;
            return _exhaustive;
    }
}
```

### Pattern 3: Registry Pattern

Extend functionality via registries:

```typescript
// Register at startup
registerProcessor(myCustomProcessor);
registerAnchorProvider(myAppAnchors);

// Use at runtime
const transform = processActiveEffects(t, effects, ...);
const anchors = getAnchorsForApp(appId, world, layout, deviceId);
```

### Pattern 4: Facade for Backward Compatibility

When refactoring, maintain backward compatibility via facades:

```typescript
// New implementation in device-camera
export function registerAnchorProvider(provider) {
    providerRegistry.set(provider.appId, provider);
}

// Facade in core (delegates to device-camera)
class AnchorRegistryFacade {
    register(provider) {
        registerAnchorProvider(provider);  // Delegate
    }
}
```

---

## API Reference

### Types

| Export | Description |
|--------|-------------|
| `CameraEffect` | Union type of all camera effects |
| `CameraTransform` | Camera state at a frame |
| `CameraState` | Full camera state with effects list |
| `AnchorProvider` | Interface for anchor providers |
| `AnchorSnapshot` | Resolved anchors at a point in time |

### Processors

| Export | Description |
|--------|-------------|
| `processActiveEffects(t, effects, ...)` | Main processing function |
| `registerProcessor(processor)` | Register custom processor |

### Anchors

| Export | Description |
|--------|-------------|
| `registerAnchorProvider(provider)` | Register anchor provider |
| `getAnchorProvider(appId)` | Get provider by app ID |
| `getAnchorsForApp(appId, world, layout, deviceId)` | Resolve anchors |
| `getAnchorFraming(appId, anchorId)` | Get framing config |

### Director-Lite

| Export | Description |
|--------|-------------|
| `deriveDirectorEffects(ctx)` | Derive effects from signals |
| `extractSignals(events, t, window)` | Extract signals from events |
| `convertToEffects(effects, t)` | Convert to CameraEffect[] |

### Reducer

| Export | Description |
|--------|-------------|
| `cameraReducer(draft, event)` | Process camera events |

### Lowering

| Export | Description |
|--------|-------------|
| `cameraV2Lowering(event, ctx)` | Lower DSL to runtime events |

---

## Integration Guide

### Renderer Integration

```typescript
// In useCameraEngine.ts
import {
    processActiveEffects,
    getAnchorsForApp,
    deriveDirectorEffects,
    extractSignals,
    convertToEffects,
} from "@tokovo/device-camera";

function useCameraEngine(input) {
    const { world, t, layoutOutput } = input;

    // 1. Get anchor snapshot
    const anchorSnapshot = getAnchorsForApp(
        layoutOutput.appId,
        world,
        layoutOutput.layout,
        layoutOutput.deviceId
    );

    // 2. Process manual effects
    const effects = world.camera?.activeEffects ?? [];
    let transform = processActiveEffects(t, effects, DEFAULT_TRANSFORM, anchorSnapshot, viewport);

    // 3. Apply DirectorLite if no manual effects
    if (directorEnabled && activeEffects.length === 0) {
        const signals = extractSignals(eventsInWindow, t, 90);
        const result = deriveDirectorEffects({ t, signals, ... });
        const directorEffects = convertToEffects(result.effects, t);
        transform = processActiveEffects(t, directorEffects, transform, anchorSnapshot, viewport);
    }

    return { transform, style: transformToStyle(transform) };
}
```

### Plugin Integration

```typescript
import { definePlugin } from "@tokovo/core";

export const WhatsAppPlugin = definePlugin({
    id: "app_whatsapp",
    name: "WhatsApp",
    anchors: {
        lastMessage: { anchorPoint: { x: 0.5, y: 0.5 }, targetFill: 0.6 },
        inputArea: { anchorPoint: { x: 0.5, y: 0.9 }, targetFill: 0.8 },
    },
    getAnchors(world, layout, deviceId) {
        // Resolve anchors from layout state
        return { anchors: { ... }, deviceId, appId: "app_whatsapp" };
    },
});
```

---

## Best Practices

1. **Use device-camera for new code**: Import directly from `@tokovo/device-camera` for new code
2. **Keep processors pure**: No side effects, always return new transform objects
3. **Register anchors via plugins**: Use the plugin system's `anchors` field
4. **Use discriminated unions**: Leverage TypeScript's exhaustive checking
5. **Test with multiple devices**: Use `deviceId` for multi-device scenarios
6. **Prefer focus over zoom**: Semantic anchors are more maintainable than coordinates

---

## Migration Guide

### From Legacy Camera

1. **Types**: Change `CameraEvent` to `CameraEffect` with `startFrame`/`endFrame`
2. **Imports**: Use `@tokovo/device-camera` instead of `@tokovo/core/camera`
3. **Anchors**: Register via `registerAnchorProvider()` or plugin system
4. **Processing**: Use `processActiveEffects()` instead of manual application

### From Inline Anchor Logic

```typescript
// Before (inline)
const anchors = {
    lastMessage: { x: 50, y: 400, width: 300, height: 60 }
};

// After (registered provider)
registerAnchorProvider({
    appId: "my_app",
    framing: { lastMessage: { ... } },
    getAnchors(world, layout) {
        return { anchors: { ... } };
    }
});
```

---

## Changelog

### v0.1.0

- Initial release with enterprise camera architecture
- Discriminated union type system
- Processor registry pattern
- Anchor system with facade pattern
- DirectorLite automatic camera
- DSL integration via lowering handler
