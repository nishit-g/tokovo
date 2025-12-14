# Semantic Anchor-Driven Camera System

> **The camera follows meaning, not pixels.**

## Executive Summary

The Semantic Anchor-Driven Camera System (SACS) is a production-grade cinematography engine for Tokovo that moves cameras based on **semantic anchors** (like "lastMessage" or "inputArea") rather than hardcoded pixel coordinates.

**Before:**
```typescript
// ❌ Magic numbers - what does originY: 0.8 mean?
dsl.zoom(60, 1.25, 20, { originY: 0.8 })
```

**After:**
```typescript
// ✅ Semantic intent - camera follows the last message
dsl.anchorFocus(60, "lastMessage", "dramatic")
```

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [Layer 1: Anchor Providers](#layer-1-anchor-providers)
4. [Layer 2: Intent Resolution](#layer-2-intent-resolution)
5. [Layer 3: Shot Presets](#layer-3-shot-presets)
6. [Layer 4: Camera Math](#layer-4-camera-math)
7. [DSL Usage](#dsl-usage)
8. [Files Created](#files-created)
9. [Extension Guide](#extension-guide)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SEMANTIC CAMERA PIPELINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐             │
│  │   DSL Event    │───▶│  Anchor       │───▶│  Shot Preset   │             │
│  │                │    │  Resolution   │    │                │             │
│  │ anchorFocus(   │    │               │    │  "dramatic"    │             │
│  │  "lastMessage",│    │  lastMessage  │    │  scale: 1.3    │             │
│  │  "dramatic"    │    │  → rect       │    │  shake: auto   │             │
│  │ )              │    │  → origin     │    │  easing: out   │             │
│  └────────────────┘    └────────────────┘    └────────────────┘             │
│           │                    │                    │                        │
│           └────────────────────┴────────────────────┘                        │
│                                │                                             │
│                                ▼                                             │
│                    ┌────────────────────────┐                               │
│                    │     Camera Transform    │                               │
│                    │                         │                               │
│                    │  scale: 1.3             │                               │
│                    │  originX: 0.5           │                               │
│                    │  originY: 0.78          │                               │
│                    │  shakeX: 2.3            │                               │
│                    │  shakeY: -1.1           │                               │
│                    └────────────────────────┘                               │
│                                │                                             │
│                                ▼                                             │
│                    ┌────────────────────────┐                               │
│                    │      CSS Transform      │                               │
│                    │                         │                               │
│                    │  transform: scale(1.3)  │                               │
│                    │  transform-origin: 50%  │                               │
│                    │                   78%   │                               │
│                    └────────────────────────┘                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Four-Layer Architecture

| Layer | Responsibility | Owner | Example |
|-------|----------------|-------|---------|
| **Layer 1: Anchor Providers** | Define *what* can be focused | Apps | `WhatsAppAnchorProvider` extracts `lastMessage` rect |
| **Layer 2: Intent Resolution** | Decide *when* to focus | Director | "On MESSAGE_RECEIVED → FOCUS lastMessage" |
| **Layer 3: Shot Presets** | Define *how* to look | Global | `dramatic` = scale 1.3, shake 4, ease-out |
| **Layer 4: Camera Math** | Execute pure transforms | Engine | Apply scale + shake + easing to CSS |

---

## Core Concepts

### Semantic Anchors

A **semantic anchor** is a named, meaningful UI element that the camera can focus on.

```typescript
// Core anchors (built-in)
type CoreSemanticAnchorId = 
  | "lastMessage"       // Most recent message bubble
  | "typingIndicator"   // Three dots animation
  | "inputArea"         // Text input field
  | "device"            // Full device frame
  ;

// Extensible: apps can add their own
type SemanticAnchorId = CoreSemanticAnchorId | string;
```

### Why Semantic Anchors?

| Problem | Old Way | Semantic Way |
|---------|---------|--------------|
| Message position changes | Hardcode `originY: 0.8` | Query `lastMessage.rect` |
| Different screen sizes | Hope it works | Anchor normalized to viewport |
| New UI elements | Add more magic numbers | Register new anchor |
| Debug camera issues | "Why is it zooming there?" | "It's targeting lastMessage" |

### Anchor Snapshot

At any frame, an `AnchorSnapshot` captures all available anchors:

```typescript
interface AnchorSnapshot {
  appId: string;
  deviceId: string;
  anchors: Record<SemanticAnchorId, LayoutRect>;
}

// Example at frame 60:
{
  appId: "app_whatsapp",
  deviceId: "phone",
  anchors: {
    lastMessage: { x: 50, y: 650, width: 280, height: 45 },
    inputArea: { x: 0, y: 780, width: 390, height: 50 },
    typingIndicator: { x: 50, y: 700, width: 60, height: 30 },
    device: { x: 0, y: 0, width: 390, height: 844 },
  }
}
```

### LayoutRect

All anchors are expressed as `LayoutRect` in **device-viewport space**:

```typescript
interface LayoutRect {
  x: number;       // Left edge (pixels from device left)
  y: number;       // Top edge (pixels from device top)
  width: number;   // Width in pixels
  height: number;  // Height in pixels
}
```

---

## Coordinate Spaces

> **Fix #4:** Explicit coordinate space responsibilities.

The camera pipeline operates across three coordinate spaces:

| Space | Owner | Description |
|-------|-------|-------------|
| **Content Space** | Layout Engine | Scroll-relative coordinates (e.g., message Y = 2000px in long chat) |
| **Viewport Space** | Anchor Providers | Device-relative coordinates (0,0 = top-left of device) |
| **Composition Space** | Camera Engine | Video frame coordinates (may differ if multi-device) |

### Conversion Responsibilities

1. **Layout Engine** outputs content-space rects.
2. **Anchor Providers** convert content → viewport by subtracting scrollY:
   ```typescript
   // In AnchorProvider
   const viewportY = contentY - chatLayout.scrollY;
   ```
3. **Camera Engine** may convert viewport → composition for multi-device layouts.

### Rule: Anchor Providers Return Viewport Space

Anchors MUST be in viewport space. This is the contract:

```typescript
interface AnchorProvider {
  // Returns rects in VIEWPORT space (not content space)
  getAnchors(world, layout, deviceId): AnchorSnapshot;
}
```

---

## Layer 1: Anchor Providers

Anchor providers extract semantic anchors from app state and layout.

### Interface

```typescript
interface AnchorProvider {
  id: string;           // e.g., "app_whatsapp"
  supportedAnchors: SemanticAnchorId[];
  
  getAnchors(
    world: WorldState,
    layout: LayoutState,
    deviceId: string
  ): AnchorSnapshot;
}
```

### WhatsApp Provider Example

```typescript
// packages/renderer/src/anchor-providers/whatsapp.ts

export const WhatsAppAnchorProvider: AnchorProvider = {
  id: "app_whatsapp",
  supportedAnchors: ["lastMessage", "typingIndicator", "inputArea", "device"],

  getAnchors(world, layout, deviceId) {
    const anchors: Partial<Record<SemanticAnchorId, LayoutRect>> = {};
    const device = world.devices[deviceId];
    
    // Get viewport from device profile (NOT hardcoded!)
    const profile = getDeviceProfile(device?.profileId);
    const viewportWidth = profile.dimensions.width;
    const viewportHeight = profile.dimensions.height;

    if (layout.kind === "CHAT") {
      const chatLayout = layout as ChatLayoutState;
      
      // Last message anchor (convert to viewport space)
      if (chatLayout.messageRects.length > 0) {
        const lastMsg = chatLayout.messageRects[chatLayout.messageRects.length - 1];
        anchors.lastMessage = lastMsg.rect;
      }

      // Input area anchor
      if (chatLayout.inputAreaRect) {
        anchors.inputArea = chatLayout.inputAreaRect;
      }
    }

    // Device anchor from viewport (NOT hardcoded 390×844!)
    anchors.device = { x: 0, y: 0, width: viewportWidth, height: viewportHeight };

    return { appId: "app_whatsapp", deviceId, anchors };
  }
};
```

> **Fix #1:** Device rect comes from device profile, never hardcoded.

### Built-in Providers

| Provider | App | Anchors |
|----------|-----|---------|
| `WhatsAppAnchorProvider` | WhatsApp | lastMessage, typingIndicator, inputArea, device |
| `PhoneAnchorProvider` | Phone | callPoster, acceptButton, declineButton, device |
| `NotificationAnchorProvider` | Notifications | headsUpNotification, dynamicIsland, device |

### Registration

```typescript
import { AnchorRegistry } from "@tokovo/core";
import { WhatsAppAnchorProvider } from "@tokovo/renderer";

// At startup
AnchorRegistry.register(WhatsAppAnchorProvider);

// Or use auto-registration
import { registerBuiltInAnchorProviders } from "@tokovo/renderer";
registerBuiltInAnchorProviders();
```

---

## Layer 2: Intent Resolution

### Camera Intent

A `CameraIntent` expresses what the camera should do semantically:

```typescript
type CameraIntent =
  | { type: "FOCUS"; anchor: SemanticAnchorId; preset?: ShotPresetId }
  | { type: "RESET"; preset?: ShotPresetId }
  | { type: "HOLD" };
```

### Fallback Chains

When an anchor isn't available, the system falls back to alternatives:

```typescript
const FALLBACK_CHAINS: Record<SemanticAnchorId, SemanticAnchorId[]> = {
  typingIndicator: ["inputArea", "lastMessage", "device"],
  lastMessage: ["inputArea", "device"],
  inputArea: ["device"],
  device: [],
};
```

**Example:** If `typingIndicator` isn't visible:
1. Try `inputArea` → Found? Use it
2. Try `lastMessage` → Found? Use it
3. Default to `device` (whole screen)

### Hysteresis (Anti-Jitter)

To prevent camera jitter when anchors flicker (e.g., typing dots appearing/disappearing), anchors must be **stable for 3 consecutive frames** before the camera switches:

```typescript
const ANCHOR_STABILITY_FRAMES = 3;

// State tracked in useCameraEngine
interface AnchorStabilityState {
  currentAnchor: SemanticAnchorId | null;
  candidateAnchor: SemanticAnchorId | null;
  stableFrames: number;
  lastSwitchFrame: number;
}
```

---

## Layer 3: Shot Presets

Shot presets define the *cinematography* — how the camera should look and feel.

### Global Presets

```typescript
// packages/core/src/camera/presets.ts

const SHOT_PRESETS = {
  dramatic: {
    scale: 1.3,           // Significant zoom
    durationFrames: 25,   // ~0.8s at 30fps
    easing: "ease-out",
    shake: 4,             // Adding impact
  },
  subtle: {
    scale: 1.08,          // Barely noticeable
    durationFrames: 30,   // 1s smooth
    easing: "cinematic",  // S-curve
    shake: 0,
  },
  snap: {
    scale: 1.15,          // Quick punch
    durationFrames: 10,   // Very fast
    easing: "ease-out",
    shake: 0,
  },
  impact: {
    scale: 1.4,           // Dramatic
    durationFrames: 15,
    easing: "ease-out",
    shake: 8,             // Heavy shake
  },
  message: {
    scale: 1.1,           // Standard message follow
    durationFrames: 25,
    easing: "ease-out",
    shake: 0,
  },
  reset: {
    scale: 1.0,           // Return to neutral
    durationFrames: 20,
    easing: "ease-out",
    shake: 0,
  }
};
```

### App-Specific Overrides

Apps can provide **deltas** (not new presets) to customize behavior:

```typescript
// packages/apps-whatsapp/src/behaviors.ts

export const WHATSAPP_PRESET_OVERRIDES: Partial<Record<ShotPresetId, Partial<ShotPreset>>> = {
  // WhatsApp messages should zoom slightly less
  message: { scale: 1.08 },
  // Dramatic moments need more emphasis
  dramatic: { shake: 6 },
};
```

The system merges: `globalPreset + appOverride`:
```typescript
const finalPreset = getShotPreset("dramatic", "app_whatsapp");
// { scale: 1.3, shake: 6, ... } — 6 from override, rest from global
```

---

## Layer 4: Camera Math

### CameraController

The `CameraController` is a pure function that computes transforms:

```typescript
// packages/core/src/camera/index.ts

class CameraController {
  computeTransform(state: CameraState, t: number): CameraTransform;
}
```

### ANCHOR_FOCUS Effect

The new `ANCHOR_FOCUS` effect type:

```typescript
interface CameraAnchorFocusEffect {
  type: "ANCHOR_FOCUS";
  anchor: string;        // SemanticAnchorId
  preset?: string;       // ShotPresetId
  scale?: number;        // Override preset scale
  duration: number;      // Frames
  easing?: EasingType;
  shake?: number;        // Override preset shake
}
```

### Processing Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    Event     │───▶│ createActive │───▶│ applyEffect  │───▶│  Transform   │
│              │    │   Effect     │    │              │    │              │
│ ANCHOR_FOCUS │    │ ActiveCamera │    │ applyAnchor  │    │ scale: 1.3   │
│ anchor:      │    │ Effect       │    │ Focus()      │    │ originY: 0.75│
│ "lastMessage"│    │              │    │              │    │ shakeX: 2.1  │
│ preset:      │    │              │    │ ↓            │    │              │
│ "dramatic"   │    │              │    │ getAnchor    │    │              │
│              │    │              │    │ Framing()    │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### Anchor Framing (Layer 3 — Presets)

> **Fix #3:** Semantic interpretation lives in presets, NOT camera math.

The `ANCHOR_FRAMING` config defines WHERE anchors should appear in frame:

```typescript
// packages/core/src/camera/presets.ts

export interface AnchorFraming {
  anchorPoint: { x: number; y: number };  // Where in frame (0-1 normalized)
  paddingPx?: number;                      // Padding around anchor
  targetFill?: number;                     // How much of frame to fill (0-1)
}

export const ANCHOR_FRAMING: Record<string, AnchorFraming> = {
  lastMessage: {
    anchorPoint: { x: 0.5, y: 0.75 },  // Lower-third
    paddingPx: 24,
    targetFill: 0.55,
  },
  inputArea: {
    anchorPoint: { x: 0.5, y: 0.9 },   // Very bottom
    paddingPx: 16,
    targetFill: 0.4,
  },
  device: {
    anchorPoint: { x: 0.5, y: 0.5 },   // Center
    paddingPx: 0,
    targetFill: 1.0,
  },
};

export function getAnchorFraming(anchor: string): AnchorFraming;
```

Camera Math (Layer 4) calls `getAnchorFraming("lastMessage")` — it does NOT interpret what "lastMessage" means.

---

## DSL Usage

### Basic Syntax

```typescript
const dsl = {
  // ANCHOR_FOCUS - The semantic way
  anchorFocus: (at, anchor, preset?, shake?) => ({
    at,
    kind: "CAMERA",
    type: "ANCHOR_FOCUS",
    anchor,           // "lastMessage" | "inputArea" | etc.
    preset,           // "dramatic" | "subtle" | "snap" | etc.
    duration: getPresetDuration(preset),
    shake,            // Optional shake intensity
    easing: getPresetEasing(preset),
  }),
};
```

### Complete Example

```typescript
// SemanticCameraShowcase.tsx

const events = [
  // === FOLLOWING MESSAGES ===
  dsl.receive(60, "Bestie 💕", "omg hi!! 👋"),
  dsl.anchorFocus(60, "lastMessage", "message"),   // Camera follows

  dsl.send(100, "heyyy!!"),
  dsl.anchorFocus(100, "lastMessage", "message"),  // Camera follows right

  // === TYPING ANTICIPATION ===
  dsl.typingStart(200, "Bestie 💕"),
  dsl.anchorFocus(200, "inputArea", "subtle"),     // Focus on stable anchor

  // === DRAMATIC REVEAL ===
  dsl.receive(280, "Bestie 💕", "I got the job!!! 🎉🎉🎉"),
  dsl.anchorFocus(280, "lastMessage", "dramatic", 5),  // DRAMATIC + shake!

  // === SNAP TO REACTION ===
  dsl.send(440, "❤️"),
  dsl.anchorFocus(440, "lastMessage", "snap", 2),  // Quick snap

  // === RESET ===
  dsl.reset(560, 40),  // Pull back to neutral
];
```

### Comparison

| Technique | Code | Meaning |
|-----------|------|---------|
| Manual zoom | `zoom(60, 1.25, 20, { originY: 0.8 })` | "Zoom 25% toward bottom" |
| Anchor focus | `anchorFocus(60, "lastMessage", "dramatic")` | "Dramatically focus on the last message" |

---

## Files Created

### Core Package (`@tokovo/core`)

| File | Purpose |
|------|---------|
| `anchors.ts` | SemanticAnchorId, AnchorProvider, AnchorRegistry, fallbacks, hysteresis |
| `behavior-registry.ts` | BehaviorRegistry, CameraIntent, AppBehavior |
| `camera/presets.ts` | SHOT_PRESETS, getShotPreset() |
| `camera/index.ts` | CameraController.applyAnchorFocus(), createActiveEffect(ANCHOR_FOCUS) |
| `types.ts` | CameraAnchorFocusEffect, ANCHOR_FOCUS event |

### Renderer Package (`@tokovo/renderer`)

| File | Purpose |
|------|---------|
| `anchor-providers/whatsapp.ts` | WhatsApp anchor extraction |
| `anchor-providers/phone.ts` | Phone/Call anchor extraction |
| `anchor-providers/notification.ts` | Notification anchor extraction |
| `anchor-providers/registry.ts` | registerBuiltInAnchorProviders() |
| `engines/useCameraEngine.ts` | Anchor snapshot integration, stability tracking |

### App Packages

| File | Package | Purpose |
|------|---------|---------|
| `behaviors.ts` | apps-whatsapp | Event→Intent mappings, preset overrides |
| `behaviors.ts` | apps-phone | Call event mappings |
| `behaviors.ts` | apps-twitter | Social event mappings |

---

## Extension Guide

### Adding a New Anchor

1. **Register in AnchorProvider:**
   ```typescript
   // In your app's anchor provider
   supportedAnchors: [...existing, "myNewAnchor"],
   
   getAnchors(world, layout, deviceId) {
     anchors.myNewAnchor = computeRect(/*...*/);
   }
   ```

2. **Add default origin** (optional):
   ```typescript
   // In camera/index.ts applyAnchorFocus
   const anchorOrigins = {
     ...existing,
     myNewAnchor: { x: 0.5, y: 0.6 },
   };
   ```

3. **Use in DSL:**
   ```typescript
   dsl.anchorFocus(frame, "myNewAnchor", "dramatic")
   ```

### Adding a New Preset

1. **Add to SHOT_PRESETS:**
   ```typescript
   // In camera/presets.ts
   const SHOT_PRESETS = {
     ...existing,
     myPreset: {
       scale: 1.2,
       durationFrames: 18,
       easing: "ease-out",
       shake: 2,
     },
   };
   ```

2. **Update getPresetScale (if needed):**
   ```typescript
   // In camera/index.ts CameraController
   private getPresetScale(preset?: string): number {
     switch (preset) {
       ...existing,
       case "myPreset": return 1.2;
     }
   }
   ```

3. **Use in DSL:**
   ```typescript
   dsl.anchorFocus(frame, "lastMessage", "myPreset")
   ```

### Adding a New App

1. **Create AnchorProvider:**
   ```typescript
   // packages/renderer/src/anchor-providers/myapp.ts
   export const MyAppAnchorProvider: AnchorProvider = {
     id: "app_myapp",
     supportedAnchors: ["mainContent", "footer", "device"],
     getAnchors(world, layout, deviceId) { /*...*/ }
   };
   ```

2. **Register provider:**
   ```typescript
   // In anchor-providers/registry.ts
   AnchorRegistry.register(MyAppAnchorProvider);
   ```

3. **Create behavior file:**
   ```typescript
   // packages/apps-myapp/src/behaviors.ts
   export const MyAppBehavior: AppBehavior = {
     appId: "app_myapp",
     eventMappings: {
       CONTENT_UPDATED: { type: "FOCUS", anchor: "mainContent", preset: "subtle" },
     },
   };
   ```

---

## Summary

The Semantic Anchor-Driven Camera System transforms Tokovo's cinematography from:

**Before:** "Zoom 25% toward coordinates (0.5, 0.8) with ease-out easing"

**After:** "Dramatically focus on the last message"

This makes the camera system:
- ✅ **Semantic** — Speaks in UI language, not pixels
- ✅ **Robust** — Fallback chains handle missing anchors
- ✅ **Stable** — Hysteresis prevents jitter
- ✅ **Extensible** — Apps register their own anchors
- ✅ **Configurable** — Shot presets control cinematography
- ✅ **Production-ready** — Handles edge cases gracefully

---

*Last updated: December 15, 2024*
