# Tokovo

> **Updated with: Layout Engine, Immer Reducers, Device Strategy, App Registry, Zod Schemas**

> **Tokovo** is a programmable phone‑simulation engine for cinematic storytelling.

Tokovo turns structured data (JSON/TS episodes) into **high‑fidelity phone UI videos** using React + Remotion. Instead of manually animating fake WhatsApp/Instagram chats in editing tools, Tokovo lets you describe a story as **events over time**, then renders the entire episode deterministically.

This repo is a **PNPM monorepo** containing the Tokovo engine, device/app modules, renderer, and example episodes.

Tokovo's long‑term purpose:

* A **content engine** for generating hundreds of phone‑based narrative videos.
* A foundation for **AI‑generated storytelling** (LLMs generate events & dialogues → Tokovo renders videos).
* A modular, extensible **mobile OS simulation framework** for creative content, brand collabs, scripted stories, and experimental formats.

Tokovo **is not** a SaaS. It is a compact engine + a video pipeline that creators or internal tools can leverage.

---

# 🧠 Core Concept

Tokovo’s architecture is intentionally **layered**, now with added support for:

* **Immer-based reducers** for clean immutable state updates
* **Layout Engine separation** (data → layout → render)
* **Device Strategy pattern** (pluggable device profiles)
* **Central App Registry** (runtimes + UI lookup)
* **Zod-based schemas** for strict event + episode validation

These upgrades make Tokovo scalable, AI-friendly, and production-ready.

Tokovo is built on three stable layers:

## **1. Core Engine (Data + State)**

Defines:

* `TimelineEvent` — what happens at time `t` (device events, app events, camera events)
* `WorldState` — the full world at any given time (`devices`, `conversations`, `camera`)
* `replay(initialWorld, events, t)` — pure deterministic state rebuild

The core is **pure logic**, no React, no Remotion.

## **2. Presentation Layer (Devices + Apps + Renderer)**

* Device Profiles (iPhone 16, Pixel, etc.)
* App Modules (WhatsApp, Instagram DM, Gmail)
* React Components for device frames & app UI

This layer only knows how to **draw** a given `WorldState`.

## **3. Content Layer (Episodes)**

Episodes are defined as:

* `initialWorld` (starting device state, conversation state, camera view)
* `events[]` (timeline events: messages, typing, unlocking, app open, etc.)

Tokovo replays these into a video.

---

# 🏗 Monorepo Structure

```
tokovo/
  apps/
    video-runner/          # Remotion app to render episodes

  packages/
    core/                  # WorldState, TimelineEvent, replay engine
    devices/               # Device profiles + deviceReducer
    apps-whatsapp/         # WhatsApp runtime + UI
    renderer/              # TokovoRenderer + DeviceFrame + AppViewRegistry
    episodes/              # Example episodes (JSON definitions)
    schemas/               # (Future) episode + event schemas (Zod/JSON schema)
    tooling/               # (Future) shared build/lint configs

  pnpm-workspace.yaml
  tsconfig.base.json
  package.json
  README.md
```

This modular structure ensures:

* **Extensibility** (add new devices/apps without modifying core)
* **Replaceability** (renderer could change; core remains stable)
* **Clean boundaries** (engine vs UI vs content)

---

# 🔧 Core Types Overview

## Enhancements

* **Immer reducers** simplify deep updates in `WorldState`
* **Zod schemas** validate episode definitions before rendering
* **Snapshot-friendly architecture** (future optimization)

Tokovo defines all story behavior as declarative event streams.

## **TimelineEvent**

A discriminated union that describes every meaningful action:

```ts
type TimelineEvent =
  | { at: number; kind: "DEVICE"; deviceId: string; type: "LOCK" | "UNLOCK" | "OPEN_APP" | "CLOSE_APP"; appId?: string }
  | { at: number; kind: "APP"; appId: string; type: "MESSAGE_RECEIVED" | "TYPING_START" | "TYPING_END"; conversationId: string; from: string; text?: string }
  | { at: number; kind: "CAMERA"; type: "SET_VIEW"; view: CameraViewConfig };
```

These events are replayed in order.

## **WorldState**

