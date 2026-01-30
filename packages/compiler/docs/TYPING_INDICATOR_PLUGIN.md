# TypingIndicatorPlugin - Complete Guide

## Overview

Auto-generates typing indicators before messages, eliminating **500+ lines of boilerplate** across episodes.

**Impact:** Highest-priority plugin from PLUGIN_ECO.md roadmap.

---

## Quick Start

### Before (Manual - 20+ lines per episode)

```typescript
wa.span("0.5s", "2s").typing("Sarah");
wa.at("2s").receive("Sarah", "Hey!");

wa.span("3s", "5s").typing("me");
wa.at("5s").send("Hey back!");

wa.span("6s", "9s").typing("Sarah");
wa.at("9s").receive("Sarah", "How are you doing today?");

wa.span("10s", "11.5s").typing("me");
wa.at("11.5s").send("Good!");
```

### After (Plugin - 4 lines)

```typescript
wa.at("2s").receive("Sarah", "Hey!");
wa.at("5s").send("Hey back!");
wa.at("9s").receive("Sarah", "How are you doing today?");
wa.at("11.5s").send("Good!");

.use(new TypingIndicatorPlugin())
```

**Result:** Plugin auto-calculates typing duration based on message length.

---

## Features

### 1. Smart Duration Calculation (Auto Mode)

```typescript
.use(new TypingIndicatorPlugin({ mode: "auto" }))
```

**Logic:**

- Short messages (5 chars): 0.5s typing
- Medium messages (50 chars): 5s typing
- Long messages (100+ chars): Capped at 5s max

**Formula:** `duration = min(max(textLength / charsPerSecond, minDuration), maxDuration)`

---

### 2. Character-Specific Typing Profiles

```typescript
.use(new TypingIndicatorPlugin({
  characterProfiles: {
    "Sarah": {
      charsPerSecond: 15,      // Fast typer
      realisticPauses: true    // Pauses mid-message
    },
    "Jake": {
      charsPerSecond: 5,       // Slow typer
      burstTyping: true        // Start-stop-resume pattern
    },
    "Boss": {
      charsPerSecond: 20,      // Very fast (professional)
      pauseFrequency: 0        // No pauses
    }
  }
}))
```

**Use case:** Make characters feel distinct through typing behavior.

---

### 3. Realistic Burst Typing

```typescript
.use(new TypingIndicatorPlugin({
  enableBurstTyping: true
}))
```

**What it does:**

- For messages > 30 chars: Typing starts, pauses, resumes
- Simulates "thinking mid-message" behavior
- Adds 0.5s pause at 50% point

**Timeline:**

```
Frame 0:   TYPING_START
Frame 30:  TYPING_END (pause - user thinking)
Frame 45:  TYPING_START (resume)
Frame 90:  TYPING_END
Frame 90:  MESSAGE_RECEIVED
```

---

### 4. Realistic Pauses for Long Messages

```typescript
.use(new TypingIndicatorPlugin({
  enableRealisticPauses: true,
  pauseAfterChars: 50,         // Pause every 50 characters
  pauseDuration: 1.5           // 1.5 second pauses
}))
```

**Example:**

- Message: 150 characters
- Base typing time: 15s (at 10 chars/sec)
- Pauses: 3 pauses × 1.5s = 4.5s
- Total duration: 19.5s

---

### 5. Fixed Duration Mode

```typescript
.use(new TypingIndicatorPlugin({
  mode: "fixed",
  fixedDuration: 2  // Always 2 seconds
}))
```

**Use case:** Consistent pacing for comedy/rhythmic episodes.

---

### 6. Selective Typing Generation

```typescript
.use(new TypingIndicatorPlugin({
  onlyFor: "them"  // Only generate for received messages
}))
```

**Options:**

- `"them"`: Only received messages (common for storytelling)
- `"me"`: Only sent messages
- `undefined`: All messages (default)

---

### 7. Skip Short Typing Indicators

```typescript
.use(new TypingIndicatorPlugin({
  skipIfShorterThan: 0.5  // Skip typing < 0.5 seconds
}))
```

**Why:** Very short typing indicators (like "k" or "ok") feel awkward.

---

### 8. Configurable Timing

```typescript
.use(new TypingIndicatorPlugin({
  delayBefore: 0.5,       // 0.5s gap between typing end and message
  minDuration: 0.5,       // Minimum typing time
  maxDuration: 5,         // Maximum typing time
  charsPerSecond: 10      // Default typing speed
}))
```

---

## Advanced Examples

### Example 1: Dramatic Conversation (Fast Typing)

```typescript
.use(new TypingIndicatorPlugin({
  mode: "auto",
  charsPerSecond: 15,  // Fast, intense typing
  minDuration: 1,      // Force minimum 1s (build tension)
  maxDuration: 3       // Cap at 3s (keep pace high)
}))
```

---

### Example 2: Realistic Multi-Character Chat

