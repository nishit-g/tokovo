# Anchor System

## What are Anchors?

**Anchors** are semantic names for UI elements that the camera can focus on. Instead of hardcoding pixel coordinates for camera movements, you use meaningful names like `"lastMessage"`, `"inputArea"`, or `"header"`.

The anchor system works through a two-stage process:

1. **Layout Engine** computes the screen positions (rectangles) of all UI elements
2. **Anchor Provider** maps semantic names to those rectangles
3. **Camera System** uses anchors to determine where to point and how to frame

This abstraction allows you to:

- Write episode camera movements that are resilient to UI changes
- Focus on content semantics rather than coordinates
- Automatically handle different device sizes and screen layouts

**Example:**

```typescript
// Instead of this:
.camera(cam => cam.at("2s").moveTo({ x: 150, y: 800 }))

// You write this:
.camera(cam => cam.at("2s").focus("lastMessage"))
```

The camera system automatically:

- Resolves `"lastMessage"` to the actual screen rectangle
- Applies appropriate framing (zoom level, anchor point)
- Handles fallbacks if the anchor isn't available

---

## Built-in Anchors

These anchors are **always available**, regardless of which app is running:

### `device`

The entire device viewport (full screen).

**Use case:** Reset to full-screen view, transitions between apps.

**Framing:** Centers the entire device, no zoom.

**Example:**

```typescript
cam.at("0s").focus("device"); // Show full phone
```

### `viewport`

Synonym for `device` - the renderable viewport area.

### `screen`

Another synonym for `device` - represents the entire screen.

---

## WhatsApp Anchors

When WhatsApp is the active app, the following semantic anchors become available through the **WhatsApp Anchor Provider**:

### Navigation & Layout

#### `header`

The top navigation bar containing the contact name, avatar, and action buttons.

**Framing:**

- `anchorPoint: { x: 0.5, y: 0.15 }` - Focus on upper portion
- `targetFill: 0.9` - Wide view to capture full header
- `paddingPx: 10`

**Use case:** Emphasize who the conversation is with, show call/video buttons.

#### `profile`

The contact avatar in the header (focused tightly on the profile picture).

**Framing:**

- `anchorPoint: { x: 0.2, y: 0.15 }` - Focus on left side where avatar is
- `targetFill: 0.4` - Tight zoom on avatar
- `paddingPx: 50`

**Use case:** Dramatic reveal of conversation partner, intimate focus.

---

### Messages

#### `lastMessage`

The most recent message in the conversation (computed alias).

**How it works:** The Layout Engine tracks the last message ID in `chatLayout.meta.lastMessageId`, and the anchor provider creates an alias that points to that message's rectangle.

**Framing:**

- Inherits from `message` (see below)

**Use case:** Auto-follow the conversation as new messages arrive.

**Example:**

```typescript
cam.at("2s").focus("lastMessage", { scale: 1.15 });
```

#### `message`

Generic framing for any message bubble.

**Framing:**

- `anchorPoint: { x: 0.5, y: 0.5 }` - Center of bubble
- `targetFill: 0.6` - Moderate zoom
- `paddingPx: 40`

**Use case:** Focus on a specific message by ID (e.g., `"msg_123"`).

#### `message_me`

Framing optimized for **outgoing messages** (sent by the user).

**Framing:**

- `anchorPoint: { x: 0.6, y: 0.5 }` - Shifted right (where outgoing bubbles are)
- `targetFill: 0.6`
- `paddingPx: 40`

**Use case:** Emphasize what "I" said in the conversation.

#### `message_other`

Framing optimized for **incoming messages** (received from contact).

**Framing:**

- `anchorPoint: { x: 0.4, y: 0.5 }` - Shifted left (where incoming bubbles are)
- `targetFill: 0.6`
- `paddingPx: 40`

**Use case:** Emphasize what the other person said.

**Note:** To focus on a specific message, use its ID:

```typescript
cam.at("3s").focus("msg_5", { scale: 1.2 });
```

The Layout Engine assigns IDs like `msg_0`, `msg_1`, etc., which are exposed as anchors.

---

### Input & Interaction

#### `inputArea`

The text input field at the bottom of the chat.

**Framing:**

- `anchorPoint: { x: 0.5, y: 0.8 }` - Focus on lower portion
- `targetFill: 0.9` - Wide view to show full input controls
- `paddingPx: 20`

**Use case:** Show the user typing, emphasize message composition.

#### `typing`

The "typing..." indicator bubble that appears when the contact is typing.

**Framing:**

- `anchorPoint: { x: 0.35, y: 0.5 }` - Shifted left (incoming side)
- `targetFill: 0.3` - Tight zoom on typing indicator
- `paddingPx: 30`

**Use case:** Dramatic focus on anticipation ("they're typing...").

**Example:**

```typescript
// Focus on typing indicator when contact starts typing
cam.at("5s").focus("typing", { scale: 1.3 });
```

---

## Fallback Behavior

If an anchor isn't available (e.g., `"lastMessage"` when chat is empty), the resolver uses **fallback chains**:

```
lastMessage     → content → app → device
inputArea       → content → app → device
typing          → inputArea → content → app → device
header          → app → device
content         → app → device
notification    → header → app → device
```

**Example:**

If `"lastMessage"` doesn't exist (empty chat), the camera falls back to:

1. `"content"` (chat content area)
2. `"app"` (entire app view)
3. `"device"` (full screen)

This prevents camera jumps to `(0, 0)` and ensures smooth degradation.

**Note:** The resolved anchor includes `isFallback: true` flag, which can be used for debugging or alternative animation paths.

---