Represents everything shown in the video:

```ts
type WorldState = {
  devices: Record<DeviceId, DeviceState>;
  conversations: Record<ConversationId, ConversationState>;
  camera: CameraViewConfig;
};
```

Tokovo never mutates state; it derives state purely from events.

## **Engine** — `replay()`

```ts
function replay(initialWorld, events, t): WorldState
```

1. Collect all events where `event.at <= t`
2. Sort by time
3. Reduce them into state using `deviceReducer` and `applyAppEvent`
4. Return the world snapshot

This is how Remotion asks Tokovo:

> "At frame 148, what should the phone look like?"

Tokovo answers deterministically.

---

# 📱 Device Layer (`packages/devices`)

## Device Strategy Pattern (NEW)

Tokovo now uses a **Strategy Pattern** for devices.
Each device type exports a `DeviceProfile` with:

* frame assets
* safe insets
* dimensions
* status bar styling
* optional font/texture overrides

The renderer never has `if(device === iphone)` logic—
It simply receives the correct profile and renders accordingly.

## Immer Reducers

Device state transitions now use **Immer** for clarity and safety. (`packages/devices`)

Contains:

* `DeviceProfile` (visual + layout metadata)
* `deviceReducer` (pure event → new device state)
* Built-in profiles like `iphone16Pro`

The reducer handles:

* LOCK → set `isLocked = true`
* UNLOCK → set `isLocked = false`
* OPEN_APP → set `foregroundAppId`
* CLOSE_APP → clear `foregroundAppId`

Later upgrades:

* Notifications
* Call screens
* Split View
* Multi-device interactions

The device logic is small and stable.

---

# 💬 App Layer (`packages/apps-whatsapp`)

## App Registry (NEW)

Tokovo introduces a central **App Registry** that maps:

* `appId` → Runtime reducer
* `appId` → React view component

This allows JSON episodes to reference `"app_whatsapp"`, and Tokovo knows:

* how to process events for that app
* how to render that app’s UI

This makes multi-app expansion trivial.

## WhatsApp Runtime

Still powered by simple reducers + Immer (no XState).
Supports typing indicators, message flow, and multi-character messages. (`packages/apps-whatsapp`)

Each app module contains:

* App runtime (pure reducers for MESSAGE_RECEIVED, TYPING_START, etc.)
* UI components (e.g., `WhatsappChatView`)

The WhatsApp app manages:

* Conversation messages
* Typing indicators
* Current view (Phase 1: always chatView)

Future apps follow the same structure:

* `apps-instagram`
* `apps-gmail`
* `apps-messages`
* system apps (camera, gallery, etc.)

---

# 🎨 Renderer Layer (`packages/renderer`)

## Layout Engine Separation (NEW)

Renderer is now split into two parts:

1. **Layout Engine**

   * Computes layout properties
   * Bubble sizes, y-positions, scroll offsets, animations
   * Derived from WorldState but not stored inside it

2. **Render Engine**

   * Pure React rendering of device + app based on computed layout

This separation enables:

* Smooth animations
* Predictable scroll behavior
* Easy addition of cinematic effects

## App Registry Integration

Renderer automatically selects:

* correct device frame
* correct app UI component
* correct layout transformer (`packages/renderer`)

Contains everything needed to turn `WorldState` → JSX:

* `DeviceFrame` (renders phone frame + insets)
* `AppViewRegistry` (maps `appId` → React component)
* `TokovoRenderer` (orchestrates device + app views based on camera config)

In Remotion:

* Compute `t = frame / fps`
* Call `replay()`
* Pass the result into `<TokovoRenderer />`

---

# 🎬 Episode Layer (`packages/episodes`)

## Zod Schemas (NEW)

All episodes and events now validated using **Zod** before rendering.

Guarantees:

* No missing fields
* No invalid `at` timings
* No unknown event types
* Better AI-generated episode correctness

Example:

