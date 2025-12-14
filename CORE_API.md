# Tokovo Core API Specification

> **This document defines what IS and what IS NOT the public API.**
> Violating these boundaries will break determinism and multi-app correctness.

---

## The Single Engine Entry Point

```ts
import { createEngine } from "@tokovo/core";

const engine = createEngine({
  plugins: myPluginRegistry,
  fps: 30,
  validation: "strict",
});

const world = engine.buildWorld(initialWorld, events, frame);
```

### BANNED

```ts
// ❌ NEVER use these
import { replay } from "@tokovo/core";           // DELETED
import { ReducerRegistry } from "@tokovo/core";  // DELETED
import { PluginManager } from "@tokovo/core";    // DELETED
```

---

## Plugin Contract

Every app MUST export a single `TokovoAppPlugin`:

```ts
// packages/apps-whatsapp/src/index.ts
import { defineAppPlugin } from "@tokovo/core";

export const WhatsAppPlugin = defineAppPlugin({
  id: "app_whatsapp",
  name: "WhatsApp",
  version: "1.0.0",
  capabilities: ["messaging", "typing", "read_receipts", "reactions"],
  schema: WHATSAPP_SCHEMA,
  reducer: whatsappReducer,
  view: WhatsAppUI,
  adapters: {
    chat: whatsappChatAdapter,
  },
});
```

### BANNED

```ts
// ❌ NEVER do module-level registration
ReducerRegistry.registerAppReducer("app_whatsapp", whatsappReducer);
```

---

## Adapter Contract

Layout strategies MUST use adapters, not raw state access.

### FeedAdapter

```ts
interface FeedAdapter {
  getItems(world: WorldState, appId: string): FeedItem[];
  getAuthor(world: WorldState, authorId: string): FeedItemAuthor;
}

// In layout:
const items = plugin.adapters.feed.getItems(world, activeAppId);
```

### ChatAdapter

```ts
interface ChatAdapter {
  getMessages(world: WorldState, conversationId: string): CanonicalMessage[];
  getTypingIndicators(world: WorldState, conversationId: string): string[];
}
```

### BANNED

```ts
// ❌ NEVER access app state directly in layouts
const posts = world.appState[appId]?.feed?.posts || [];
const messages = world.conversations[convId]?.messages || [];
```

---

## Event Typing Rules

### Rule 1: All events use discriminated unions

```ts
// ✅ CORRECT - type field discriminates
if (event.type === "MESSAGE") {
  // TypeScript knows: event has conversationId, fromId, content
}
```

### Rule 2: CUSTOM events use payload only

```ts
// ✅ CORRECT
{
  kind: "APP",
  type: "CUSTOM",
  appId: "app_whatsapp",
  name: "app_whatsapp.SCREENSHOT_ALERT",
  payload: { contactId: "..." }
}
```

### BANNED

```ts
// ❌ NEVER cast events
const e = event as any;
if (e.customField) { ... }

// ❌ NEVER add loose fields to events
{
  type: "MESSAGE_RECEIVED",
  customThing: true,  // WRONG: not in schema
}
```

---

## State Access Rules

### Rule 1: Use selectors, not raw access

```ts
// ✅ CORRECT
import { getActiveConversation } from "@tokovo/core";
const convo = getActiveConversation(world, deviceId);
```

### BANNED

```ts
// ❌ NEVER fish through state manually
const convoId = world.appState.app_whatsapp?.activeConversationId;
const convo = world.conversations[convoId];
```

---

## Directory Structure (Post-Cleanup)

```
packages/core/src/
├── index.ts              # Public exports only
├── types.ts              # WorldState, DeviceState, etc.
├── constants.ts          # TIMING, FPS, etc.
├── canonical/            # THE engine (sole source of truth)
│   ├── engine.ts         # createEngine()
│   ├── plugin-registry.ts
│   ├── routing.ts
│   ├── ordering.ts
│   ├── hash.ts
│   ├── identity.ts
│   ├── events.ts
│   ├── content.ts
│   ├── state.ts
│   ├── adapters/         # View-kind adapters
│   │   ├── chat.ts
│   │   ├── feed.ts
│   │   └── story.ts
│   └── index.ts
├── camera/               # Camera effects
├── audio/                # Audio mixing
└── legacy/               # TO BE DELETED (currently exists for migration)
    ├── engine.ts         # Old replay()
    └── plugin.ts         # Old PluginManager
```

---

## What Core Owns vs What Apps Own

### Core Owns
- IR / Timeline / Ordering / Deterministic replay
- Device OS primitives (lock/unlock/open app)
- Plugin interfaces + routing + registries
- WorldState shape and validation
- Adapter interface definitions

### Apps Own
- Runtime reducers for their app state
- UI components
- Adapter implementations (getFeedItems, getMessages)
- Schema definitions (what events/content they support)
- App-specific sounds, icons, themes

---

## Enforcement

These rules are enforced by:

1. **TypeScript** - Strict mode, no `as any`
2. **Compiler validation** - Schema checks at build time
3. **CI checks** - Lint for banned patterns
4. **Code review** - Violations are blocking

### Grep patterns for CI

```bash
# Should return 0 results after cleanup
grep -r "ReducerRegistry" packages/ --include="*.ts" --include="*.tsx"
grep -r "replay(" packages/ --include="*.ts" --include="*.tsx"
grep -r "as any" packages/apps-*/src/*.ts
grep -r "appState\[" packages/renderer/
```
