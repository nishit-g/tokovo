# Keyboard System Guide

> **Realistic typing simulation for messaging apps.**

---

## Overview

The keyboard system simulates realistic typing:

- **Show/Hide** - Keyboard visibility
- **Key Presses** - Individual key animations
- **Typing** - Character-by-character input
- **Automatic** - Typing before send

---

## Keyboard Events

### SHOW

```typescript
{ at: 60, kind: "KEYBOARD", type: "SHOW", deviceId: "phone", payload: { layout: "qwerty" } }
```

### HIDE

```typescript
{ at: 120, kind: "KEYBOARD", type: "HIDE", deviceId: "phone" }
```

### KEY_DOWN / KEY_UP

```typescript
{ at: 65, kind: "KEYBOARD", type: "KEY_DOWN", deviceId: "phone", payload: { key: "H" } }
{ at: 68, kind: "KEYBOARD", type: "KEY_UP", deviceId: "phone" }
```

### TYPE_CHAR

```typescript
{ at: 70, kind: "KEYBOARD", type: "TYPE_CHAR", deviceId: "phone", payload: { char: "e" } }
```

---

## DSL Helpers

### keyboard Helper

```typescript
import { keyboard } from "@tokovo/dsl";

// Generate typing events for a message
const typingEvents = keyboard.type("Hello!", {
    fps: 30,
    startFrame: 60,
    speed: "normal"
});

// Returns array of KEY_DOWN, KEY_UP, TYPE_CHAR events
```

### Typing Speeds

| Speed | Characters/Second | Use Case |
|-------|-------------------|----------|
| `slow` | 5 | Nervous, thinking |
| `normal` | 10 | Normal typing |
| `fast` | 15 | Excited, urgent |
| `instant` | ∞ | No animation |

---

## Integration with WhatsApp

The WhatsApp TrackBuilder handles typing automatically:

```typescript
.track("app_whatsapp",
    () => new WhatsAppTrackBuilder(30, "phone", "dm_alex", getOrder),
    wa => {
        // Automatic typing before send
        wa.span("4s", "6s").typing("me");  // Show typing indicator
        wa.at("6s").send("Hello!");        // Message appears at 6s
    }
)
```

### Explicit Typing

Show typing indicator for contact:

```typescript
wa.span("2s", "4s").typing("Alex");  // Alex is typing...
wa.at("4s").receive("Alex", "Hey!");
```

---

## Keyboard State

In WorldState:

```typescript
world.keyboard = {
    isVisible: true,
    height: 336,  // pixels
    layout: "qwerty",
    activeKey: "H"
};

// Or per-device
world.devices["phone"].keyboard = {...};
```

---

## Keyboard Layouts

| Layout | Description |
|--------|-------------|
| `qwerty` | Standard keyboard |
| `numeric` | Number pad |
| `emoji` | Emoji picker |

---

## Timing Calculation

The compiler calculates realistic typing speed:

```typescript
const CHARS_PER_SECOND = 10;  // Normal speed
const typingDuration = text.length / CHARS_PER_SECOND;
// "Hello!" = 6 chars / 10 = 0.6 seconds
```

### Mood Modifiers

| Mood | Speed Multiplier |
|------|------------------|
| `calm` | 1.0x |
| `excited` | 1.5x |
| `angry` | 2.0x |
| `nervous` | 0.7x |

---

## Automatic Typing

When `send()` is called, the system can automatically:

1. Show keyboard (if hidden)
2. Type message character by character
3. Trigger send action
4. Hide keyboard (optional)

```typescript
// This DSL (when auto-typing is enabled)
wa.at("5s").send("Hello!");

// Compiles approximately to:
[
    { at: 150, kind: "KEYBOARD", type: "SHOW" },
    { at: 153, kind: "KEYBOARD", type: "KEY_DOWN", payload: { key: "H" } },
    { at: 156, kind: "KEYBOARD", type: "KEY_UP" },
    // ... more key events
    { at: 170, kind: "APP", type: "WHATSAPP_MESSAGE", payload: { text: "Hello!" } }
]
```

---

## Manual Keyboard Control (Future)

```typescript
// Potential future API
.keyboard(kb => {
    kb.at("5s").show();
    kb.at("5.5s").type("Hello");
    kb.at("7s").backspace(2);  // Delete "lo"
    kb.at("7.5s").type("p!");  // "Help!"
    kb.at("8s").hide();
});
```

---

## Audio Integration

Keyboard events can trigger sounds:

```typescript
// In plugin audioRules
{
    match: { kind: "KEYBOARD", type: "KEY_DOWN" },
    sound: "key_tap",
    volume: 0.3,
    bus: "ui"
}
```
