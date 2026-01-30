# Universal Screen-Flow Architecture

**Status:** Architecture Proposal  
**Version:** 1.0  
**Date:** January 30, 2026

---

## Executive Summary

The Screen-Flow Architecture is a fundamental redesign of Tokovo's episode authoring system, moving from **imperative event-based DSL** to **declarative screen-based state management**. This enables:

- ✅ **Universal app support** - One model for WhatsApp, Instagram, Discord, Slack, Email, 100+ apps
- ✅ **Initial state** - Chat history, messages on screen before episode starts
- ✅ **Token-driven rendering** - Automatic platform/app-specific styling
- ✅ **AI-friendly** - LLM generates pure JSON screens
- ✅ **Best-in-class DX** - Minimal boilerplate, declarative, type-safe
- ✅ **Enterprise-scalable** - Maintainable for years, extensible architecture

---

## Table of Contents

1. [Current Architecture Problems](#current-architecture-problems)
2. [Core Concepts](#core-concepts)
3. [Screen-Flow Architecture](#screen-flow-architecture)
4. [Permutations & Combinations](#permutations--combinations)
5. [Token Integration](#token-integration)
6. [DSL Design](#dsl-design)
7. [JSON Schema](#json-schema)
8. [Compilation Pipeline](#compilation-pipeline)
9. [Migration Path](#migration-path)
10. [Examples](#examples)
11. [Implementation Roadmap](#implementation-roadmap)

---

## Current Architecture Problems

### **Problem 1: No Initial State**

**Limitation:** Episodes can only show messages that arrive DURING the episode. Cannot show chat history (messages already on screen).

**Current workaround:** None. Impossible to render.

**Use cases blocked:**

- Opening chat with 50 messages already visible
- Group chat with previous conversation context
- Instagram DM with chat history
- Email thread with previous emails

**Example of what's IMPOSSIBLE today:**

```typescript
// Want: Chat with Alex showing 2 hours of previous messages
wa.at("0s").switchTo("dm_alex"); // Opens chat
// Problem: Chat is empty! Can't pre-populate messages
```

---

### **Problem 2: Event-Based DSL is Imperative**

**Current approach:**

```typescript
wa.at("3s").receive("Alex", "Hey...");
wa.at("4s").receive("Alex", "We need to talk.");
wa.at("6.5s").send("What's going on?");
```

**Problems:**

- 🔴 Can't easily reason about state at any point in time
- 🔴 Hard to debug (what's the state at frame 120?)
- 🔴 Can't export state snapshots
- 🔴 Time travel rendering is complex
- 🔴 AI can't easily generate imperative TypeScript code

---

### **Problem 3: App-Specific DSLs Don't Scale**

**Current:**

- WhatsAppTrackBuilder (500+ LOC)
- InstagramTrackBuilder (would be another 500+ LOC)
- DiscordTrackBuilder (another 500+ LOC)
- SlackTrackBuilder (another 500+ LOC)

**Problem:** 100 apps = 50,000 lines of DSL code

**Each new app requires:**

1. Custom DSL builder class
2. Custom event types
3. Custom handlers
4. Custom lowering logic
5. Custom renderer

---

### **Problem 4: Multi-Screen Navigation is Manual**

**Current:**

```typescript
wa.openChatList("0s");
wa.at("2s").switchTo("dm_alex");
wa.at("15s").goBack();
wa.at("18s").switchTo("dm_sarah");
```

**Problems:**

- 🔴 Navigation is imperative (hard to reason about flow)
- 🔴 Can't visualize screen sequence
- 🔴 Screen transitions buried in timeline
- 🔴 No way to say "this episode has 4 screens"

---

### **Problem 5: Tokens Unused**

**Tokens exist:**

```typescript
iOSTokens = { colors: {...}, typography: {...}, spacing: {...} }
androidTokens = { colors: {...}, typography: {...}, spacing: {...} }
appConfigs = {
  whatsapp: { ios: {...}, android: {...} },
  instagram: { ios: {...}, android: {...} }
}
```

**But episodes ignore them:**

```typescript
// Episodes define implementation details
wa.at("3s").receive("Alex", "Hey...");

// Should define INTENT, tokens provide IMPLEMENTATION
```

**Problem:** Episodes hardcode platform-specific behavior instead of declaring intent and letting tokens handle styling.

---

### **Problem 6: Multi-App Coordination**

**Scenario:** Receive WhatsApp notification while in Instagram

**Current approach:**

```typescript
ig.at("5s").scrollFeed();
wa.at("7s").receive("Alex", "Hey!"); // Notification appears
```

**Problem:** Two separate track builders. No clean coordination model.

---

### **Problem 7: No State Inspection**

**Want:** Export state at frame 180 for debugging

**Current:** Impossible. State is internal to reducers, not exposed.

**Need:** `getStateAtFrame(180) → { whatsapp: {...}, instagram: {...}, device: {...} }`

---

## Core Concepts

### **1. Screen = State Snapshot + Timeline**

A **Screen** is:

- Which app (WhatsApp, Instagram, Discord)
- Which screen type (chat, feed, profile)
- Initial state when screen opens
- Timeline of changes during screen
- Time range (from/to)

```typescript
interface Screen {
  app: string; // "whatsapp" | "instagram" | "discord"
  type: string; // "chat" | "chat_list" | "feed" | "dm"
  from: Timestamp; // "0s"
  to: Timestamp; // "15s"
  initialState: AppState; // State when screen opens
  timeline: Action[]; // Changes during screen
  tokens: TokenResolution; // "auto" | custom
}
```

---

### **2. Episode = Screen Sequence**

An **Episode** is a sequence of screens:

```
Episode:
  Screen 1: WhatsApp Chat List (0s - 2s)
  Screen 2: WhatsApp Chat (2s - 15s)
  Screen 3: WhatsApp Chat List (15s - 20s)
  Screen 4: Instagram Feed (20s - 30s)
```

Each screen transition = explicit navigation.

---

### **3. State = Pure Data**

State is declarative JSON:

```json
{
  "conversationId": "dm_alex",
  "messages": [
    { "id": "1", "from": "alex", "text": "Can't wait!", "timestamp": -7200 },
    { "id": "2", "from": "me", "text": "Me too!", "timestamp": -3600 }
  ],
  "unreadCount": 0,
  "typing": null
}
```

**NOT:**

```typescript
wa.at("0s").receive("Alex", "Can't wait!"); // Imperative
```

---

### **4. Actions = State Transformations**

Actions modify state during a screen:

```json
{
  "at": "3s",
  "action": "message.receive",
  "from": "alex",
  "text": "Hey..."
}
```

Applies to current screen's state:

```typescript
state = reducer(state, action);
```

---

### **5. Tokens = Implementation Details**

Screens declare **INTENT**, tokens provide **IMPLEMENTATION**:

```typescript
// Screen (intent)
{
  app: "whatsapp",
  type: "chat",
  tokens: "auto"  // Auto-resolve to whatsappConfigs.ios
}

// Renderer applies tokens
const tokens = resolveTokens("whatsapp", "ios");
// → whatsappConfigs.ios { colors, typography, spacing }
```

---

## Screen-Flow Architecture

### **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                        EPISODE (DSL)                        │
│  .screen("whatsapp", "chat", { state, timeline })           │
│  .screen("instagram", "feed", { state, timeline })          │
└─────────────────────────────────────────────────────────────┘
                            ↓
                     Compile to JSON
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SCREEN[] (JSON Schema)                   │
│  [                                                          │
│    { app: "whatsapp", type: "chat", state: {...}, ... },   │
│    { app: "instagram", type: "feed", state: {...}, ... }   │
│  ]                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   Screen Compiler
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    EVENTS (Current System)                  │
│  [                                                          │
│    { type: "APP_SWITCH", appId: "whatsapp", at: 0 },      │
│    { type: "MESSAGE_RECEIVED", text: "Hey", at: 90 }      │
│  ]                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   Event Processors
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    WORLD STATE (Frame-based)                │
│  Frame 0:   { whatsapp: { messages: [...] }, ... }         │
│  Frame 90:  { whatsapp: { messages: [...+1] }, ... }       │
│  Frame 180: { whatsapp: { messages: [...+2] }, ... }       │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   Renderer (Token-aware)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    REACT COMPONENTS (Pixels)                │
│  <WhatsAppChatScreen state={...} tokens={...} />           │
└─────────────────────────────────────────────────────────────┘
```

---

### **Key Components**

#### **1. Screen Compiler**

```typescript
function compileScreen(screen: Screen): Event[] {
  const events: Event[] = [];

  // Switch to app
  events.push({
    at: screen.from,
    type: "APP_SWITCH",
    appId: screen.app,
  });

  // Apply initial state
  events.push({
    at: screen.from,
    type: "STATE_INIT",
    appId: screen.app,
    state: screen.initialState,
  });

  // Apply timeline actions
  for (const action of screen.timeline) {
    events.push(compileAction(screen, action));
  }

  return events;
}
```

#### **2. Token Resolver**

```typescript
function resolveTokens(app: string, platform: string): Tokens {
  if (platform === "ios") {
    return { ...iOSTokens, ...appConfigs[app].ios };
  } else {
    return { ...androidTokens, ...appConfigs[app].android };
  }
}
```

#### **3. State Reducer**

```typescript
function reducer(state: AppState, action: Action): AppState {
  switch (action.action) {
    case "message.receive":
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: generateId(),
            from: action.from,
            text: action.text,
            timestamp: action.at,
          },
        ],
      };

    case "message.send":
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: generateId(),
            from: "me",
            text: action.text,
            timestamp: action.at,
          },
        ],
      };

    // ... other actions
  }
}
```

---

## Permutations & Combinations

### **1. Single-Screen Episodes**

**Use case:** Simple chat conversation

```typescript
.screen("whatsapp", "chat", {
  from: "0s",
  to: "30s",
  state: {
    conversationId: "dm_alex",
    messages: []
  },
  timeline: [
    { at: "3s", action: "message.receive", from: "alex", text: "Hey" }
  ]
})
```

---

### **2. Multi-Screen Episodes (Same App)**

**Use case:** Chat list → Chat → Profile → Back

```typescript
.screen("whatsapp", "chat_list", { from: "0s", to: "2s", ... })
.screen("whatsapp", "chat", { from: "2s", to: "15s", ... })
.screen("whatsapp", "profile", { from: "15s", to: "20s", ... })
.screen("whatsapp", "chat", { from: "20s", to: "30s", ... })
```

---

### **3. Multi-App Episodes**

**Use case:** WhatsApp → Instagram → WhatsApp

```typescript
.screen("whatsapp", "chat", { from: "0s", to: "10s", ... })
.screen("instagram", "feed", { from: "10s", to: "20s", ... })
.screen("whatsapp", "chat", { from: "20s", to: "30s", ... })
```

---

### **4. Initial State (Messages Already Visible)**

**Use case:** Open chat with previous conversation history

```typescript
.screen("whatsapp", "chat", {
  from: "0s",
  to: "30s",
  state: {
    conversationId: "dm_alex",

    // These messages exist BEFORE episode starts
    messages: [
      { id: "1", from: "alex", text: "Can't wait!", timestamp: "-2h", read: true },
      { id: "2", from: "me", text: "Me too!", timestamp: "-1h", read: true },
      { id: "3", from: "alex", text: "On my way!", timestamp: "-30m", read: true }
    ]
  },
  timeline: [
    // New messages arrive during episode
    { at: "3s", action: "message.receive", from: "alex", text: "I'm here!" }
  ]
})
```

---

### **5. Background App State**

**Use case:** Receive WhatsApp notification while in Instagram

```typescript
.screen("instagram", "feed", {
  from: "0s",
  to: "10s",
  timeline: [
    { at: "5s", action: "scroll", to: 500 }
  ]
})
// During Instagram screen, WhatsApp receives message (generates notification)
.backgroundAction("whatsapp", {
  at: "7s",
  action: "message.receive",
  from: "alex",
  text: "Hey!"
})
```

---

### **6. Complex Message Relationships**

**Use case:** Threads, reactions, replies

```typescript
.screen("discord", "channel", {
  state: {
    channelId: "general",
    messages: [
      {
        id: "1",
        from: "alex",
        text: "Who wants pizza?",
        reactions: [
          { emoji: "🍕", users: ["sarah", "me"] }
        ],
        thread: {
          id: "thread_1",
          messageCount: 3,
          participants: ["sarah", "me"]
        }
      }
    ]
  }
})
```

---

### **7. Multi-Device Episodes**

**Use case:** Phone 1 sends → Phone 2 receives

```typescript
episode("cross-device")
  .device("phone1", "iphone16")
  .device("phone2", "iphone15")

  .screen("phone1", "whatsapp", "chat", {
    timeline: [{ at: "3s", action: "message.send", text: "Hey!" }],
  })

  .screen("phone2", "whatsapp", "chat", {
    timeline: [
      {
        at: "4s",
        action: "message.receive",
        from: "phone1_user",
        text: "Hey!",
      },
    ],
  });
```

---

### **8. App-Specific Features**

**WhatsApp Status:**

```typescript
.screen("whatsapp", "status", {
  state: {
    stories: [
      { userId: "alex", media: "/video.mp4", timestamp: "-2h" }
    ]
  }
})
```

**Instagram Stories:**

```typescript
.screen("instagram", "stories", {
  state: {
    stories: [
      { userId: "sarah", media: "/photo.jpg", timestamp: "-5h" }
    ]
  }
})
```

**Discord Voice:**

```typescript
.screen("discord", "channel", {
  state: {
    voiceChannel: {
      id: "vc_general",
      participants: ["alex", "sarah"],
      speakingUser: "alex"
    }
  }
})
```

---

### **9. Platform Differences**

**Same episode, different platforms:**

```typescript
.screen("whatsapp", "chat", {
  state: {...},
  tokens: "auto"  // iOS episode → uses whatsappConfigs.ios
                  // Android episode → uses whatsappConfigs.android
})
```

**Platform-specific overrides:**

```typescript
.screen("whatsapp", "chat", {
  state: {...},
  tokens: {
    ios: { /* custom iOS tokens */ },
    android: { /* custom Android tokens */ }
  }
})
```

---

### **10. Media & Rich Content**

**Photos:**

```typescript
.screen("whatsapp", "chat", {
  timeline: [
    {
      at: "5s",
      action: "message.send",
      type: "photo",
      media: "/photos/sunset.jpg",
      caption: "Beautiful sunset!"
    }
  ]
})
```

**Voice messages:**

```typescript
{
  at: "8s",
  action: "message.receive",
  type: "voice",
  media: "/audio/voice.mp3",
  duration: 15
}
```

**Reactions:**

```typescript
{
  at: "10s",
  action: "message.react",
  messageId: "msg_5",
  emoji: "❤️"
}
```

---

## Token Integration

### **Problem: Episodes Hardcode Implementation**

**Current:**

```typescript
wa.at("3s").receive("Alex", "Hey...");
// Renderer hardcodes WhatsApp bubble color, font, spacing
```

**Better:**

```typescript
// Episode declares intent
.screen("whatsapp", "chat", {
  timeline: [
    { at: "3s", action: "message.receive", from: "alex", text: "Hey..." }
  ],
  tokens: "auto"  // Auto-applies whatsappConfigs.ios
})

// Renderer uses tokens
function MessageBubble({ message, tokens }) {
  return (
    <div style={{
      backgroundColor: tokens.colors.bubbleBackground,
      fontFamily: tokens.typography.body,
      padding: tokens.spacing.message
    }}>
      {message.text}
    </div>
  );
}
```

---

### **Token Resolution**

```typescript
function resolveTokens(
  app: string,
  platform: "ios" | "android",
  override?: TokenOverride,
): Tokens {
  // Base platform tokens
  const baseTokens = platform === "ios" ? iOSTokens : androidTokens;

  // App-specific tokens
  const appTokens = appConfigs[app][platform];

  // Merge
  const tokens = { ...baseTokens, ...appTokens };

  // Apply overrides
  if (override) {
    return { ...tokens, ...override };
  }

  return tokens;
}
```

---

### **Token Usage in Screens**

**Auto (Default):**

```typescript
.screen("whatsapp", "chat", {
  tokens: "auto"
  // → resolveTokens("whatsapp", device.platform)
})
```

**Custom:**

```typescript
.screen("whatsapp", "chat", {
  tokens: {
    colors: {
      bubbleBackground: "#FF0000"  // Override red
    }
  }
})
```

**Platform-specific:**

```typescript
.screen("whatsapp", "chat", {
  tokens: {
    ios: { colors: { bubbleBackground: "#007AFF" } },
    android: { colors: { bubbleBackground: "#34B7F1" } }
  }
})
```

---

## DSL Design

### **Design Principles**

1. **Declarative over imperative**
2. **Type-safe (TypeScript)**
3. **Minimal boilerplate**
4. **Readable as English**
5. **Compiles to portable JSON**

---

### **Episode DSL**

```typescript
episode("drama-story", { fps: 30, duration: "60s" })
  .device("phone", "iphone16")

  // Screen 1
  .screen("whatsapp", "chat_list", {
    from: "0s",
    to: "2s",
    state: {
      conversations: [
        { id: "alex", name: "Alex 💔", lastMessage: "Can't wait!", unread: 1 },
      ],
    },
  })

  // Screen 2
  .screen("whatsapp", "chat", {
    from: "2s",
    to: "30s",
    state: {
      conversationId: "alex",
      messages: [
        { from: "alex", text: "Can't wait!", timestamp: "-2h", read: true },
      ],
    },
    timeline: [
      { at: "3s", action: "message.receive", from: "alex", text: "Hey..." },
    ],
  })

  .build();
```

---

### **Screen Builders (Syntactic Sugar)**

```typescript
// Verbose
.screen("whatsapp", "chat", { state: {...}, timeline: [...] })

// Shorthand
.whatsapp.chat({
  from: "0s",
  to: "30s",
  messages: [
    { from: "alex", text: "Hey", timestamp: "-2h" }
  ],
  timeline: [
    { at: "3s", receive: { from: "alex", text: "Hi" } }
  ]
})
```

---

### **Helper Methods**

```typescript
// Message sequences (auto-generates timing)
.screen("whatsapp", "chat", {
  from: "0s",
  to: "30s"
})
.messageSequence([
  { from: "alex", text: "Hey..." },
  { from: "alex", text: "We need to talk." },
  { from: "me", text: "What's going on?" }
], {
  startTime: "3s",
  pacing: "natural"  // Auto-calculates delays
})
```

---

## JSON Schema

### **Episode JSON**

```json
{
  "version": "2.0",
  "meta": {
    "id": "drama-story",
    "title": "Drama Story",
    "fps": 30,
    "duration": 60
  },

  "device": {
    "id": "phone",
    "model": "iphone16",
    "platform": "ios"
  },

  "screens": [
    {
      "app": "whatsapp",
      "type": "chat",
      "from": "0s",
      "to": "30s",

      "initialState": {
        "conversationId": "dm_alex",
        "messages": [
          {
            "id": "msg_1",
            "from": "alex",
            "text": "Can't wait to see you!",
            "timestamp": -7200,
            "read": true
          }
        ]
      },

      "timeline": [
        {
          "at": "3s",
          "action": "message.receive",
          "from": "alex",
          "text": "Hey..."
        }
      ],

      "tokens": "auto"
    }
  ]
}
```

---

### **TypeScript Schema**

```typescript
interface Episode {
  version: "2.0";
  meta: EpisodeMeta;
  device: DeviceConfig;
  screens: Screen[];
}

interface Screen {
  app: string;
  type: string;
  from: Timestamp;
  to: Timestamp;
  initialState: Record<string, any>;
  timeline: Action[];
  tokens: TokenResolution;
}

interface Action {
  at: Timestamp;
  action: string;
  [key: string]: any;
}

type TokenResolution =
  | "auto"
  | Partial<Tokens>
  | { ios: Partial<Tokens>; android: Partial<Tokens> };
```

---

## Compilation Pipeline

### **1. DSL → JSON**

```typescript
const dsl = episode("test")
  .device("phone", "iphone16")
  .screen("whatsapp", "chat", {...});

const json = dsl.toJSON();
```

### **2. JSON → Events**

```typescript
function compileEpisode(episode: Episode): Event[] {
  const events: Event[] = [];

  for (const screen of episode.screens) {
    events.push(...compileScreen(screen));
  }

  return events.sort((a, b) => a.at - b.at);
}
```

### **3. Events → State**

```typescript
function computeStateAtFrame(events: Event[], frame: number): WorldState {
  let state = initialState;

  for (const event of events) {
    if (event.at <= frame) {
      state = reducer(state, event);
    }
  }

  return state;
}
```

### **4. State → Render**

```typescript
function render(state: WorldState, tokens: Tokens): ReactElement {
  const activeApp = state.devices[0].foregroundAppId;
  const appState = state.appState[activeApp];

  return (
    <AppRenderer
      app={activeApp}
      state={appState}
      tokens={tokens}
    />
  );
}
```

---

## Migration Path

### **Phase 1: JSON Schema + Validator (Week 1)**

**Goal:** Define and validate JSON structure

**Tasks:**

- [ ] Define Episode JSON schema (TypeScript interfaces)
- [ ] Build JSON validator (Zod/Yup)
- [ ] Write tests for schema validation
- [ ] Document schema

**Deliverable:** `packages/ir/src/v3/episode-schema.ts`

---

### **Phase 2: Screen Compiler (Week 2)**

**Goal:** Convert Screen JSON → Events

**Tasks:**

- [ ] Build `compileScreen(screen: Screen): Event[]`
- [ ] Build `compileAction(action: Action): Event`
- [ ] Handle initial state compilation
- [ ] Test with 1 manually-written Screen JSON

**Deliverable:** `packages/compiler/src/v3/screen-compiler.ts`

**Test:**

```typescript
const screen = {
  app: "whatsapp",
  type: "chat",
  from: "0s",
  to: "30s",
  initialState: { messages: [...] },
  timeline: [...]
};

const events = compileScreen(screen);
// → [{ type: "APP_SWITCH", ... }, { type: "STATE_INIT", ... }, ...]
```

---

### **Phase 3: DSL Builder (Week 3)**

**Goal:** TypeScript DSL compiles to JSON

**Tasks:**

- [ ] Build `.screen()` API
- [ ] Build `.messageSequence()` helper
- [ ] Build `.whatsapp.chat()` shortcuts
- [ ] Convert 1 episode to new DSL

**Deliverable:** `packages/dsl/src/v3/episode-builder.ts`

**Test:**

```typescript
const episode = episode("test")
  .device("phone", "iphone16")
  .screen("whatsapp", "chat", {...})
  .build();

// episode.toJSON() → Episode JSON
// episode.toEvents() → Event[]
```

---

### **Phase 4: Token Integration (Week 4)**

**Goal:** Auto-apply tokens based on app + platform

**Tasks:**

- [ ] Build `resolveTokens(app, platform): Tokens`
- [ ] Update renderer to use resolved tokens
- [ ] Test all apps render with correct tokens
- [ ] Document token system

**Deliverable:** Token-aware rendering working

---

### **Phase 5: Migration (Week 5+)**

**Goal:** Migrate existing episodes

**Tasks:**

- [ ] Convert 1 production episode to new DSL
- [ ] Verify visual output matches
- [ ] Document migration guide
- [ ] Convert remaining 13 episodes

**Approach:** Incremental migration. Old and new DSL coexist.

---

## Examples

### **Example 1: Simple Chat (No History)**

```typescript
episode("simple-chat")
  .device("phone", "iphone16")

  .screen("whatsapp", "chat", {
    from: "0s",
    to: "30s",
    state: {
      conversationId: "dm_sarah",
      messages: [], // Empty - no history
    },
    timeline: [
      { at: "3s", action: "message.receive", from: "sarah", text: "Hey!" },
      { at: "6s", action: "message.send", text: "Hey! What's up?" },
    ],
  });
```

---

### **Example 2: Chat with History**

```typescript
.screen("whatsapp", "chat", {
  from: "0s",
  to: "30s",
  state: {
    conversationId: "dm_alex",
    messages: [
      // These appear immediately at t=0
      { id: "1", from: "alex", text: "Can't wait!", timestamp: "-2h", read: true },
      { id: "2", from: "me", text: "Me too!", timestamp: "-1h", read: true },
      { id: "3", from: "alex", text: "On my way!", timestamp: "-30m", read: true }
    ]
  },
  timeline: [
    // New message arrives during episode
    { at: "3s", action: "message.receive", from: "alex", text: "I'm here!" }
  ]
})
```

---

### **Example 3: Multi-Screen Navigation**

```typescript
episode("multi-screen")
  .device("phone", "iphone16")

  // Screen 1: Chat list
  .screen("whatsapp", "chat_list", {
    from: "0s",
    to: "2s",
    state: {
      conversations: [
        { id: "alex", name: "Alex", unread: 1 },
        { id: "sarah", name: "Sarah", unread: 0 }
      ]
    }
  })

  // Screen 2: Open chat with Alex
  .screen("whatsapp", "chat", {
    from: "2s",
    to: "15s",
    state: {
      conversationId: "alex",
      messages: [...]
    },
    timeline: [
      { at: "3s", action: "message.receive", from: "alex", text: "Hey" }
    ]
  })

  // Screen 3: Back to chat list
  .screen("whatsapp", "chat_list", {
    from: "15s",
    to: "20s",
    state: {
      conversations: [...]  // State continues from Screen 1
    }
  })
```

---

### **Example 4: Multi-App**

```typescript
episode("multi-app")
  .device("phone", "iphone16")

  // WhatsApp
  .screen("whatsapp", "chat", {
    from: "0s",
    to: "10s",
    state: {...},
    timeline: [...]
  })

  // Switch to Instagram
  .screen("instagram", "feed", {
    from: "10s",
    to: "20s",
    state: {
      posts: [...]
    },
    timeline: [
      { at: "12s", action: "scroll", to: 500 }
    ]
  })

  // Back to WhatsApp
  .screen("whatsapp", "chat", {
    from: "20s",
    to: "30s",
    state: {...}
  })
```

---

### **Example 5: Background App Updates**

```typescript
.screen("instagram", "feed", {
  from: "0s",
  to: "10s",
  timeline: [
    { at: "5s", action: "scroll", to: 500 }
  ]
})

// WhatsApp receives message in background (shows notification)
.backgroundAction("whatsapp", {
  at: "7s",
  action: "message.receive",
  from: "alex",
  text: "Hey! Where are you?"
})
```

---

### **Example 6: Group Chat**

```typescript
.screen("whatsapp", "chat", {
  from: "0s",
  to: "30s",
  state: {
    conversationId: "group_friends",
    type: "group",
    participants: [
      { id: "alex", name: "Alex" },
      { id: "sarah", name: "Sarah" },
      { id: "jake", name: "Jake" }
    ],
    messages: [
      { from: "alex", text: "Who wants pizza?", timestamp: "-10m" }
    ]
  },
  timeline: [
    { at: "3s", action: "message.receive", from: "sarah", text: "Me!" },
    { at: "5s", action: "message.send", text: "Count me in!" },
    { at: "8s", action: "message.receive", from: "jake", text: "Same!" }
  ]
})
```

---

### **Example 7: Reactions**

```typescript
.screen("instagram", "dm", {
  timeline: [
    { at: "3s", action: "message.receive", from: "sarah", text: "Check this out!" },
    { at: "6s", action: "message.react", messageId: "msg_1", emoji: "❤️" }
  ]
})
```

---

### **Example 8: Media Messages**

```typescript
.screen("whatsapp", "chat", {
  timeline: [
    {
      at: "3s",
      action: "message.send",
      type: "photo",
      media: "/photos/sunset.jpg",
      caption: "Beautiful!"
    },
    {
      at: "8s",
      action: "message.receive",
      type: "voice",
      from: "alex",
      media: "/audio/voice.mp3",
      duration: 15
    }
  ]
})
```

---

### **Example 9: Threads (Discord)**

```typescript
.screen("discord", "channel", {
  state: {
    messages: [
      {
        id: "msg_1",
        from: "alex",
        text: "Who wants to join voice?",
        thread: {
          id: "thread_1",
          messageCount: 5,
          participants: ["sarah", "jake"]
        }
      }
    ]
  }
})
```

---

### **Example 10: AI-Generated Episode**

**LLM Output (JSON):**

```json
{
  "version": "2.0",
  "screens": [
    {
      "app": "whatsapp",
      "type": "chat",
      "from": "0s",
      "to": "30s",
      "initialState": {
        "conversationId": "dm_alex",
        "messages": []
      },
      "timeline": [
        {
          "at": "3s",
          "action": "message.receive",
          "from": "alex",
          "text": "Hey"
        },
        { "at": "6s", "action": "message.send", "text": "Hi!" }
      ]
    }
  ]
}
```

**Direct rendering:** No DSL needed!

---

## Implementation Roadmap

### **Q1 2026: Foundation**

**Week 1-2:** JSON Schema + Validator

- Define Episode/Screen/Action schemas
- Build validator
- Documentation

**Week 3-4:** Screen Compiler

- Build Screen → Events compiler
- Test with manual JSON
- Ensure backward compatibility

**Week 5-6:** DSL Builder

- Build TypeScript DSL
- Compile to JSON
- Convert 1 episode

---

### **Q2 2026: Token Integration**

**Week 7-8:** Token Resolution

- Build token resolver
- Update renderer
- Test all apps

**Week 9-10:** Migration

- Convert 5 episodes
- Document migration guide

---

### **Q3 2026: AI Integration**

**Week 11-12:** JSON Generation

- LLM → Episode JSON
- Validation pipeline
- Test with GPT-4

**Week 13-14:** Visual Editor

- Web UI for building screens
- Drag-drop timeline
- Export to JSON

---

### **Q4 2026: Scale**

**Week 15-16:** Multi-Device

- Cross-device episodes
- Synchronization model

**Week 17-18:** Advanced Features

- Threads, reactions, media
- Complex state relationships

---

## Benefits Summary

### **For Developers**

| Before                            | After                        |
| --------------------------------- | ---------------------------- |
| Manual `.at()` for every event    | Declarative state + timeline |
| No initial state support          | Native initial state         |
| App-specific DSLs (100+ LOC each) | Universal Screen model       |
| Hard to debug state               | Export state at any frame    |
| Manual navigation                 | Explicit screen sequences    |

### **For AI**

| Before                      | After                  |
| --------------------------- | ---------------------- |
| Must generate TypeScript    | Generates pure JSON    |
| Imperative DSL              | Declarative state      |
| Type errors block rendering | Schema validation only |

### **For Enterprise**

| Before                 | After                    |
| ---------------------- | ------------------------ |
| 100 apps = 50K LOC DSL | 100 apps = 1 JSON schema |
| Hard to maintain       | Centralized model        |
| No token usage         | Token-driven rendering   |
| Manual testing         | State snapshots testable |

---

## Conclusion

The **Screen-Flow Architecture** is the right abstraction for Tokovo to scale to 100+ apps while maintaining best-in-class DX and AI integration.

**Key Wins:**

1. ✅ Universal model across all apps
2. ✅ Initial state support (chat history)
3. ✅ Token-driven rendering
4. ✅ AI-friendly JSON format
5. ✅ Declarative, testable, debuggable
6. ✅ Incremental migration path

**Next Step:** Build Phase 1 (JSON Schema + Validator)

---

**Questions? Discuss in:** `/later/UNIVERSAL_DISCUSSION.md`

---

## System Integration

### **Notifications**

**Overview:**  
Notifications are device-level events that any app can trigger. They appear as banners, lock screen notifications, or notification center entries.

**Event Types:**
- `NOTIFICATION_SHOW` - Display notification
- `NOTIFICATION_DISMISS` - Remove notification
- `NOTIFICATION_TAP` - User tapped notification
- `NOTIFICATION_SWIPE` - User dismissed notification

**Notification Payload:**
```typescript
{
  appId: string;           // Which app triggered it
  title: string;           // "Alex"
  body: string;            // "Hey! Where are you?"
  mode: "headsup" | "lockscreen" | "both";
  priority: "low" | "default" | "high";
  duration?: number;       // Auto-dismiss after N frames
  actions?: Action[];      // Quick reply, etc.
  replyable?: boolean;
}
```

**Screen-Flow Integration:**
```typescript
.screen("instagram", "feed", {
  from: "0s",
  to: "15s",
  state: {
    posts: [...]
  },
  timeline: [
    // Receive WhatsApp notification while in Instagram
    {
      at: "7s",
      action: "notification.show",
      appId: "whatsapp",
      title: "Alex 💔",
      body: "We need to talk.",
      mode: "headsup",
      priority: "high"
    },
    
    // User taps notification → switches to WhatsApp
    {
      at: "10s",
      action: "notification.tap",
      notificationId: "notif_1"
    }
  ]
})

// Automatically switches to WhatsApp chat screen
.screen("whatsapp", "chat", {
  from: "10s",
  to: "30s",
  state: {
    conversationId: "dm_alex",
    messages: [...]
  }
})
```

**Compilation:**
```typescript
// action: "notification.show" compiles to:
{
  at: 210,  // 7s @ 30fps
  type: "NOTIFICATION_SHOW",
  deviceId: "phone",
  payload: {
    appId: "app_whatsapp",
    title: "Alex 💔",
    body: "We need to talk.",
    mode: "headsup",
    priority: "high"
  }
}
```

**Plugin Compatibility:**
- ✅ **CameraDirectorPlugin** - Sees NOTIFICATION_SHOW → interrupt-focus camera movement
- ✅ **AutoSoundRules** - Can trigger notification sound
- ✅ **Device State** - Manages notification stack

---

### **Audio System**

**Overview:**  
Tokovo has a sophisticated frame-based deterministic audio system with two subsystems:

1. **Auto-Sound Rules** (Declarative) - Events automatically trigger sounds
2. **Manual Sound Events** (Imperative) - Explicit sound playback

**Audio Buses:**
- `music` - Background music, crossfades, ducking
- `ui` - UI sounds (clicks, swooshes)
- `sfx` - Sound effects (environmental, impact)
- `voice` - Voice narration, voiceovers
- `master` - Final mix

---

#### **A. Auto-Sound Rules**

Apps register rules that trigger sounds automatically when events match.

**WhatsApp Auto-Sound Rules:**
```typescript
[
  {
    match: { kind: "APP", appId: "app_whatsapp", type: "MESSAGE_RECEIVED" },
    action: "PLAY_ONE_SHOT",
    sound: "app_whatsapp.message_in",
    bus: "ui",
    volume: 0.8
  },
  {
    match: { kind: "APP", appId: "app_whatsapp", type: "MESSAGE_SENT" },
    action: "PLAY_ONE_SHOT",
    sound: "app_whatsapp.message_out",
    bus: "ui",
    volume: 0.6
  },
  {
    match: { kind: "APP", appId: "app_whatsapp", type: "TYPING_START" },
    action: "START_LOOP",
    sound: "app_whatsapp.typing_loop",
    bus: "ui",
    idTemplate: "typing_{actor}",  // One loop per actor
    volume: 0.3
  },
  {
    match: { kind: "APP", appId: "app_whatsapp", type: "TYPING_END" },
    action: "STOP_SOUND",
    stopId: "typing_{actor}"
  }
]
```

**Screen-Flow Integration (Automatic):**
```typescript
.screen("whatsapp", "chat", {
  timeline: [
    {
      at: "3s",
      action: "message.receive",
      from: "alex",
      text: "Hey!"
    }
    // → Compiles to MESSAGE_RECEIVED event
    // → AutoSoundRule sees event
    // → Automatically plays message_in.mp3 sound!
  ]
})
```

**How It Works:**
```
Screen Action (message.receive)
  ↓
Screen Compiler
  ↓
Event (MESSAGE_RECEIVED)
  ↓
AutoSoundRegistry.match(event)
  ↓
Matched Rule → Generate PLAY_SOUND event
  ↓
Audio Mixer → Play sound
```

**Rule Structure:**
```typescript
interface AutoSoundRule {
  match: {
    kind: "APP" | "DEVICE" | "AUDIO";
    type?: string;      // Event type to match
    appId?: string;     // Specific app
    from?: string;      // Message sender
  };
  
  action: "PLAY_ONE_SHOT" | "START_LOOP" | "STOP_SOUND";
  
  sound?: string;       // Sound ID (for PLAY_ONE_SHOT, START_LOOP)
  bus?: AudioBus;       // Which bus
  volume?: number;      // 0-1
  
  stopId?: string;      // Which sound to stop (for STOP_SOUND)
  idTemplate?: string;  // Dynamic ID (e.g., "typing_{actor}")
  
  duckMusic?: boolean;  // Duck music during this sound?
  priority?: number;    // Higher = takes precedence
}
```

---

#### **B. Manual Sound Events**

Explicit sound playback for custom scenarios.

**Screen-Flow Integration:**
```typescript
.screen("whatsapp", "chat", {
  timeline: [
    // Play custom sound
    {
      at: "5s",
      action: "sound.play",
      soundId: "ui/swoosh.mp3",
      bus: "ui",
      volume: 0.7
    },
    
    // Start looping sound
    {
      at: "8s",
      action: "sound.startLoop",
      soundId: "ambient/rain.mp3",
      bus: "sfx",
      volume: 0.3,
      fadeIn: 30  // 1 second fade
    },
    
    // Stop looping sound
    {
      at: "20s",
      action: "sound.stopLoop",
      instanceId: "rain_loop",
      fadeOut: 60  // 2 second fade
    }
  ]
})
```

**Compilation:**
```typescript
// action: "sound.play" compiles to:
{
  at: 150,
  kind: "AUDIO",
  type: "PLAY",
  soundId: "ui/swoosh.mp3",
  bus: "ui",
  volume: 0.7
}
```

---

#### **C. Background Music (BGM)**

Special handling for background music with crossfading and ducking.

**Screen-Flow Integration:**
```typescript
.screen("whatsapp", "chat", {
  from: "0s",
  to: "60s",
  bgm: {
    soundId: "/music/cinematic-ambient.mp3",
    volume: 0.3,
    fadeIn: "3s",
    fadeOut: "4s"
  },
  timeline: [...]
})
```

**Or use audio track:**
```typescript
.audio((audio) => {
  audio.span("0s", "60s").bgm("/music/lofi-beats.mp3", {
    volume: 0.25,
    fadeIn: "2s"
  });
})
```

**Auto-Ducking:**
When voice narration plays, music automatically ducks to 15% volume.

---

### **Camera System (CameraDirectorPlugin)**

**Overview:**  
CameraDirectorPlugin automatically generates cinematic camera movements based on events. It's an **event-driven plugin** that listens to compiled events.

**Camera Movements:**
- **Focus** - Smooth camera movement to target element
- **Shake** - Screen shake for emphasis
- **Zoom** - Zoom in/out
- **Pan** - Horizontal/vertical movement
- **Interrupt-Focus** - Instant cut to target

**Triggers:**
```typescript
{
  match: { type: "NOTIFICATION_SHOWN" },
  trigger: "interrupt-focus",
  targetId: "notification"
}

{
  match: { type: "MESSAGE_RECEIVED" },
  trigger: "focus",
  targetId: "message-{messageId}",
  duration: 20  // frames
}

{
  match: { type: "MESSAGE_SENT" },
  trigger: "shake",
  intensity: 3
}
```

**Screen-Flow Integration (Automatic):**
```typescript
.screen("whatsapp", "chat", {
  timeline: [
    {
      at: "3s",
      action: "message.receive",
      from: "alex",
      text: "Hey!"
    }
    // → Compiles to MESSAGE_RECEIVED event
    // → CameraDirectorPlugin sees event
    // → Automatically generates camera focus on message!
  ]
})
```

**Manual Camera Control:**
```typescript
.screen("whatsapp", "chat", {
  timeline: [
    // Override camera behavior
    {
      at: "5s",
      action: "camera.focus",
      targetId: "message-5",
      duration: 30,  // 1 second
      easing: "easeInOut"
    },
    
    {
      at: "8s",
      action: "camera.shake",
      intensity: 5,
      duration: 15
    },
    
    {
      at: "10s",
      action: "camera.zoom",
      scale: 1.2,
      duration: 20
    }
  ]
})
```

**Compatibility:**  
✅ CameraDirectorPlugin operates on events. Screen-Flow compiles to events → Plugin continues to work without modification.

---

## Complete Action → Event Mapping

| Screen Action | Compiles To | Auto-Triggers |
|---------------|-------------|---------------|
| **Messages** | | |
| `message.receive` | MESSAGE_RECEIVED | Auto-sound (message_in), Camera focus, Typing end |
| `message.send` | MESSAGE_SENT | Auto-sound (message_out), Camera focus, Keyboard hide |
| `message.react` | MESSAGE_REACTED | Auto-sound (reaction), Camera subtle |
| `message.edit` | MESSAGE_EDITED | - |
| `message.delete` | MESSAGE_DELETED | Auto-sound (whoosh) |
| **Typing** | | |
| `typing.start` | TYPING_START | Auto-sound (typing loop), Camera subtle |
| `typing.end` | TYPING_END | Stop typing sound |
| **Navigation** | | |
| `navigate.to` | APP_SWITCH + STATE_INIT | Camera transition |
| `navigate.back` | APP_SWITCH (previous) | Camera transition |
| **Notifications** | | |
| `notification.show` | NOTIFICATION_SHOW | Auto-sound (notification), Camera interrupt-focus |
| `notification.tap` | NOTIFICATION_TAP | Navigate to app |
| `notification.dismiss` | NOTIFICATION_DISMISS | Camera subtle |
| **Audio** | | |
| `sound.play` | PLAY | Audio mixer plays |
| `sound.startLoop` | PLAY (loop=true) | Audio mixer loops |
| `sound.stopLoop` | STOP_SOUND | Audio mixer stops |
| `bgm.start` | BGM_START → PLAY (bus=music) | Music bed crossfade |
| `bgm.end` | BGM_END → FADE_OUT | Music bed fade out |
| **Camera** | | |
| `camera.focus` | CAMERA_FOCUS | - |
| `camera.shake` | CAMERA_SHAKE | - |
| `camera.zoom` | CAMERA_ZOOM | - |
| **UI** | | |
| `scroll` | SCROLL | Camera follow |
| `keyboard.show` | KEYBOARD_SHOW | - |
| `keyboard.hide` | KEYBOARD_HIDE | - |

---

## Plugin Compatibility Matrix

| Plugin | Type | Listens To | Screen-Flow Compatible? | Notes |
|--------|------|-----------|------------------------|-------|
| **CameraDirectorPlugin** | Compiler | Events | ✅ YES | Listens to compiled events |
| **TypingIndicatorPlugin** | Compiler | MESSAGE_SENT/RECEIVED | ✅ YES | Generates TYPING events |
| **KeyboardPlugin** | Compiler | MESSAGE_SENT | ✅ YES | Adds `typed: true` to events |
| **AutoSoundRegistry** | Runtime | All events | ✅ YES | Matches events to trigger sounds |
| **AudioDirectorPlugin** | Compiler | Events | ✅ YES | Generates audio events |
| **OSDirectorPlugin** | Compiler | Time-based | ✅ YES | Generates OS state changes |

**Why All Compatible:**

Screen-Flow Architecture maintains the **event-based core**:

```
Screen Timeline Actions
  ↓
Screen Compiler (new)
  ↓
Events (existing format)
  ↓
├─→ Compiler Plugins (TypingIndicator, Keyboard, Camera, etc.)
├─→ Runtime AutoSound Registry
└─→ State Reducers
```

**Plugins don't change. Screen-Flow is a DSL layer on top.**

---

## Advanced Integration Examples

### **Example 1: Multi-App with Notifications & Sounds**

```typescript
episode("cross-app-drama")
  .device("phone", "iphone16")
  
  // Scene 1: In Instagram
  .screen("instagram", "feed", {
    from: "0s",
    to: "10s",
    state: {
      posts: [...]
    },
    timeline: [
      { at: "2s", action: "scroll", to: 500 },
      
      // WhatsApp notification appears
      {
        at: "5s",
        action: "notification.show",
        appId: "whatsapp",
        title: "Alex 💔",
        body: "We need to talk.",
        mode: "headsup"
      }
      // → Auto-triggers:
      //   - Notification sound (via AutoSoundRule)
      //   - Camera interrupt-focus (via CameraDirectorPlugin)
    ]
  })
  
  // Scene 2: User taps notification → Switch to WhatsApp
  .screen("whatsapp", "chat", {
    from: "10s",
    to: "30s",
    state: {
      conversationId: "dm_alex",
      messages: [
        { from: "alex", text: "We need to talk.", timestamp: "-5s", read: false }
      ]
    },
    timeline: [
      {
        at: "12s",
        action: "message.send",
        text: "What's going on?"
      }
      // → Auto-triggers:
      //   - message_out sound
      //   - Keyboard show + type + hide (KeyboardPlugin)
      //   - Camera focus on message
    ]
  })
```

---

### **Example 2: Cinematic Chat with Custom Audio**

```typescript
.screen("whatsapp", "chat", {
  from: "0s",
  to: "60s",
  
  // Background music
  bgm: {
    soundId: "/music/dramatic-tension.mp3",
    volume: 0.2,
    fadeIn: "3s",
    fadeOut: "5s"
  },
  
  state: {
    conversationId: "dm_unknown",
    messages: []
  },
  
  timeline: [
    // Ominous message arrives
    {
      at: "5s",
      action: "message.receive",
      from: "Unknown Number",
      text: "I know what you did."
    },
    // → Auto: message_in sound, camera focus
    
    // Custom horror sound effect
    {
      at: "6s",
      action: "sound.play",
      soundId: "/sfx/horror-sting.mp3",
      bus: "sfx",
      volume: 0.5
    },
    
    // Camera shake for emphasis
    {
      at: "6.5s",
      action: "camera.shake",
      intensity: 8,
      duration: 20
    },
    
    // User typing (nervous)
    {
      at: "10s",
      action: "message.send",
      text: "Who is this?"
    },
    // → Auto: message_out sound, keyboard, camera
    
    // Another ominous message
    {
      at: "15s",
      action: "message.receive",
      from: "Unknown Number",
      text: "You'll find out soon enough."
    },
    
    // Tension sound loop
    {
      at: "16s",
      action: "sound.startLoop",
      soundId: "/sfx/heartbeat.mp3",
      bus: "sfx",
      volume: 0.3
    }
  ]
})
```

---

### **Example 3: Voice Narration with Auto-Ducking**

```typescript
.screen("whatsapp", "chat", {
  from: "0s",
  to: "60s",
  
  bgm: {
    soundId: "/music/lofi-beats.mp3",
    volume: 0.3
  },
  
  timeline: [
    // Voice narration starts
    {
      at: "5s",
      action: "voice.play",
      soundId: "/voice/narrator/intro.mp3",
      bus: "voice",
      volume: 1.0
    },
    // → BGM automatically ducks to 15% volume (via voice policy)
    
    // Message appears during narration
    {
      at: "8s",
      action: "message.receive",
      from: "sarah",
      text: "Remember when we first met?"
    },
    
    // Voice narration continues
    {
      at: "15s",
      action: "voice.play",
      soundId: "/voice/narrator/transition.mp3",
      bus: "voice"
    },
    
    // Voice ends → BGM returns to full volume
    {
      at: "20s",
      action: "voice.stop"
    }
    // → BGM crossfades back to 30% volume
  ]
})
```

---

### **Example 4: Group Chat with Multiple Sounds**

```typescript
.screen("whatsapp", "chat", {
  state: {
    conversationId: "group_friends",
    type: "group",
    participants: [
      { id: "alex", name: "Alex" },
      { id: "sarah", name: "Sarah" },
      { id: "jake", name: "Jake" }
    ]
  },
  timeline: [
    // Alex types (typing sound starts)
    { at: "2s", action: "typing.start", actor: "alex" },
    // → Auto: typing_loop sound starts
    
    // Sarah types simultaneously (second typing sound)
    { at: "3s", action: "typing.start", actor: "sarah" },
    // → Auto: second typing_loop (idTemplate: "typing_sarah")
    
    // Alex sends message
    {
      at: "5s",
      action: "message.receive",
      from: "alex",
      text: "Who wants pizza?"
    },
    // → Auto: typing_alex stops, message_in plays
    
    // Sarah sends message
    {
      at: "6s",
      action: "message.receive",
      from: "sarah",
      text: "Me!"
    },
    // → Auto: typing_sarah stops, message_in plays
    
    // User sends message
    {
      at: "8s",
      action: "message.send",
      text: "Count me in!"
    }
    // → Auto: message_out sound, keyboard
  ]
})
```

---

### **Example 5: Multi-Device Synchronization**

```typescript
episode("cross-device")
  .device("phone1", "iphone16")
  .device("phone2", "iphone15")
  
  // Phone 1: User sends message
  .screen("phone1", "whatsapp", "chat", {
    from: "0s",
    to: "15s",
    timeline: [
      {
        at: "3s",
        action: "message.send",
        text: "Hey! Check your phone",
        syncTo: "phone2"  // Sync this message to phone2
      }
    ]
  })
  
  // Phone 2: Receives message
  .screen("phone2", "whatsapp", "chat_list", {
    from: "0s",
    to: "10s",
    timeline: [
      // Message arrives from phone1
      {
        at: "4s",  // 1 second delay
        action: "notification.show",
        appId: "whatsapp",
        from: "phone1_user",
        title: "User 1",
        body: "Hey! Check your phone"
      }
    ]
  })
```

---

## Updated Benefits Summary

### **System Integration Benefits**

| Feature | Before | After (Screen-Flow) |
|---------|--------|---------------------|
| **Notifications** | Manual NOTIFICATION_SHOW events | Timeline action → auto-compiles |
| **Sounds** | Manual PLAY_SOUND events | Auto-triggered via AutoSoundRules |
| **Camera** | CameraDirectorPlugin config | Auto-generated from timeline actions |
| **BGM** | Manual audio track setup | Screen-level `bgm` property |
| **Voice Ducking** | Manual volume control | Automatic via voice bus policy |
| **Plugins** | Event-based, tightly coupled | Still event-based, Screen-Flow compiles to events |

---

## Conclusion (Updated)

The **Screen-Flow Architecture** is fully compatible with Tokovo's existing plugin ecosystem while providing a superior authoring experience.

**Key Wins:**

1. ✅ Universal model across all apps
2. ✅ Initial state support (chat history)
3. ✅ Token-driven rendering
4. ✅ AI-friendly JSON format
5. ✅ Declarative, testable, debuggable
6. ✅ Incremental migration path
7. ✅ **Full notification system integration**
8. ✅ **Auto-sound rules work automatically**
9. ✅ **CameraDirectorPlugin compatibility**
10. ✅ **BGM and voice narration support**

**Plugins remain event-driven. Screen-Flow is a DSL layer that compiles to events.**

**Next Step:** Build Phase 1 (JSON Schema + Validator)

---

**Questions? Discuss in:** `/later/UNIVERSAL_DISCUSSION.md`
