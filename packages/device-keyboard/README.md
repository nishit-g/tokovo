# @tokovo/device-keyboard

> ⌨️ **Virtual Keyboard Plugin** - Enterprise-grade keyboard simulation for Tokovo

---

## Quick Start

```typescript
import { KeyboardTrackBuilder } from "@tokovo/device-keyboard";
import { episode } from "@tokovo/dsl";

let order = 0;
const getOrder = () => order++;

episode("demo", { fps: 30, duration: "30s" })
    .device("phone", "iphone16", { app: "app_whatsapp" })
    .track("keyboard",
        () => new KeyboardTrackBuilder(30, "phone", getOrder),
        kb => {
            kb.at("4s").show();
            kb.span("5s", "10s").type("Hello world!", { speed: "normal" });
            kb.at("12s").hide();
        }
    )
    .build();
```

---

## KeyboardTrackBuilder API

### Visibility

```typescript
kb.at("4s").show();                         // Show keyboard
kb.at("4s").show({ layout: "numbers" });    // Show with layout
kb.at("12s").hide();                        // Hide keyboard
```

### Typing

```typescript
// Type with speed control
kb.span("5s", "10s").type("Message", {
    speed: "normal",     // "fast" | "normal" | "slow" | number (cpm)
    variation: true,     // Random delays ±20%
});

// Individual keys
kb.at("5s").press("a");     // keyDown + keyUp
kb.at("6s").keyDown("b");
kb.at("6.1s").keyUp("b");
kb.at("7s").backspace(3);   // Delete 3 chars
```

### Input

```typescript
kb.at("5s").clear();                        // Clear input
kb.at("5s").setText("Hello");               // Set text directly
kb.at("5s").moveCursor(5);                  // Move cursor
kb.at("5s").selectRange(0, 5);              // Select text
kb.at("5s").paste("Pasted text");           // Paste
kb.at("5s").acceptSuggestion(1);            // Accept autocomplete
```

---

## Speed Presets

| Preset | CPM | Description |
|--------|-----|-------------|
| `instant` | ∞ | All at once |
| `fast` | 200 | 3.3 chars/sec |
| `normal` | 80 | 1.3 chars/sec (realistic) |
| `slow` | 40 | 0.67 chars/sec |
| `hunt_peck` | 20 | 0.33 chars/sec |

---

## Camera Integration

The keyboard automatically emits camera intents:

| Event | Camera Behavior |
|-------|-----------------|
| `KEYBOARD_SHOW` | Focus on keyboard |
| `KEYBOARD_HIDE` | Reset to neutral |
| `KEYBOARD_TYPE` | Focus on input field |
| `KEYBOARD_ACCEPT_SUGGESTION` | Focus on prediction bar |

---

## Architecture

```
src/
├── types/          # State, events, layouts
├── config/         # Theme, animation, speeds, layouts
├── ir/             # Payloads, track events
├── dsl/            # KeyboardTrackBuilder
├── runtime/        # Reducer, selectors, handlers
├── camera/         # Behaviors, anchors
├── views/          # KeyboardSurface, iOS components
├── lowering/       # TYPE → KEY_DOWN expansion
└── assets/         # Audio rules
```

---

## Exports

```typescript
// DSL
export { KeyboardTrackBuilder } from "@tokovo/device-keyboard";

// Views
export { KeyboardSurface, IOSKeyboard } from "@tokovo/device-keyboard";

// Selectors
export { 
    selectKeyboard,
    selectInputText,
    selectCursorPosition,
} from "@tokovo/device-keyboard";

// Camera
export { KeyboardBehavior, KeyboardAnchors } from "@tokovo/device-keyboard";
```