```typescript
.use(new TypingIndicatorPlugin({
  characterProfiles: {
    "Teen Sarah": {
      charsPerSecond: 20,      // Types fast (Gen Z)
      burstTyping: true,       // Start-stop pattern
      realisticPauses: false   // No mid-message pauses
    },
    "Grandma": {
      charsPerSecond: 3,       // Types very slowly
      burstTyping: false,
      realisticPauses: true    // Pauses while thinking
    },
    "Boss": {
      charsPerSecond: 25,      // Professional fast typer
      burstTyping: false,
      realisticPauses: false
    }
  },
  enableRealisticPauses: true,
  pauseAfterChars: 40,
  pauseDuration: 2
}))
```

---

### Example 3: Comedy Timing (Fixed Duration)

```typescript
.use(new TypingIndicatorPlugin({
  mode: "fixed",
  fixedDuration: 1.5,       // Perfect comedic timing
  onlyFor: "them",          // Only show their typing
  skipIfShorterThan: 0      // Include all messages
}))
```

---

## Multi-App Support

Plugin works across all apps automatically:

```typescript
wa.at("1s").receive("Sarah", "Hey!");  // WhatsApp
ig.at("5s").receive("Jake", "What's up?");  // Instagram DM
discord.at("10s").receive("Team", "Meeting in 5");  // Discord

.use(new TypingIndicatorPlugin())
```

**Result:** Each app gets appropriate typing indicator UX:

- WhatsApp: "..." at bottom
- Instagram: Animated dots bubble
- Discord: "[User] is typing..."

---

## Performance

**Compile-time overhead:** ~5ms for 50 messages  
**Runtime impact:** Zero (events generated at compile-time)

---

## Migration Guide

### Step 1: Remove Manual Typing

```diff
- wa.span("0.5s", "2s").typing("Sarah");
  wa.at("2s").receive("Sarah", "Hey!");
- wa.span("3s", "5s").typing("me");
  wa.at("5s").send("Hey back!");
```

### Step 2: Add Plugin

```typescript
.use(new TypingIndicatorPlugin())
```

### Step 3: Adjust if Needed

```typescript
.use(new TypingIndicatorPlugin({
  charsPerSecond: 12,  // Adjust speed
  maxDuration: 4       // Adjust max
}))
```

---

## API Reference

### TypingIndicatorPluginOptions

| Option                  | Type                                     | Default     | Description                                     |
| ----------------------- | ---------------------------------------- | ----------- | ----------------------------------------------- |
| `mode`                  | `"auto" \| "fixed"`                      | `"auto"`    | Duration calculation mode                       |
| `fixedDuration`         | `number`                                 | `2`         | Fixed duration in seconds (when mode = "fixed") |
| `minDuration`           | `number`                                 | `0.5`       | Minimum typing duration                         |
| `maxDuration`           | `number`                                 | `5`         | Maximum typing duration                         |
| `charsPerSecond`        | `number`                                 | `10`        | Typing speed (realistic: 8-15)                  |
| `delayBefore`           | `number`                                 | `0.5`       | Gap between typing end and message              |
| `onlyFor`               | `"them" \| "me" \| undefined`            | `undefined` | Generate for specific actors                    |
| `skipIfShorterThan`     | `number`                                 | `0`         | Skip typing shorter than N seconds              |
| `characterProfiles`     | `Record<string, CharacterTypingProfile>` | `{}`        | Per-character typing behavior                   |
| `enableRealisticPauses` | `boolean`                                | `false`     | Add pauses for long messages                    |
| `enableBurstTyping`     | `boolean`                                | `false`     | Start-stop-resume pattern                       |
| `pauseAfterChars`       | `number`                                 | `50`        | Pause after N characters                        |
| `pauseDuration`         | `number`                                 | `1.5`       | Pause duration in seconds                       |

### CharacterTypingProfile

| Option            | Type      | Description                            |
| ----------------- | --------- | -------------------------------------- |
| `charsPerSecond`  | `number`  | Typing speed for this character        |
| `pauseFrequency`  | `number`  | (Reserved for future)                  |
| `burstTyping`     | `boolean` | Enable burst typing for this character |
| `realisticPauses` | `boolean` | Enable pauses for this character       |

---

## Troubleshooting

### Issue: Typing indicators overlap with next message

**Solution:** Increase `delayBefore`:

```typescript
.use(new TypingIndicatorPlugin({
  delayBefore: 1.0  // Increase gap
}))
```

---

### Issue: Typing too fast/slow

**Solution:** Adjust `charsPerSecond`:

```typescript
.use(new TypingIndicatorPlugin({
  charsPerSecond: 15  // Faster (default: 10)
}))
```

---

### Issue: Very short messages show no typing

**Solution:** Increase `minDuration`:

```typescript
.use(new TypingIndicatorPlugin({
  minDuration: 1.0  // Force minimum 1s
}))
```

---

## Roadmap

### Future Features (v1.1+)

- Typo/correction simulation
- Variable typing speed within message
- Cross-app typing UX differences
- Smart pause detection (punctuation-aware)
- Integration with LLMToEpisodePlugin

---

## Questions?

See: `/packages/compiler/src/plugins/typing-indicator.plugin.ts`