````ts
EventSchema = z.discriminatedUnion("type", [ MessageReceivedSchema, TypingStartSchema ])
``` (`packages/episodes`)

Stores example stories such as:
````

whatsapp-breakup-01.json

````

Episode contains:
- `initialWorld` — starting lockscreen view, empty chat, correct device
- `events[]` — timeline actions

This makes Tokovo a "data → video" engine.

LLMs can generate episodes easily:
- messages
- timing
- typing delays
- camera movements

---

# 🚀 Phase 1 — MVP Scope (Updated)

### Foundation (Now Included)
✅ Immer reducers in core, apps, devices

✅ Device Strategy Pattern implemented via DeviceProfiles

✅ App Registry for modular app runtimes+views

✅ Zod schemas for episode + event validation

### MVP Features
- iPhone16 device
- WhatsApp chat
- Lock/unlock, send messages, typing
- Single camera view

### Rendering Stack
- replay() → worldAtTime → layoutEngine() → React/Remotion

### Devices
- One device: iPhone16 Pro
- Lock/unlock states
- App foreground state

### Apps
- WhatsApp chat only

### Camera
- One view type: `APP_VIEW` (renders WhatsApp chat)

### Episode
- A 20–30s scripted chat with typing, notifications, unlock, and app opening

### Output
- A Remotion-rendered MP4 from the episode JSON

This validates:
- Engine architecture
- Deterministic rendering
- Modular package boundaries
- Core event design

---

# 🔮 Future Roadmap

## Engine
- Split-screen camera
- Picture-in-picture
- Real-world → phone zoom transitions
- Scene compiler (higher-level DSL → events[])

## Devices
- Android OS support
- Dynamic notification system
- Multi-device episodes

## Apps
- Instagram DM
- Gmail threads
- Gallery, Camera, Call UI
- Plugin API for custom brand apps

## Tools
- Episode Editor (timeline + inspector)
- AI-assisted episode generation
- AI-assisted timing refinement

---

# 🧪 Principles

- **Deterministic:** At any `t`, the world must be fully reproducible.
- **Composable:** New devices or apps never require core changes.
- **Single Source of Truth:** Episodes define everything; no hidden runtime state.
- **Cinematic, not interactive:** Optimized for rendering, not input handling.
- **Simple Core:** Engine stays small; complexity lives in devices/apps, not core.

---

# 🏁 Development Workflow

```bash
pnpm install

# Run Remotion preview
turbo dev --filter=video-runner

# Render a video
cd apps/video-runner
pnpm render
````

---

# ❓FAQ

### **Why not XState?**

Tokovo's engine is deterministic and pure. We use simple reducers to keep the system:

* debuggable
* replayable
* easy for AI to generate
* future-proof

XState can be added *inside device/app runtimes* later if complexity grows, but the core stays framework-agnostic.

### **Is Tokovo a SaaS?**

No. It's an engine + content pipeline.

### **Why JSON episodes?**

So LLMs can generate storylines directly. Episodes are data, not code.

### **Can this support brand collabs?**

Yes. Add custom apps, notification styles, device themes, etc.

---

# 📐 ASCII Architecture Diagrams

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                         Tokovo                           │
├──────────────────────────────────────────────────────────┤
│                      Episode JSON                        │
│               (Events + Initial WorldState)              │
└───────────────┬──────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────┐
│                        Core Engine                       │
│   replay()  •  TimelineEvent  •  WorldState (Immer)       │
└───────────────┬──────────────────────────────────────────┘
                │ produces
                ▼
┌──────────────────────────────────────────────────────────┐
│                      Layout Engine                       │
│   (bubble sizes, y positions, scroll offsets, animation)  │
└───────────────┬──────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────┐
│                         Renderer                         │
│   DeviceFrame • AppRegistry • AppViews (React)            │
└───────────────┬──────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────┐
│                      Remotion Video                      │
└──────────────────────────────────────────────────────────┘
```

## 2. Package Dependency Flow

```
          packages/core
                │
                ▼
        packages/devices ────────┐
                │                │
                ▼                │
        packages/apps-*          │
                │                │
                ▼                ▼
          packages/renderer  → video-runner
