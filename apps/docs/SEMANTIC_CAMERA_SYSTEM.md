# Semantic Anchor-Driven Camera System

> **The camera follows meaning, not pixels.**

## Executive Summary

The Semantic Anchor-Driven Camera System (SACS) is a production-grade cinematography engine for Tokovo that moves cameras based on **semantic anchors** (like "lastMessage" or "inputArea") rather than hardcoded pixel coordinates.

**The Old Way:**
```typescript
// ❌ Magic numbers - what does originY: 0.8 mean?
dsl.zoom(60, 1.25, 20, { originY: 0.8 })
```

**The New Way:**
```typescript
// ✅ Semantic intent - camera follows the last message
dsl.anchorFocus(60, "lastMessage", "dramatic")
```

**The Result:** Camera origins are now computed from ACTUAL MESSAGE POSITIONS at runtime, not magic numbers.

---

## Quick Start

```typescript
// Create a showcase with semantic camera control
const events = [
  dsl.receive(60, "Bestie 💕", "I got the job!!! 🎉"),
  dsl.anchorFocus(60, "lastMessage", "dramatic", 5),  // Zoom to actual message location
  
  dsl.send(120, "OMG CONGRATS!!! 🎊"),
  dsl.anchorFocus(120, "lastMessage", "snap", 2),     // Snap to wherever the reply landed
  
  dsl.reset(200, 40),                                  // Pull back to neutral
];
```

---

## Table of Contents

