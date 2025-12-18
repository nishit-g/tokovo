# Keyboard System Architecture

> Complete architecture for the decoupled, track-based virtual keyboard system.

---

## Overview

The Tokovo keyboard is a **fully decoupled device-level plugin** that provides:

- **Independent control** via a dedicated keyboard track in the DSL
- **Realistic animations** (slide in/out, key press highlights)
- **Cross-app text injection** via `INPUT_CHANGE` events
- **Auto-registration** on import (no manual setup required)

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│ 1. EPISODE DSL (keyboard track)                                            │
│    kb.at("3s").show()                                                      │
│    kb.span("3s", "5s").type("Hello!")                                      │
│    kb.at("5s").hide()                                                      │
│    → KeyboardTrackEvent { kind: "APP", appId: "keyboard", type: "SHOW" }   │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ 2. V2 LOWERING (keyboardV2Lowering.lower)                                  │
│    TYPE event → expands to KEY_DOWN/KEY_UP pairs                           │
│    SHOW/HIDE → pass through with payload merged to root                    │
│    → RuntimeEvent { kind: "APP", appId: "keyboard", type: "KEY_DOWN" }     │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ 3. ENGINE → case "APP" → ReducerRegistry.getAppReducer("keyboard")         │
│    → keyboardReducer(draft, event)                                         │
│    - Updates device.keyboard.visible                                       │
│    - Updates device.keyboard.inputText                                     │
│    - Injects INPUT_CHANGE to foreground app                                │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ 4. RENDERER (TokovoRenderer)                                               │
│    {device.keyboard && <KeyboardSurface ... />}                            │
│    - Stays mounted for exit animations                                     │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ 5. KEYBOARD SURFACE → IOSKeyboard                                          │
│    - Animates slide in/out based on visibilityChangedAt                    │
│    - Highlights currentKey on key press                                    │
│    - Shows prediction bar from inputText                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Decoupling Contract

### ✅ Keyboard Does NOT:
- ❌ Import or depend on WhatsApp
- ❌ Know about any specific app's business logic
- ❌ Reference conversation IDs or message types

### ✅ Keyboard DOES:
- ✅ Manage its own state (`device.keyboard`)
- ✅ Inject `INPUT_CHANGE` to the foreground app via reducer
- ✅ Register via `ReducerRegistry.registerAppReducer("keyboard", ...)`
- ✅ Auto-register on import of `@tokovo/device-keyboard`

### ✅ Apps (WhatsApp, etc.) ONLY:
- ✅ Receive `INPUT_CHANGE` events with `{ text }` payload
- ✅ Use `device.keyboard.inputText` for display (read-only)
- ✅ Never mutate `device.keyboard` directly

---

## DSL Usage

### Basic Usage

```typescript
import { KeyboardTrackBuilder } from "@tokovo/device-keyboard";

episode("my-episode", { fps: 30, duration: "30s" })
    .device("phone", "iphone16", {
        app: "app_whatsapp",
        // ...
    })

    // Define a keyboard track
    .track("keyboard", () => new KeyboardTrackBuilder(30, "phone", getOrder), kb => {
        kb.at("3s").show();
        kb.span("3s", "5s").type("Hello!");
        kb.at("5s").hide();
    })

    .build();
```

### Available DSL Methods

#### Point Events (`.at(time)`)

| Method | Description |
|--------|-------------|
| `.show(opts?)` | Show keyboard with optional `{ layout, animated }` |
| `.hide(opts?)` | Hide keyboard with optional `{ animated }` |
| `.keyDown(key)` | Press a key |
| `.keyUp(key)` | Release a key |
| `.press(key)` | Alias for keyDown |
| `.backspace(count?)` | Delete characters |
| `.switchLayout(layout)` | Change to "qwerty", "numbers", "symbols", "emoji" |
| `.clear()` | Clear input text |
| `.setText(text)` | Set input text directly |
| `.moveCursor(position)` | Move cursor |
| `.selectRange(start, end)` | Select text range |
| `.acceptSuggestion(index)` | Accept autocomplete suggestion (0, 1, or 2) |
| `.paste(text)` | Paste text |