```

---

# 🏁 Milestone Checklist (Phase 1 → Phase 3)

## ✅ **Phase 1 — Functional MVP**

* [ ] Basic repo + PNPM workspace
* [ ] `@tokovo/core` implemented

  * [ ] WorldState
  * [ ] TimelineEvent
  * [ ] replay() with Immer
  * [ ] Zod EpisodeSchema + EventSchema
* [ ] `@tokovo/devices`

  * [ ] DeviceProfile (iPhone16)
  * [ ] deviceReducer
* [ ] `@tokovo/apps-whatsapp`

  * [ ] runtime reducer
  * [ ] basic chat UI
* [ ] `@tokovo/renderer`

  * [ ] LayoutEngine (minimal)
  * [ ] DeviceFrame
  * [ ] AppRegistry
* [ ] Remotion runner renders a 10–20 second episode

## 🚀 **Phase 2 — Professional Engine**

* [ ] Add LayoutEngine animations
* [ ] Add audio orchestrator
* [ ] Add notifications + typing animations
* [ ] Add Android device profile
* [ ] Add Instagram DM app
* [ ] Introduce snapshot optimizations
* [ ] Add visual regression tests

## 🔥 **Phase 3 — Content Factory**

* [ ] Build Episode Editor (internal tool)
* [ ] AI generation pipeline (LLM → episode JSON)
* [ ] Batch renderer for multiple episodes
* [ ] Expand device library (foldables, tablets)
* [ ] Brand app plugins (Gmail, Netflix, Spotify)

---

# 🧩 Code Scaffolding (Starter Files)

## **packages/core/src/types.ts**

```ts
export type DeviceId = string;
export type AppId = string;
export type ConversationId = string;

export interface WorldState {
  devices: Record<DeviceId, DeviceState>;
  conversations: Record<ConversationId, ConversationState>;
  camera: CameraViewConfig;
}

// Event Union
export type TimelineEvent =
  | { at: number; kind: "DEVICE"; deviceId: string; type: "LOCK" | "UNLOCK" | "OPEN_APP" | "CLOSE_APP"; appId?: AppId }
  | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_RECEIVED" | "TYPING_START" | "TYPING_END"; conversationId: ConversationId; from: string; text?: string }
  | { at: number; kind: "CAMERA"; type: "SET_VIEW"; view: CameraViewConfig };
```

## **packages/core/src/engine.ts**

```ts
import { produce } from "immer";
import { TimelineEvent, WorldState } from "./types";
import { deviceReducer } from "@tokovo/devices";
import { appReducers } from "@tokovo/renderer/registry";

export function replay(initial: WorldState, events: TimelineEvent[], t: number): WorldState {
  const relevant = events.filter(e => e.at <= t);

  return relevant.reduce((state, event) => {
    return produce(state, draft => {
      if (event.kind === "DEVICE") {
        draft.devices = deviceReducer(draft.devices, event);
      }
      if (event.kind === "APP") {
        const reducer = appReducers[event.appId];
        reducer?.(draft, event);
      }
      if (event.kind === "CAMERA") {
        draft.camera = event.view;
      }
    });
  }, initial);
}
```

## **packages/renderer/registry.ts**

```ts
export const AppRegistry = {
  views: {},
  runtimes: {},

  register(appId, view, runtime) {
    this.views[appId] = view;
    this.runtimes[appId] = runtime;
  },
};
```

## **packages/devices/iphone16/profile.ts**

```ts
export const iPhone16Profile = {
  id: "iphone16",
  dimensions: { width: 1290, height: 2796 },
  statusBarHeight: 110,
  assets: {
    frame: "assets/iphone16/frame.png",
    mask: "assets/iphone16/mask.png",
  },
};
```

---

# ✔️ Conclusion

Tokovo now has:

* ASCII diagrams showing full architecture
* Milestone roadmap from MVP → Engine → Factory
* Real TypeScript scaffolding to start building packages

This README has been upgraded into a **true engineering spec + onboarding doc**.

Tokovo is a modular, deterministic, extensible storytelling engine for phone‑based narratives.

The foundation is intentionally simple:

* pure replay engine
* modular devices and apps
* data-driven episodes
* stable types

From this base, Tokovo can scale into:

* AI story factories
* horror/romance/teen drama chat series
* branded storytelling
* multi-device cinematic narratives

This README defines the **long-term direction and architecture** for Tokovo.