1. [How It Actually Works](#how-it-actually-works) ⭐ **Start Here**
2. [Architecture Overview](#architecture-overview)
3. [The Four Layers](#the-four-layers)
4. [Coordinate Spaces](#coordinate-spaces)
5. [DSL Reference](#dsl-reference)
6. [Extension Guide](#extension-guide)
7. [File Reference](#file-reference)

---

## How It Actually Works

> **This is the complete frame-by-frame walkthrough of a WhatsApp message being followed by the camera.**

### Scenario: "A new message arrives, camera follows"

```
Frame t=60: "Bestie 💕" sends "I got the job!!! 🎉"
```

---

### Step 1: World State Update

The DSL event updates the world:

```typescript
// Input
dsl.receive(60, "Bestie 💕", "I got the job!!! 🎉")

// Result: WorldState is updated
world.conversations["chat-1"].messages.push({
  id: "m_42",
  text: "I got the job!!! 🎉",
  sender: "Bestie 💕"
});
```

**No camera logic yet.** Just data.

---

### Step 2: Layout Computes Pixels

The Layout Engine computes where everything goes:

```typescript
const layout = computeLayout(world);

// Result:
chatLayout.messageLayouts = {
  "m_42": {
    rect: { x: 50, y: 650, width: 280, height: 45 }  // ACTUAL PIXELS
  }
};
```

**This is where pixels are born.** Layout owns all positioning.

---

### Step 3: Anchor Provider Extracts Meaning

WhatsApp's AnchorProvider names the rects:

```typescript
// packages/renderer/src/anchor-providers/whatsapp.ts

WhatsAppAnchorProvider.getAnchors(world, layout, deviceId);

// Result:
anchorSnapshot = {
  appId: "app_whatsapp",
  deviceId: "phone",
  anchors: {
    lastMessage: { x: 50, y: 650, width: 280, height: 45 },  // ← FROM LAYOUT
    inputArea: { x: 0, y: 880, width: 430, height: 52 },
    device: { x: 0, y: 0, width: 430, height: 932 },
  }
};
```

**This is the semantic bridge:** Pixels → Named anchors.

---

### Step 4: Camera Effect Triggers

The DSL event creates an ANCHOR_FOCUS effect:

```typescript
// Input
dsl.anchorFocus(60, "lastMessage", "dramatic", 5)

// Result: Timeline event
{
  at: 60,
  kind: "CAMERA",
  type: "ANCHOR_FOCUS",
  anchor: "lastMessage",
  preset: "dramatic",
  shake: 5,
  duration: 25,
  easing: "ease-out"
}
```

**Still no pixels.** Just semantic intent.

---

### Step 5: THE MISSING LINK — Anchor Resolution

> **This is where the magic happens.**

In `useCameraEngine.ts`, Section 3.5:

```typescript
// 1. Filter active ANCHOR_FOCUS effects
const anchorFocusEffects = activeEffects.filter(
  (ae) => ae.effect.type === "ANCHOR_FOCUS" && t >= ae.startFrame && t < ae.endFrame
);

// 2. Resolve anchor rect from snapshot
const resolved = resolveAnchorWithFallback("lastMessage", anchorSnapshot.anchors);
// → { anchor: "lastMessage", rect: { x: 50, y: 650, width: 280, height: 45 } }

// 3. THE KEY MATH: Convert rect center → normalized origin
const rect = resolved.rect;
const centerX = rect.x + rect.width / 2;    // 50 + 140 = 190
const centerY = rect.y + rect.height / 2;   // 650 + 22.5 = 672.5

const originX = centerX / viewportWidth;    // 190 / 430 = 0.442
const originY = centerY / viewportHeight;   // 672.5 / 932 = 0.721

// 4. Apply to camera transform
finalCameraTransform = {
  scale: 1.3,           // From "dramatic" preset
  originX: 0.442,       // FROM THE ACTUAL RECT!
  originY: 0.721,       // FROM THE ACTUAL RECT!
  shakeX: 2.1,          // Calculated shake
  shakeY: -1.4,
};
```

**The camera now knows WHERE the message actually is.**

---

### Step 6: CSS Output

The transform becomes CSS:

```css
.camera-wrapper {
  transform: scale(1.3) translate(2.1px, -1.4px);
  transform-origin: 44.2% 72.1%;
}
```

**🎥 Result:** Camera smoothly zooms to the center of the actual message bubble.

---

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     COMPLETE ANCHOR → CAMERA FLOW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  t=60: dsl.receive("Bestie 💕", "I got the job!!!")                         │
│                         │                                                    │
│                         ▼                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │ WORLD STATE                                                     │        │
│  │ messages.push({ id: "m_42", text: "I got the job!!!" })        │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                         │                                                    │
│                         ▼                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │ LAYOUT ENGINE                                                   │        │
│  │ messageLayouts["m_42"].rect = { x:50, y:650, w:280, h:45 }     │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                         │                                                    │
│                         ▼                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │ ANCHOR PROVIDER (WhatsApp)                                      │        │
│  │ anchors.lastMessage = { x:50, y:650, w:280, h:45 }             │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                         │                                                    │
│                         ▼                                                    │
│  t=60: dsl.anchorFocus("lastMessage", "dramatic", 5)                        │
│                         │                                                    │
│                         ▼                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │ useCameraEngine — Section 3.5                                    │        │
│  │                                                                  │        │
│  │ rect = resolveAnchorWithFallback("lastMessage")                 │        │
│  │      → { x:50, y:650, w:280, h:45 }                             │        │
│  │                                                                  │        │
│  │ centerX = 50 + 280/2 = 190                                      │        │
│  │ centerY = 650 + 45/2 = 672.5                                    │        │
│  │                                                                  │        │
│  │ originX = 190 / 430 = 0.442                                     │        │
│  │ originY = 672.5 / 932 = 0.721                                   │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                         │                                                    │
│                         ▼                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │ CSS OUTPUT                                                      │        │
│  │                                                                  │        │
│  │ transform: scale(1.3)                                           │        │
│  │ transform-origin: 44.2% 72.1%                                   │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
│  🎥 CAMERA ZOOMS TO THE ACTUAL MESSAGE LOCATION                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Overview

### Four-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: ANCHOR PROVIDERS                                                   │
│  "What can be focused?"                                                      │
│                                                                              │
│  WhatsApp → lastMessage, typingIndicator, inputArea                         │
│  Phone    → callPoster, acceptButton, declineButton                         │
│  Twitter  → focusedTweet, replyBox, likeButton                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 2: INTENT RESOLUTION                                                  │
│  "When to focus?"                                                            │
│                                                                              │
│  MESSAGE_RECEIVED → FOCUS(lastMessage)                                       │
│  TYPING_STARTED   → FOCUS(inputArea)                                        │
│  CALL_INCOMING    → FOCUS(callPoster)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 3: SHOT PRESETS                                                       │
│  "How should it look?"                                                       │
│                                                                              │
│  dramatic → scale: 1.3, shake: 4, easing: ease-out                          │
│  subtle   → scale: 1.08, shake: 0, easing: cinematic                        │
│  snap     → scale: 1.15, shake: 0, easing: ease-out                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 4: CAMERA MATH                                                        │
│  "Pure transform computation"                                                │
│                                                                              │
│  Input:  rect + preset + viewport                                           │
│  Output: { scale, originX, originY, shakeX, shakeY }                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Separation of Concerns

| Layer | Owner | Knows About | Doesn't Know About |
|-------|-------|-------------|-------------------|
| **Anchor Providers** | Apps | UI layout, semantics | Camera, presets |
| **Intent Resolution** | Director | Events, timing | Pixels, layout |
| **Shot Presets** | Designer | Cinematography | Specific apps |
| **Camera Math** | Engine | Rects, transforms | Semantics, apps |

---

## The Four Layers

### Layer 1: Anchor Providers

Anchor providers extract **semantic meaning** from layout:

```typescript
interface AnchorProvider {
  appId: string;
  getAnchors(world: WorldState, layout: LayoutState, deviceId: string): AnchorSnapshot;
}

interface AnchorSnapshot {
  appId: string;
  deviceId: string;
  anchors: Partial<Record<SemanticAnchorId, LayoutRect>>;
}
```

**Built-in anchors:**

| Anchor | Meaning | Apps |
|--------|---------|------|
| `lastMessage` | Most recent message bubble | WhatsApp, Twitter DMs |
| `typingIndicator` | Typing dots (volatile) | WhatsApp |
| `inputArea` | Text input field | All chat apps |
| `callPoster` | Contact poster image | Phone |
| `device` | Full screen (fallback) | All |

**WhatsApp Provider:**

```typescript
// packages/renderer/src/anchor-providers/whatsapp.ts

export const WhatsAppAnchorProvider: AnchorProvider = {
  appId: "app_whatsapp",

  getAnchors(world, layout, deviceId) {
    const anchors: Partial<Record<SemanticAnchorId, LayoutRect>> = {};
    const profile = getDeviceProfile(world.devices[deviceId]?.profileId);
    
    if (layout.kind === "CHAT") {
      const chatLayout = layout as ChatLayoutState;
      
      // Last message from layout
      const lastMsgId = chatLayout.meta?.lastMessageId;
      if (lastMsgId && chatLayout.messageLayouts[lastMsgId]) {
        anchors.lastMessage = chatLayout.messageLayouts[lastMsgId].rect;
      }
      
      // Input area
      anchors.inputArea = {
        x: 0,
        y: profile.dimensions.height - 52,
        width: profile.dimensions.width,
        height: 52,
      };
    }
    
    // Device is always available (from profile, NOT hardcoded!)
    anchors.device = { x: 0, y: 0, ...profile.dimensions };
    
    return { anchors, deviceId, appId: "app_whatsapp" };
  }
};
```

---

### Layer 2: Intent Resolution

**Fallback Chains** handle missing anchors:

```typescript
const FALLBACK_CHAINS = {
  typingIndicator: ["inputArea", "lastMessage", "device"],
  lastMessage: ["inputArea", "device"],
  inputArea: ["lastMessage", "device"],
  device: [],  // Always available
};
```

**Hysteresis** prevents jitter:

```typescript
const ANCHOR_STABILITY_FRAMES = 3;

// Anchor must be stable for 3 consecutive frames before switching
// Prevents: typingIndicator flickers → camera doesn't spaz out
```

---

### Layer 3: Shot Presets

```typescript
// packages/core/src/camera/presets.ts

export const SHOT_PRESETS = {
  dramatic: { scale: 1.3, durationFrames: 25, easing: "ease-out", shake: 4 },
  subtle:   { scale: 1.08, durationFrames: 30, easing: "cinematic", shake: 0 },
  snap:     { scale: 1.15, durationFrames: 10, easing: "ease-out", shake: 0 },
  impact:   { scale: 1.4, durationFrames: 15, easing: "ease-out", shake: 8 },
  message:  { scale: 1.1, durationFrames: 25, easing: "ease-out", shake: 0 },
  reset:    { scale: 1.0, durationFrames: 20, easing: "ease-out", shake: 0 },
};
```

**Anchor Framing** (where anchors should appear in frame):

```typescript
export const ANCHOR_FRAMING = {
  lastMessage:      { anchorPoint: { x: 0.5, y: 0.75 }, targetFill: 0.55 },
  inputArea:        { anchorPoint: { x: 0.5, y: 0.9 }, targetFill: 0.4 },
  typingIndicator:  { anchorPoint: { x: 0.5, y: 0.82 }, targetFill: 0.3 },
  callPoster:       { anchorPoint: { x: 0.5, y: 0.4 }, targetFill: 0.65 },
  device:           { anchorPoint: { x: 0.5, y: 0.5 }, targetFill: 1.0 },
};
```

---

### Layer 4: Camera Math

The camera engine is **semantically ignorant** — it just does math:

```typescript
// packages/renderer/src/engines/useCameraEngine.ts — Section 3.5

// 1. Get the rect
const resolved = resolveAnchorWithFallback(anchorId, anchorSnapshot.anchors);
const rect = resolved.rect;

// 2. Compute center
const centerX = rect.x + rect.width / 2;
const centerY = rect.y + rect.height / 2;

// 3. Normalize to 0-1
const originX = Math.max(0.1, Math.min(0.9, centerX / viewportWidth));
const originY = Math.max(0.1, Math.min(0.9, centerY / viewportHeight));

// 4. Apply easing
const easedProgress = applyEasingSimple(progress, easing);
const scale = 1 + (targetScale - 1) * easedProgress;

// 5. Output transform
finalCameraTransform = { scale, originX, originY, shakeX, shakeY };
```

---

## Coordinate Spaces

| Space | Owner | Origin | Use Case |
|-------|-------|--------|----------|
| **Content Space** | Layout Engine | Scroll-relative | Message at y=2000px in long chat |
| **Viewport Space** | Anchor Providers | Device top-left | All anchors (standard) |
| **Composition Space** | Camera Engine | Video frame | Multi-device layouts |

**Rule:** Anchor Providers always return **Viewport Space** rects.

---

## DSL Reference

### `anchorFocus(at, anchor, preset, shake?)`

Focus camera on a semantic anchor with a preset style.

```typescript
dsl.anchorFocus(60, "lastMessage", "dramatic", 5)
//              │    │             │           └── Optional shake intensity
//              │    │             └── Shot preset
//              │    └── Semantic anchor ID
//              └── Frame number
```

### `reset(at, duration)`

Return camera to neutral position.

```typescript
dsl.reset(200, 40)
//        │    └── Duration in frames
//        └── Frame number
```

### Available Anchors

| Anchor | Description | Apps |
|--------|-------------|------|
| `lastMessage` | Most recent message | WhatsApp, Instagram DM |
| `inputArea` | Text input field | All chat apps |
| `typingIndicator` | Typing dots | WhatsApp |
| `callPoster` | Contact poster | Phone |
| `device` | Full device | All (fallback) |

### Available Presets

| Preset | Scale | Shake | Duration | Use Case |
|--------|-------|-------|----------|----------|
| `dramatic` | 1.3 | 4 | 25 frames | Big reveals, emotional moments |
| `subtle` | 1.08 | 0 | 30 frames | Typing anticipation |
| `snap` | 1.15 | 0 | 10 frames | Quick reactions |
| `impact` | 1.4 | 8 | 15 frames | Maximum intensity |
| `message` | 1.1 | 0 | 25 frames | Standard message follow |
| `reset` | 1.0 | 0 | 20 frames | Return to neutral |

---

## Extension Guide

### Adding a New Anchor

1. Update your app's anchor provider:
   ```typescript
   // packages/renderer/src/anchor-providers/myapp.ts
   anchors.myNewAnchor = computeRect(/*...*/);
   ```

2. Add framing config (optional):
   ```typescript
   // packages/core/src/camera/presets.ts
   ANCHOR_FRAMING.myNewAnchor = { anchorPoint: { x: 0.5, y: 0.6 }, targetFill: 0.5 };
   ```

3. Use in DSL:
   ```typescript
   dsl.anchorFocus(frame, "myNewAnchor", "dramatic")
   ```

### Adding a New Preset

```typescript
// packages/core/src/camera/presets.ts
SHOT_PRESETS.myPreset = {
  scale: 1.25,
  durationFrames: 20,
  easing: "ease-out",
  shake: 3,
};

// packages/renderer/src/engines/useCameraEngine.ts
function getPresetScaleSimple(preset?: string): number {
  case "myPreset": return 1.25;
}
```

---

## File Reference

### Core Package (`@tokovo/core`)

| File | Purpose |
|------|---------|
| `anchors.ts` | AnchorProvider, AnchorSnapshot, fallback chains, hysteresis |
| `camera/presets.ts` | SHOT_PRESETS, ANCHOR_FRAMING, getShotPreset() |
| `camera/index.ts` | CameraController, applyAnchorFocus() |
| `types.ts` | CameraAnchorFocusEffect, ANCHOR_FOCUS event |

### Renderer Package (`@tokovo/renderer`)

| File | Purpose |
|------|---------|
| `anchor-providers/whatsapp.ts` | WhatsApp anchor extraction |
| `anchor-providers/phone.ts` | Phone call anchor extraction |
| `anchor-providers/notification.ts` | Notification anchor extraction |
| `anchor-providers/registry.ts` | Provider registration |
| `engines/useCameraEngine.ts` | **THE MISSING LINK** — anchor resolution (Section 3.5) |

---

## Summary

**Before (The Old Way):**
```typescript
// Magic numbers everywhere
dsl.zoom(60, 1.25, 20, { originX: 0.5, originY: 0.8 })  // What is 0.8???
```

**After (The New Way):**
```typescript
// Semantic intent
dsl.anchorFocus(60, "lastMessage", "dramatic")
// → Resolves to actual message rect { x:50, y:650, w:280, h:45 }
// → Computes origin: 44.2%, 72.1%
// → Camera follows the ACTUAL message
```

**The camera now follows meaning, not magic numbers.**

---

*Last updated: December 15, 2024*
