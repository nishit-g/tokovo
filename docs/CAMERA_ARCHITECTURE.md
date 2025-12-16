# 🎥 Tokovo Camera Architecture: The Virtual Lens

> **Status:** Living Document
> **Version:** 1.0.0
> **Mental Model:** Locked
> **Word Count:** 3000+

---

## 1. The Philosophy of the Virtual Lens

In traditional web development, a camera is just a `transform: scale()`. Ideally, it's just a zoomed-in div.
In filmmaking, a **Camera** is a physical object with mass, weight, momentum, and optical characteristics. It is operated by a human being who breathes, shakes, and reacts with a delay.

**Tokovo's Camera Architecture** is not a zoom tool. It is a **Virtual Cinematography Engine**.

We simulate:
1.  **Mass & Momentum:** Movements are not linear. They accelerate and decelerate (Ease-In-Out).
2.  **Operator Presence:** The camera is never truly still. It breathes. It shakes on impact.
3.  **Semantic Focus:** A human cameraman doesn't look at "Coordinates (100, 200)". They look at "The Gun" or "The Message". We build our camera to track **Meaning**, not pixels.

---

## 2. The Coordinate System: The 393px Universe

To build a robust camera, we must agree on the content universe.

### 2.1 The Logical Device
All Tokovo apps (WhatsApp, Twitter, etc.) are designed against a **Reference Device**:
*   **Width:** 393px (iPhone 15 Pro logical width)
*   **Height:** Variable (typically ~852px)

We do **NOT** use responsive units (%, vw) for the internal layout of apps. We use fixed pixels based on this 393px standard. This ensures that a 16px font looks exactly like 16px on an iPhone.

### 2.2 The Viewport System
The **Camera** views this content through a window.

*   `scale = 1.0`: The viewport width matches the device width (393px).
*   `scale = 2.0`: The viewport width is half the device width (196.5px). We are zoomed in 2x.

### 2.3 The Origin (Anchoring)
The most misunderstood concept in CSS transforms is `transform-origin`.
In Tokovo, we normalize this:
*   `originX: 0.0` = Left Edge
*   `originX: 0.5` = Vertical Center
*   `originX: 1.0` = Right Edge

If we execute `zoom: 2.0` with `origin: 0.5, 0.5`, we zoom into the exact center of the screen.
If we execute `zoom: 2.0` with `origin: 0.5, 1.0`, we zoom into the **keyboard/input area**.

---

## 3. The Hierarchy of Control: The Three Modes

Understanding "Who is driving?" is critical. Tokovo has three drivers, prioritized strictly.

### 3.1 Mode 1: DirectorLite (Auto)
> *Priority: Lowest (Default)*

If you write zero camera code, **DirectorLite** drives.
It is an intelligent agent running inside the engine (`packages/core/src/director-lite`).
*   **Inputs:** It watches the timeline for `Signals` (e.g., `NewMessage`, `TypingStarted`).
*   **Decisions:** It applies `Rules` (e.g., "When a new message arrives, zoom 1.08x to it").
*   **Behavior:** It is "Always On" unless overridden.

### 3.2 Mode 2: Semantic (Intent)
> *Priority: Medium (Overrides Auto)*

You tell the camera *what* to look at, but not *how*.
```typescript
d.camera.focus("lastMessage");
```
Here, you override DirectorLite's choice. Even if DirectorLite wants to look at the keyboard (because typing happened), your explicit command wins.
This relies on the **Anchor System** to find "lastMessage".

### 3.3 Mode 3: Manual (Explicit)
> *Priority: Highest (God Mode)*

You take full control of the lens.
```typescript
d.camera.zoom(1.5, { originX: 0.2, originY: 0.2 });
d.camera.hold("3s");
```
**Strict Policy:** If *any* manual camera effect is active in the current frame, DirectorLite is **completely suspended**. It does not try to "fight" you. It yields.

---

## 4. The Anchor System: Semantic Tracking

The "Anchor" is the crown jewel of our camera system. It solves the hardest problem in generated video: **Dynamic Content Sizing**.

Problem: You want to zoom into a message.
*   In a static video: "Zoom to Y=500".
*   In a dynamic video: The message might be at Y=500, or Y=800 (if the previous text was long).

**Solution:** We track the element, not the coordinate.

### 4.1 The Registry Pattern (`anchors.ts`)
Apps do not "return" coordinates. They **register providers**.

```typescript
// Inside WhatsApp logic
AnchorRegistry.register({
    appId: "whatsapp",
    getAnchors: (world, layout) => ({
        "lastMessage": computeBoundingBox(world.messages.last()),
        "inputArea": { x: 0, y: 800, width: 393, height: 50 },
        "header": { x: 0, y: 0, width: 393, height: 60 }
    }),
    framing: {
        "lastMessage": { anchorPoint: { x: 0.5, y: 0.5 } }, // Frame it center
        "inputArea": { anchorPoint: { x: 0.5, y: 0.9 } }    // Frame it at bottom
    }
});
```

### 4.2 Runtime Resolution
Every frame in `useCameraEngine`:
1.  We define `Intent`: "Focus on lastMessage".
2.  We query `AnchorRegistry.get("whatsapp").getAnchors(...)`.
3.  We get a `LayoutRect`.
4.  We convert that rect + framing config -> `originX, originY`.

