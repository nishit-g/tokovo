# @tokovo/device-keyboard

iOS-style keyboard plugin for Tokovo video rendering. Provides pixel-perfect iOS 17 keyboard with support for multiple layouts, themes, and keyboard-aware UI components.

## Installation

```bash
pnpm add @tokovo/device-keyboard
```

## Quick Start

### 1. Register the Plugin

```tsx
import { registerKeyboardPlugin } from "@tokovo/device-keyboard";

// Call once at app initialization
registerKeyboardPlugin();
```

### 2. Use in Episodes (DSL)

```typescript
import { KeyboardTrackBuilder } from "@tokovo/device-keyboard";

episode.track("keyboard", () =>
  new KeyboardTrackBuilder("main_phone")
    .show({ at: 30 })
    .type("Hello world", { at: 60, charDelay: 3 })
    .hide({ at: 120 }),
);
```

### 3. Keyboard-Aware UI (Apps)

```tsx
import { KeyboardAwareView, ScrollableContent } from "@tokovo/react";

const ChatScreen = () => (
  <KeyboardAwareView>
    <Header />
    <ScrollableContent>
      <MessageList />
    </ScrollableContent>
    <InputBar />
  </KeyboardAwareView>
);
```

## Features

### Layouts (Strategy Pattern)

```tsx
import {
  getLayout,
  qwertyLayout,
  numericLayout,
  phoneLayout,
  emailLayout,
} from "@tokovo/device-keyboard";

// Use predefined layouts
<Keyboard layout={numericLayout} />;

// Or get by keyboard type
const layout = getLayout("phone"); // Returns phoneLayout
```

| Layout          | Keys                      | Use Case           |
| --------------- | ------------------------- | ------------------ |
| `qwertyLayout`  | Full QWERTY + suggestions | Default text input |
| `numericLayout` | 0-9, backspace            | Number-only fields |
| `phoneLayout`   | 0-9, +, backspace         | Phone number input |
| `emailLayout`   | QWERTY + @, . shortcuts   | Email input        |

### Themes (Dark Mode Support)

```tsx
import {
  getKeyboardColors,
  createKeyboardTokens,
} from "@tokovo/device-keyboard";

// Get colors for a theme
const darkColors = getKeyboardColors("dark");

// Or create full token set
const darkTokens = createKeyboardTokens("dark");

// Use in component
<Keyboard theme="dark" />;
```

### Design Tokens

All visual properties are tokenized for consistency:

```tsx
import {
  keyboardColors, // Colors (background, keys, text)
  keyboardTypography, // Font sizes, weights, family
  keyboardSpacing, // Heights, widths, gaps, padding
  keyboardShadows, // Box shadows (scale-aware)
} from "@tokovo/device-keyboard";

// Example: Get keyboard height at scale
const height = keyboardSpacing.height * 3.2; // 291 * 3.2 = 931.2px
```

## DSL API Reference

### KeyboardTrackBuilder

```typescript
new KeyboardTrackBuilder(deviceId: string)
  .show(options)           // Show keyboard
  .hide(options)           // Hide keyboard
  .type(text, options)     // Type text with key highlights
  .keyPress(key, options)  // Press single key
  .clear(options)          // Clear input text
  .suggest(suggestions)    // Set suggestion bar
  .tapSuggestion(index)    // Tap a suggestion
  .pressReturn(options)    // Press return/send key
```

### Options

```typescript
// show()
{ at: number, keyboardType?: "default" | "numeric" | "email" | "phone", returnKeyType?: "return" | "send" | "done" }

// type()
{ at: number, charDelay?: number } // charDelay = frames between keys

// keyPress()
{ at: number, duration?: number } // duration = frames key stays highlighted
```

## React Hooks & Components

From `@tokovo/react`:

### Hooks

```tsx
// Get keyboard height (0 when hidden)
const height = useKeyboardHeight();

// Get container style that adjusts for keyboard
const { containerStyle, isKeyboardVisible } = useKeyboardAwareContainer();

// Get keyboard state
const { inputText, cursorPosition, isKeyboardVisible } = useKeyboardState();
```

### Components

```tsx
// Auto-adjusting container
<KeyboardAwareView>
  {children}
</KeyboardAwareView>

// Auto-scrolling content area
<ScrollableContent>
  {children}
</ScrollableContent>
```

## Architecture

```
@tokovo/device-keyboard
├── runtime/
│   ├── state.ts       # KeyboardState type (from @tokovo/core)
│   ├── reducer.ts     # Handles KEYBOARD_* events
│   └── selectors.ts   # State queries (isKeyActive, etc.)
├── dsl/
│   └── keyboard-builder.ts  # Fluent DSL for episodes
├── ui/
│   ├── tokens.ts      # Design tokens (colors, spacing, typography)
│   ├── layouts.ts     # Layout strategies (qwerty, numeric, etc.)
│   ├── Keyboard.tsx   # Main keyboard component
│   ├── Key.tsx        # Individual key with popup
│   └── KeyRow.tsx     # Row of keys
└── plugin.ts          # Plugin registration
```

## State Shape

```typescript
interface KeyboardState {
  visible: boolean;
  showFrame: number | null;
  hideFrame: number | null;
  inputText: string;
  cursorPosition: number;
  activeKeyPresses: KeyPressState[]; // Token pattern
  keyboardType: "default" | "numeric" | "email" | "phone" | "url";
  returnKeyType: "return" | "send" | "done" | "go" | "next" | "search";
  suggestions: string[];
  activeSuggestionIndex: number | null;
}

interface KeyPressState {
  key: string;
  startFrame: number;
  duration: number;
}
```

## Extending

### Custom Layout

```typescript
import { KeyboardLayout, keyboardSpacing } from "@tokovo/device-keyboard";

const emojiLayout: KeyboardLayout = {
  id: "emoji",
  rows: [
    ["😀", "😂", "🥹", "😍", "🤔", "😎", "🥺", "😭"],
    ["👍", "❤️", "🔥", "✨", "🎉", "💀", "🙏", "👀"],
  ],
  specialKeys: {
    backspace: {
      width: keyboardSpacing.key.backspaceWidth,
      variant: "special",
      label: "⌫",
    },
  },
  bottomRow: {
    showNumberMode: false,
    showGlobe: true,
    showSpace: false,
    showReturn: false,
  },
};
```

### Custom Theme

```typescript
import { KeyboardColorTokens } from "@tokovo/device-keyboard";

const customTheme: KeyboardColorTokens = {
  background: "#1a1a2e",
  key: {
    default: "#16213e",
    defaultGradient: "linear-gradient(180deg, #16213e 0%, #0f3460 100%)",
    special: "#0f3460",
    return: "#e94560",
    space: "#16213e",
    active: "#e94560",
  },
  text: {
    primary: "#eaeaea",
    onReturn: "#ffffff",
  },
  // ... rest of tokens
};
```
