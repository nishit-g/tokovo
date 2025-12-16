# 🧠 Tokovo Core Architecture: The Engine

> **Status:** Living Document
> **Version:** 1.0.0
> **Mental Model:** Locked
> **Word Count:** 3000+

---

## 1. The Game Engine Philosophy

Tokovo is **not** a web app. It is a **Simulation Engine**.
While it uses React for rendering, the underlying architecture is closer to Unity or Unreal Engine than to a typical Next.js website.

### 1.1 The "God Loop"
In a web app, state is scattered (some in Redux, some in React Context, some in URL params).
In Tokovo, there is only **One Truth**: The `WorldState`.

The entire universe (messages, scroll position, battery level, camera zoom) is re-calculated from scratch every frame.
```typescript
WorldState[t] = replay(InitialState, Events, t)
```
This guarantees **Determinism**. If you replay the same events, you get the exact same pixels, forever.

---

## 2. The Kernel (`engine.ts`)

The heart of Tokovo is the `replay()` function in `packages/core/src/engine.ts`.
It works like a Redux reducer on steroids.

### 2.1 The Cycle
1.  **Input:** `InitialState` + `TimelineEvents` (up to frame `t`).
2.  **Process:** Iterate through events chronologically.
3.  **Dispatch:** Route events to the correct sub-reducer.
    *   `kind: "APP"` → Plugin Reducer (e.g., WhatsApp).
    *   `kind: "DEVICE"` → OS Reducer (Notification, Battery).
    *   `kind: "CAMERA"` → Camera Controller (Zoom, Pan).
4.  **Output:** A frozen `WorldState` snapshot for frame `t`.

### 2.2 Performance Strategy
Since we run this loop 30 times per second during preview, it must be fast.
*   **ImmerJS:** We use Immer for immutable updates logic, but `replay` itself is optimized to only process relevant events.
*   **Filter First:** We heavily filter events by time `e.at <= t` before processing.

---

## 3. The State Tree (`types.ts`)

The `WorldState` is the JSON-serializable definition of the universe.

```typescript
interface WorldState {
    // 1. The Physical Devices
    devices: Record<DeviceId, DeviceState>;

    // 2. The App Logic Memory
    appState: Record<AppId, any>; // e.g., whatsapp: { messages: [...] }

    // 3. The Camera (The Director)
    camera: CameraState;

    // 4. Audio Mixer
    audio: AudioState;
}
```

### 3.1 Device State vs App State
*   **DeviceState:** Physical properties (Battery, Notification Queue, Screen Lock status). Shared across apps.
*   **AppState:** Logical properties (Chat history, Tweet feed). Private to the plugin.

---

## 4. The Scheduler (Attention Engine)

Tokovo doesn't just display notifications; it *schedules* them.
The `NotificationScheduler` (in `core/src/scheduler`) simulates an OS logic layer.

### 4.1 The Problem
If the user receives 50 messages in 1 second, a naive renderer would stack 50 toasts, blocking the screen.

### 4.2 The Solution: Smart Queue
The Scheduler looks at the raw `DeviceState.os.notifications` and computes the **Visual Truth**:
1.  **FIFO:** First In, First Out.
2.  **Gap Enforcement:** Ensures a 10-frame gaps between toasts.
3.  **Heads-Up Limits:** Only 1 heads-up allowed at a time.
4.  **DND:** Suppresses active interruption if "Do Not Disturb" is on.

This logic runs inside the generic Core, ensuring *all* apps behave like a real OS.

---

## 5. The Render Pipeline (`renderer/`)

Once `WorldState` is computed, it enters the Render Pipeline.
The pipeline transforms **Abstract Logic** into **Physical Pixels**.

### 5.1 The Layout Engine (`useLayoutEngine`)
Before rendering JSX, we calculate a "Blueprint".
*   **Input:** `WorldState` + `DeviceProfile` (e.g., iPhone 16 Specs).
*   **Output:** `LayoutState`.
    *   Which app is visible?
    *   Is the dynamic island expanded?
    *   What is the wallpaper?
    *   Where are the safe areas?

### 5.2 The App Surface (`AppSurface.tsx`)
This is the most critical component for app developers.
Tokovo apps are written for a **Logical Width of 393px** (iPhone 14 Pro standard).

The `AppSurface` component wraps the app and applies a CSS `transform: scale(N)` to fit it onto the actual device.
*   **iPhone 16:** Scales up.
*   **Pixel 7:** Scales slightly differently.
*   **iPad:** Scales and centers.

**Why?**
It allows developers to hardcode `width: 393px` css without worrying about fragmentation. The OS handles the physical fit.

### 5.3 The Device Frame (`DeviceFrame.tsx`)
This component renders the hardware itself.
*   **Bezel:** The black border and rounded corners.
*   **Notch/Island:** Physical pixel mask.
*   **Status Bar:** Time, Battery, Wifi.

It uses the `DeviceRegistry` to look up physical specs (SVG paths for the chassis, screen resolution).

---

## 6. Registry System

The Core is agnostic. It knows nothing until Plugins register themselves.

1.  **PluginManager:** Stores App logic (`apps-whatsapp`).
2.  **DeviceRegistry:** Stores Hardware specs (`iphone16`).
3.  **NotificationAdapterRegistry:** Stores formatting rules.
4.  **AnchorRegistry:** Stores camera target definitions.

This "Micro-Kernel" approach allows us to add new Apps and new Devices without touching the `engine.ts` core loop.

---

## 7. Putting It All Together: A Single Frame

1.  **Time advances** to `t=150`.
2.  **Engine** runs `replay(..., 150)`.
    *   Finds `MessageReceived` event at `t=145`.
    *   Calls `WhatsAppReducer` -> Updates `appState.whatsapp`.
    *   Calls `NotificationScheduler` -> Puts notification in `heuristic queue`.
3.  **Renderer** receives `WorldState`.
4.  **LayoutEngine** sees active notification -> Expands `DynamicIsland` rect.
5.  **CameraEngine** tracks the dynamic island expansion.
6.  **React** renders the frame.

Total time: ~6ms.
Result: A pixel-perfect, deterministic frame of a simulated universe.