#### Span Events (`.span(start, end)`)

| Method | Description |
|--------|-------------|
| `.type(text, opts?)` | Type text over the duration with `{ speed, variation, mistakes, autocorrect }` |

---

## State Shape

The keyboard state lives at `world.devices[deviceId].keyboard`:

```typescript
interface KeyboardState {
    // Visibility
    visible: boolean;
    visibilityChangedAt: number;  // -1 = quiescent (never changed)

    // Layout
    layout: "qwerty" | "numbers" | "symbols" | "emoji";

    // Current Key Press
    currentKey: string | null;
    keyPressedAt: number | null;

    // Input Text (shared with apps)
    inputText: string;
    cursorPosition: number;
    cursorVisible: boolean;

    // Selection
    selectionStart: number | null;
    selectionEnd: number | null;

    // Autocomplete
    suggestions: string[];
    highlightedSuggestion: number | null;

    // Visual Feedback
    keyPressVisual: KeyPressVisual | null;
}
```

---

## Animation System

### Slide In/Out

The `IOSKeyboard` component uses Remotion's `interpolate` for smooth animations:

```typescript
// Quiescent state: no animation at frame 0
const transitionStart = keyboard.visibilityChangedAt ?? 0;
const slideProgress = transitionStart < 0
    ? (keyboard.visible ? 1 : 0)  // Instant state
    : interpolate(frame, [transitionStart, transitionStart + 18], ...);
```

**Key constants:**
- `SLIDE_DURATION_FRAMES = 18` (0.6s at 30fps)
- `EASING = [0.4, 0.0, 0.2, 1.0]` (Material ease-out)

### Key Press Highlights

When `currentKey` is set, the corresponding `IOSKey` renders in pressed state with a popup for letter keys.

---

## Cross-App Communication

The keyboard reducer automatically injects input changes to the foreground app:

```typescript
// In keyboardReducer:
function injectInputToApp(draft: WorldState, appId: string, text: string, at: number) {
    if (!appId) return;
    const reducer = ReducerRegistry.getAppReducer(appId);
    reducer?.(draft, {
        kind: "APP",
        type: "INPUT_CHANGE",
        appId,
        payload: { text },
        at
    });
}
```

Apps receive `INPUT_CHANGE` and update their draft state:

```typescript
// In whatsappReducer:
case "INPUT_CHANGE": {
    const text = event.payload?.text;
    conversation.draftText = text;
    break;
}
```

---

## File Reference

| File | Role |
|------|------|
| `device-keyboard/src/dsl/track-builder.ts` | DSL for keyboard track |
| `device-keyboard/src/lowering/handler.ts` | Expands TYPE to KEY_DOWN/UP |
| `device-keyboard/src/reducer.ts` | Processes events, updates state |
| `device-keyboard/src/views/KeyboardSurface.tsx` | Platform strategy dispatcher |
| `device-keyboard/src/views/ios/IOSKeyboard.tsx` | iOS keyboard renderer |
| `device-keyboard/src/plugin.ts` | Plugin contract definition |
| `device-keyboard/src/index.ts` | Auto-registration on import |

---

## Episode Configuration

To enable the keyboard in an episode, include `"keyboard"` in the apps config:

```typescript
defineEpisode({
    meta: { id: "my-episode", ... },
    config: {
        format: "1080x1920",
        durationInFrames: 900,
        apps: ["app_whatsapp", "keyboard"],  // Include keyboard
    },
    build: () => episode(...).track("keyboard", ...).build(),
});
```

---

## TL;DR

1. **Keyboard is fully decoupled** - no WhatsApp imports, no app-specific logic
2. **Use a keyboard track** - `kb.at("3s").show()`, `kb.span("3s", "5s").type("Hello!")`
3. **State lives at** `device.keyboard` - apps read `inputText` but never mutate
4. **Auto-registered on import** - just include `"keyboard"` in episode apps
5. **Animations are built-in** - slide in/out, key highlights work automatically
