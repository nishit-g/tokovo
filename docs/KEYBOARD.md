# Keyboard System

> **Location**: `@tokovo/core` (types), `@tokovo/devices` (IOSKeyboard), `@tokovo/dsl` (events)

The Keyboard system provides production-quality virtual keyboard simulation with realistic typing humanization.

---

## Features

- **IOSKeyboard** - Pixel-perfect iOS keyboard UI
- **Key Pop-ups** - Animated key highlights when typing
- **Typing Humanizer** - Variable speed, typos, corrections
- **Multiple Layouts** - QWERTY, emoji, numeric

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       DSL Layer                             │
│   generateTyping(0, "phone", "Hello!", { speed: "casual" }) │
└──────────────────────────┬──────────────────────────────────┘
                           │ generates
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Timeline Events                          │
│  KEY_DOWN @ 0, TYPE_CHAR @ 3, KEY_UP @ 5, KEY_DOWN @ 8...   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Engine (replay)                        │
│         processKeyboardEvent() updates device.keyboard      │
│  { visible, currentKey: "H", inputText: "Hello", ... }      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      IOSKeyboard                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Q   W   E   R   T   Y   U   I   O   P             │   │
│  │    A   S   D   F   G  [H]  J   K   L               │   │
│  │  ⬆    Z   X   C   V   B   N   M    ⌫              │   │
│  │  123    🌐   ────────────────   return             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## KeyboardState Interface

```typescript
interface KeyboardState {
    visible: boolean;
    layout: "qwerty" | "emoji" | "numeric";
    currentKey: string | null;      // Currently pressed key
    keyPressedAt: number | null;    // Frame when key was pressed
    inputText: string;              // Text in input field
    cursorPosition: number;         // Cursor position in text
    cursorVisible: boolean;
}
```

---

## DSL Events

### Show/Hide Keyboard

```typescript
// Show keyboard
dsl.keyboard.show(0, "phone")
dsl.keyboard.show(0, "phone", "emoji")  // Emoji layout

// Hide keyboard
dsl.keyboard.hide(300, "phone")
```

### Typing Characters

```typescript
// Low-level: type individual characters
dsl.keyboard.typeChar(50, "phone", "H")
dsl.keyboard.typeChar(58, "phone", "e")
dsl.keyboard.typeChar(66, "phone", "l")
dsl.keyboard.typeChar(74, "phone", "l")
dsl.keyboard.typeChar(82, "phone", "o")

// Shows key highlight for each character
```

### Backspace

```typescript
// Delete one character
dsl.keyboard.backspace(100, "phone")

// Multiple backspaces (spacing matters for animation)
dsl.keyboard.backspace(100, "phone")
dsl.keyboard.backspace(103, "phone")
dsl.keyboard.backspace(106, "phone")
```

### Clear All

```typescript
// Clear entire input
dsl.keyboard.clear(200, "phone")
```

---

## Typing Simulation

The `generateTyping` function creates realistic typing sequences.

### Basic Usage

```typescript
import { generateTyping } from "@tokovo/dsl";

const events = generateTyping(0, "phone", "Hello world!");
// Generates ~50 events: KEY_DOWN, TYPE_CHAR, KEY_UP for each letter
```

### With Options

```typescript
const events = generateTyping(0, "phone", "Hello world!", {
    speed: "casual",           // Typing speed
    typoPositions: [5, 12],    // Where to make typos
});
```

### Typing Speeds

| Speed | Frames/Letter | Real Time | Use Case |
|-------|---------------|-----------|----------|
| `slow` | 12 | 400ms | Thoughtful typing |
| `normal` | 8 | 267ms | Standard |
| `casual` | 6 | 200ms | Comfortable |
| `fast` | 4 | 133ms | Quick response |
| `burst` | 2 | 67ms | Excited/urgent |

### Typo Simulation

```typescript
// Type "thinkng" then correct to "thinking"
const events = generateTyping(0, "phone", "I was thinkng about it", {
    typoPositions: [10],  // Typo at position 10
});

// Generates:
// 1. Type "I was think" (correct)
// 2. Type "n" (skip the 'i' - typo!)
// 3. Type "g about it"
// 4. User must manually add backspace events to "fix" the typo
```

---

## IOSKeyboard Component

Production-quality iOS keyboard with:

- **3x scale** for crisp rendering at 1080x1920
- **Key pop-ups** - Larger key preview when pressed
- **Row offsets** - Authentic QWERTY layout staggering
- **Special keys** - Shift, backspace, return, space, emoji, 123

### Props

```typescript
interface IOSKeyboardProps {
    layout?: "qwerty" | "emoji" | "numeric";
    currentKey?: string | null;     // Key to highlight
    onKeyPress?: (key: string) => void;
    inputText?: string;             // For input field display
    cursorVisible?: boolean;
}
```

### Rendering

```tsx
import { IOSKeyboard } from "@tokovo/devices";

<IOSKeyboard 
    layout="qwerty"
    currentKey={keyboard.currentKey}
    inputText={keyboard.inputText}
    cursorVisible={true}
/>
```

---

## Engine Processing

```typescript
function processKeyboardEvent(draft: WorldState, event: KeyboardEvent): void {
    const device = draft.devices[event.deviceId];
    
    if (!device.keyboard) {
        device.keyboard = {
            visible: false,
            layout: "qwerty",
            currentKey: null,
            keyPressedAt: null,
            inputText: "",
            cursorPosition: 0,
            cursorVisible: true,
        };
    }
    
    switch (event.type) {
        case "SHOW":
            device.keyboard.visible = true;
            device.keyboard.layout = event.layout || "qwerty";
            break;
            
        case "HIDE":
            device.keyboard.visible = false;
            device.keyboard.currentKey = null;
            break;
            
        case "KEY_DOWN":
            device.keyboard.currentKey = event.key;
            device.keyboard.keyPressedAt = event.at;
            break;
            
        case "KEY_UP":
            device.keyboard.currentKey = null;
            break;
            
        case "TYPE_CHAR":
            const pos = device.keyboard.cursorPosition;
            const text = device.keyboard.inputText;
            device.keyboard.inputText = 
                text.slice(0, pos) + event.char + text.slice(pos);
            device.keyboard.cursorPosition = pos + 1;
            device.keyboard.currentKey = event.char;
            break;
            
        case "BACKSPACE":
            if (device.keyboard.cursorPosition > 0) {
                const pos = device.keyboard.cursorPosition;
                const text = device.keyboard.inputText;
                device.keyboard.inputText = 
                    text.slice(0, pos - 1) + text.slice(pos);
                device.keyboard.cursorPosition = pos - 1;
            }
            device.keyboard.currentKey = "⌫";
            break;
            
        case "CLEAR":
            device.keyboard.inputText = "";
            device.keyboard.cursorPosition = 0;
            break;
    }
}
```

---

## Complete Example

```typescript
import { dsl, generateTyping } from "@tokovo/dsl";

const events = [
    // Show keyboard
    dsl.keyboard.show(0, "phone"),
    
    // Type a message with natural timing
    ...generateTyping(30, "phone", "Hey! How are you doing?", {
        speed: "casual",
    }),
    
    // Pause, realize typo, backspace
    dsl.keyboard.backspace(200, "phone"),
    dsl.keyboard.backspace(203, "phone"),
    dsl.keyboard.backspace(206, "phone"),
    
    // Retype correctly
    ...generateTyping(220, "phone", "you?", { speed: "fast" }),
    
    // Send message (clear input after)
    dsl.messages.send(300, "dm_friend", "Hey! How are you?"),
    dsl.keyboard.clear(305, "phone"),
    
    // Hide keyboard
    dsl.keyboard.hide(310, "phone"),
];
```

---

## File Locations

| Purpose | Location |
|---------|----------|
| Types | `packages/core/src/types.ts` - KeyboardState |
| Engine | `packages/core/src/engine.ts` - processKeyboardEvent() |
| DSL | `packages/dsl/src/events/keyboard.ts` - Event factories |
| Humanizer | `packages/dsl/src/events/typing.ts` - generateTyping() |
| Component | `packages/devices/src/keyboards/IOSKeyboard.tsx` - UI |

---

## Tips

1. **Always clear after send** - Use `dsl.keyboard.clear()` after sending a message
2. **Hide when done** - Use `dsl.keyboard.hide()` when user is done typing
3. **Match speed to emotion** - Use `fast` for excited, `slow` for thoughtful
4. **Add backspaces for typos** - Manually add typos then corrections for realism