### 4.3 Anchor Hysteresis
To prevent jitter (e.g., if a message disappears for 1 frame during a render flicker), we implement **Hysteresis**.
*   `ANCHOR_STABILITY_FRAMES = 3`.
*   The camera will not switch targets until the new target exists for 3 consecutive frames.

---

## 5. DirectorLite: The "Auto-Pilot"

DirectorLite is defined in `packages/core/src/director-lite`.

### 5.1 Signals
It doesn't see "everything". It only sees high-level `Signals`:
*   `TypingStarted`: Someone is creating content.
*   `NewMessage`: Content has arrived.
*   `MessageRead`: Passive acknowledgement.
*   `CallIncoming`: High urgency interrupt.

### 5.2 The Strategy (`ViralDramaV1`)
We ship with one opinionated strategy: **ViralDramaV1**.
Rules:
1.  **Typing**: Subtle push-in (Zoom 1.04x) to `inputArea`. Builds anticipation.
2.  **Message**: Standard zoom (Zoom 1.08x) to `lastMessage`. Follows the action.
3.  **Read**: Very subtle micro-zoom to `lastMessage`. Acknowledges receipt.
4.  **Delete**: `MicroShake` (Intensity 6). Visually represents the "undo".

### 5.3 Cooldowns
To prevent motion sickness, DirectorLite has internal cooldowns per conversation.
*   If it zoomed for a message, it won't zoom for another message for 20 frames.
*   Exceptions: `CallIncoming` has 0 priority and 0 cooldown (Immediate override).

---

## 6. The DSL Authoring Guide

How should you write camera moves?

### Scenario A: The "Lazy Director" (Recommended)
You want a standard conversation.
**Code:** Do nothing.
**Result:** DirectorLite will automatically zoom slightly when Alice types, and pan to her message when she sends it. It keeps the video alive without you lifting a finger.

### Scenario B: The "Emphasis" Override
Alice sends a shocking text. You want to make sure the viewer feels it.
**Code:**
```typescript
d.beat("The Reveal", b => {
    b.camera.focus("lastMessage", { preset: "impact" }); // Override Auto
    b.messages.create("I know what you did.");
});
```
**Result:** The manual `focus` command takes priority. The `impact` preset (Zoom 1.35x, Shake 6) replaces the polite DirectorLite zoom.

### Scenario C: The "Walk and Talk" (Tracking)
You want to follow a long stream of texts continuously.
**Code:**
```typescript
d.camera.track("lastMessage", { smoothing: 0.1 });
```
**Result:** The camera enters "Operator Follow" mode. It smoothly interpolates to keep the latest message in view as the chat scrolls.

### Scenario D: God Mode (Manual Fixes)
DirectorLite is framing something wrong, or you need a specific crop.
**Code:**
```typescript
d.camera.hold("2s"); // Stop all movement
d.camera.pan(0, 100); // Manually adjust Y
```

---

## 7. The Math: Interpolation & Easing

### 7.1 Presets (`presets.ts`)
We lock our math values to ensure brand consistency.
*   `"impact"`: `scale: 1.35`, `easing: "expoOut"`.
*   `"subtle"`: `scale: 1.04`, `easing: "cinematic"`.
*   **V1 Sacred Rule:** Do not change these numbers. Tens of thousands of existing videos depend on them.

### 7.2 The "Cinematic" Curve
Our custom easing function:
```typescript
// S-curve: Smooth start -> Linear middle -> Smooth end
t * t * (3 - 2 * t)
```
This mimics a heavy camera rig that takes effort to start moving and effort to stop.

### 7.3 Deterministic Shake
We use seeded Mulberry32 noise.
`seed = frameNumber + constant`.
This ensures that Frame 100 always has the exact same "random" offset, preventing render flickering between passes.

---

## 8. Rendering Pipeline

### Why CSS Transforms?
We render a hierarchy:
```html
<CameraLayer>
  <div style="transform: scale(camera.scale) ...">
    <AppLayer />
  </div>
</CameraLayer>
```

We use CSS because:
1.  **Text Rendering**: Browsers are amazing at font rasterization. Scaling a `div` keeps text sharp (vector-like behavior). Rendering to Canvas blurs text.
2.  **GPU Acceleration**: `transform` and `opacity` are the only properties that don't trigger layout reflow. This guarantees 60fps playback.

### The "Transition: None" Rule
In `useCameraEngine`:
```typescript
style = { transition: 'none' }
```
We disable CSS transitions entirely. We calculate the exact state *every single frame* in JS. This gives us frame-perfect control for video rendering, which CSS transitions (time-based) cannot guarantee.

---

## 9. Troubleshooting

### "The camera drifts off screen"
*   **Cause:** You tracked an anchor that was deleted or moved.
*   **Fix:** Ensure the anchor exists or use a fallback. Use `d.camera.reset()` to bail out.

### "DirectorLite isn't working"
*   **Cause:** You have a lingering manual effect. Did you call `d.camera.zoom(...)` with a long duration?
*   **Fix:** Check if a previous manual op is still "active" in the timeline.

### "Jittery Movement"
*   **Cause:** Conflict between CSS transitions (browser smooth) and our Frame-by-frame (manual smooth).
*   **Fix:** Ensure `transition: none` is applied.

### "Blurry Text"
*   **Cause:** Zooming in > 3x on raster assets.
*   **Fix:** Use SVGs for UI elements (vectors). Tokovo's standard assets are all high-res/SVG.
