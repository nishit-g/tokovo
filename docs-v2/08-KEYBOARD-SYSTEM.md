# Keyboard System

> Realistic typing simulation

---

## Overview

The keyboard system simulates realistic typing:

- Show/hide keyboard
- Key presses with animation
- Character typing
- Text composition

---

## Keyboard Events

### SHOW

```typescript
{
    at: 60,
    kind: "KEYBOARD",
    type: "SHOW",
    deviceId: "phone",
    payload: {
        layout: "qwerty"
    }
}
```

### HIDE

```typescript
{
    at: 120,
    kind: "KEYBOARD",
    type: "HIDE",
    deviceId: "phone"
}
```

### KEY_DOWN / KEY_UP

```typescript
{
    at: 65,
    kind: "KEYBOARD",
    type: "KEY_DOWN",
    deviceId: "phone",
    payload: {
        key: "H"
    }
}

{
    at: 68,
    kind: "KEYBOARD",
    type: "KEY_UP",
    deviceId: "phone"
}
```

### TYPE_CHAR

```typescript
{
    at: 70,
    kind: "KEYBOARD",
    type: "TYPE_CHAR",
    deviceId: "phone",
    payload: {
        char: "e"
    }
}
```

### SET_TEXT

```typescript
{
    at: 90,
    kind: "KEYBOARD",
    type: "SET_TEXT",
    deviceId: "phone",
    payload: {
        text: "Hello!"
    }
}
```

---

## DSL Usage

The DSL provides natural typing simulation:

```typescript
d.beat("typing", b => {
    // Show keyboard before sending
    b.showKeyboard();
    
    // Typing happens automatically before send
    b.send("Hello there!");
    
    // Hide keyboard after
    b.hideKeyboard();
});
```

### Explicit Typing

```typescript
d.beat("manual-typing", b => {
    b.keyboard(k => {
        k.show();
        k.type("Hello");
        k.backspace(2);  // Delete last 2 chars
        k.type("y!");
        k.submit();
    });
});
```

---

## V2 Keyboard Ops

The V2 IR includes keyboard operations:

```typescript
// KeyboardType - complete text entry
{
    at: 60,
    kind: "KeyboardType",
    deviceId: "phone",
    text: "Hello world!"
}

// KeyboardInput - individual keys
{
    at: 65,
    kind: "KeyboardInput",
    deviceId: "phone",
    type: "keyDown",
    key: "h"
}
```

---

## Keyboard State

In WorldState:

```typescript
interface KeyboardState {
    visible: boolean;
    layout: "qwerty" | "numeric" | "emoji";
    activeKey?: string;
    currentText: string;
}

// Access via
world.devices["phone"].keyboard
```

---

## Timing Calculation

The compiler calculates realistic typing speed:

```typescript
// ~100ms per character at normal speed
const CHARS_PER_SECOND = 10;
const typingDuration = text.length / CHARS_PER_SECOND;
```

### Factors

| Mood | Speed Multiplier |
|------|------------------|
| `calm` | 1.0x |
| `excited` | 1.5x |
| `angry` | 2.0x |
| `nervous` | 0.7x |

---

## Keyboard Layouts

| Layout | Description |
|--------|-------------|
| `qwerty` | Standard keyboard |
| `numeric` | Number pad |
| `emoji` | Emoji picker |

```typescript
b.showKeyboard({ layout: "emoji" });
```

---

## Integration with Messaging

When `b.send()` is called, the compiler automatically:

1. Shows keyboard (if hidden)
2. Types the message character by character
3. Triggers send action
4. Hides keyboard (optional)

```typescript
// This DSL
b.send("Hello!");

// Compiles to these events:
[
    { at: 0, kind: "KEYBOARD", type: "SHOW" },
    { at: 3, kind: "KEYBOARD", type: "KEY_DOWN", payload: { key: "H" } },
    { at: 6, kind: "KEYBOARD", type: "KEY_UP" },
    { at: 9, kind: "KEYBOARD", type: "KEY_DOWN", payload: { key: "e" } },
    // ... more key events
    { at: 60, kind: "APP", type: "MESSAGE_SENT", payload: { text: "Hello!" } }
]
```