## Framing Configuration

Each anchor has a **framing configuration** that controls how the camera frames the target.

### Framing Properties

#### `targetFill`

**Type:** `number` (0.0 - 1.0)  
**Description:** How much of the viewport the anchor should fill.

- `0.3` = Small, tight focus (e.g., typing indicator)
- `0.6` = Moderate zoom (e.g., message bubble)
- `0.9` = Wide view (e.g., header, input area)
- `1.0` = Full screen (e.g., device)

The camera calculates the required zoom scale to achieve this fill ratio.

#### `anchorPoint`

**Type:** `{ x: number, y: number }` (0.0 - 1.0 normalized)  
**Description:** Which point within the anchor rectangle to use as the camera's focus point.

- `{ x: 0.5, y: 0.5 }` = Center of anchor
- `{ x: 0.2, y: 0.15 }` = Top-left (e.g., profile avatar)
- `{ x: 0.6, y: 0.5 }` = Right-center (e.g., outgoing messages)

This determines the **transform origin** for camera movements.

#### `paddingPx`

**Type:** `number` (pixels)  
**Description:** Minimum padding around the anchor when framing.

Ensures the anchor isn't flush against viewport edges.

---

### Per-Anchor Framing Example

From `WhatsAppAnchors.framing`:

```typescript
{
  message_me: {
    anchorPoint: { x: 0.6, y: 0.5 },  // Focus right-center
    paddingPx: 40,                     // 40px breathing room
    targetFill: 0.6,                   // Fill 60% of viewport
  },

  header: {
    anchorPoint: { x: 0.5, y: 0.15 }, // Focus top-center
    paddingPx: 10,                     // Tight padding
    targetFill: 0.9,                   // Wide view
  },
}
```

---

## Creating Custom Anchors

To add anchors for a new app:

### 1. Implement the `AnchorProvider` Interface

```typescript
import { AnchorProvider, AnchorSnapshot, LayoutRect } from "@tokovo/core";

export const MyAppAnchors: AnchorProvider = {
  appId: "my_app_id",

  // Define framing preferences
  framing: {
    customElement: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 30,
      targetFill: 0.7,
    },
  },

  // Map layout state to anchors
  getAnchors(world, layout, deviceId): AnchorSnapshot {
    const anchors: Record<string, LayoutRect> = {};

    // Extract regions from your app's layout
    const myLayout = layout as MyAppLayoutState;

    if (myLayout.semantic?.regions) {
      // Pass through all semantic regions
      for (const [key, region] of Object.entries(myLayout.semantic.regions)) {
        anchors[key] = region.rect;
      }
    }

    // Create computed aliases
    if (myLayout.meta?.focusedItemId) {
      anchors["focused"] =
        myLayout.semantic.regions[myLayout.meta.focusedItemId].rect;
    }

    return {
      anchors,
      deviceId,
      appId: "my_app_id",
    };
  },
};
```

### 2. Register with the Camera System

```typescript
import { registerAnchorProvider } from "@tokovo/device-camera";

registerAnchorProvider(MyAppAnchors);
```

### 3. Use in Episodes

```typescript
.camera(cam => {
  cam.at("2s").focus("customElement");
  cam.at("5s").focus("focused", { scale: 1.3 });
})
```

---

## Anchor Resolution Flow

```
Episode defines:
  cam.at("2s").focus("lastMessage")
                       ↓
Camera System requests anchor snapshot
                       ↓
AnchorProvider.getAnchors() returns:
  { lastMessage: { x: 100, y: 500, width: 250, height: 80 } }
                       ↓
Anchor Resolver applies framing:
  - anchorPoint: { x: 0.5, y: 0.5 } → center of rect
  - targetFill: 0.6 → calculate zoom scale
  - paddingPx: 40 → ensure breathing room
                       ↓
Camera System animates to:
  { originX: 0.48, originY: 0.52, scale: 1.15 }
```

---

## Best Practices

### ✅ DO

- **Use semantic anchors** instead of hardcoded coordinates
- **Define clear framing preferences** for each anchor type
- **Provide computed aliases** (e.g., `lastMessage`, `focused`)
- **Handle missing anchors gracefully** (use fallback chains)
- **Test anchor resolution** with different layout states

### ❌ DON'T

- **Don't hardcode pixel coordinates** in episode camera movements
- **Don't use outdated anchor names** (e.g., `"input"` → use `"inputArea"`)
- **Don't assume anchors always exist** (handle fallbacks)
- **Don't define anchors without framing config** (camera won't know how to frame)

---

## Debugging Anchors

To inspect available anchors at runtime:

```typescript
import { getAnchorSnapshot } from "@tokovo/device-camera";

const snapshot = getAnchorSnapshot(world, deviceId);
console.log("Available anchors:", Object.keys(snapshot.anchors));
```

To trace anchor resolution:

```typescript
import { resolveAnchorFully } from "@tokovo/device-camera/anchors/resolver";

const resolved = resolveAnchorFully("lastMessage", snapshot, "app_whatsapp", {
  width: 1290,
  height: 2796,
});

console.log({
  anchor: resolved.resolvedAnchor,
  isFallback: resolved.isFallback,
  origin: { x: resolved.originX, y: resolved.originY },
  scale: resolved.suggestedScale,
});
```

---

## Summary

The anchor system provides:

- **Semantic abstraction** over screen coordinates
- **Automatic resolution** with fallback handling
- **Per-anchor framing** (zoom, focus point, padding)
- **Extensibility** for custom app anchors

This enables **content-aware camera movements** that adapt to dynamic UI layouts, making episodes resilient and maintainable.
