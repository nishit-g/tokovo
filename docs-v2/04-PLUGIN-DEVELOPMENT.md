# Plugin Development

> How to create custom app plugins for Tokovo

---

## Overview

Plugins extend Tokovo with new apps (WhatsApp, Twitter, Instagram, etc.). A plugin provides:

- **Reducer** - State updates for events
- **Views** - React components for rendering
- **Lowering** - Convert IR ops to runtime events
- **DSL API** - Author-facing helpers
- **Assets** - Sounds, icons

---

## Plugin Contract

The minimal plugin interface:

```typescript
interface TokovoPlugin<AppId extends string = string> {
    // Identity (required)
    id: AppId;
    version: string;
    displayName: string;

    // Runtime (required)
    reducer: (state: WorldState, event: RuntimeEvent) => void;
    views: {
        AppRoot: React.FC<{ world: WorldState; deviceId: string }>;
    };

    // Compilation (optional)
    lowering?: {
        handles: string[];
        lower: (op: TimelineOp, ctx: LowerContext) => RuntimeEvent[];
    };

    // Authoring (optional)
    dsl?: {
        createApi: (builder: BeatBuilder) => PluginDslApi;
    };

    // Assets (optional)
    assets?: {
        sounds?: Record<string, string>;
        icons?: Record<string, string>;
    };

    // Audio (optional)
    audioRules?: AutoSoundRule[];

    // Initial state (optional)
    createInitialState?: () => any;
}
```

---

## Creating a Plugin

### Step 1: Define Identity

```typescript
export const MyAppPlugin: TokovoPlugin<"app_myapp"> = {
    id: "app_myapp",
    version: "1.0.0",
    displayName: "My App",
    
    // ... rest of plugin
};
```

### Step 2: Implement Reducer

The reducer handles events for your app:

```typescript
reducer: (state, event) => {
    // Only handle our app's events
    if (event.kind !== "APP" || event.appId !== "app_myapp") {
        return;
    }

    const payload = (event as AppRuntimeEvent).payload;
    
    switch (event.type) {
        case "MESSAGE_RECEIVED": {
            const conv = state.conversations[payload.conversationId];
            if (conv) {
                conv.messages.push({
                    id: payload.message.id,
                    from: payload.from,
                    text: payload.text,
                    type: "text",
                    timestamp: new Date().toISOString()
                });
            }
            break;
        }
        
        case "TYPING_START": {
            const conv = state.conversations[payload.conversationId];
            if (conv) {
                conv.typing[payload.from] = true;
            }
            break;
        }
        
        case "TYPING_END": {
            const conv = state.conversations[payload.conversationId];
            if (conv) {
                delete conv.typing[payload.from];
            }
            break;
        }
    }
}
```

### Step 3: Implement Views

```typescript
views: {
    AppRoot: ({ world, deviceId }) => {
        const device = world.devices[deviceId];
        const appState = world.appState[device.foregroundAppId];
        
        // Get active conversation
        const conversationId = appState?.conversationId;
        const conversation = world.conversations[conversationId];
        
        if (!conversation) {
            return <ChatListScreen world={world} deviceId={deviceId} />;
        }
        
        return <ChatScreen conversation={conversation} />;
    }
}
```

### Step 4: Implement Lowering (Optional)

Convert IR ops to RuntimeEvents:

```typescript
lowering: {
    handles: ["MessageReceived", "MessageSent", "TypingStarted", "TypingEnded"],
    
    lower: (op, ctx) => {
        switch (op.kind) {
            case "MessageReceived":
                return [{
                    at: ctx.frame,
                    kind: "APP",
                    appId: "app_myapp",
                    type: "MESSAGE_RECEIVED",
                    deviceId: ctx.deviceId,
                    payload: {
                        from: op.actor,
                        text: op.text,
                        conversationId: ctx.conversationId,
                        message: {
                            id: `msg_${ctx.frame}`,
                            from: op.actor,
                            text: op.text,
                            type: "text"
                        }
                    }
                }];
                
            case "TypingStarted":
                return [{
                    at: ctx.frame,
                    kind: "APP",
                    appId: "app_myapp",
                    type: "TYPING_START",
                    deviceId: ctx.deviceId,
                    payload: {
                        from: op.actor,
                        conversationId: ctx.conversationId
                    }
                }];
                
            default:
                return [];
        }
    }
}
```

### Step 5: Implement DSL API (Optional)

Use the `b.use()` pattern:

```typescript
dsl: {
    createApi: (builder) => ({
        receive: (conversationId, opts) => {
            builder.ops.push({
                kind: "ReceiveMessage",
                actor: opts.from,
                text: opts.text,
                conversationId
            });
            return builder;
        },
        
        send: (conversationId, opts) => {
            builder.ops.push({
                kind: "SendMessage",
                actor: "me",
                text: opts.text,
                conversationId
            });
            return builder;
        },
        
        typing: (conversationId, actor, duration) => {
            builder.ops.push({ kind: "TypingStart", actor, conversationId });
            if (duration) {
                builder.ops.push({ kind: "Wait", duration });
                builder.ops.push({ kind: "TypingEnd", actor, conversationId });
            }
        }
    })
}
```

**Authors use it like:**

```typescript
d.beat("intro", b => {
    const app = b.use("app_myapp");
    app.receive("dm_user", { from: "User", text: "Hello!" });
    app.send("dm_user", { text: "Hey there!" });
});
```

---

## Audio Rules

Define automatic sound effects:

```typescript
audioRules: [
    {
        match: { kind: "APP", appId: "app_myapp", type: "MESSAGE_RECEIVED" },
        sound: "message_received",
        volume: 0.8
    },
    {
        match: { kind: "APP", appId: "app_myapp", type: "MESSAGE_SENT" },
        sound: "message_sent",
        volume: 0.7
    }
]
```

**Sound file locations:**

```
public/audio/app_myapp/
├── message_received.mp3
├── message_sent.mp3
└── typing.mp3
```

---

## Type Augmentation

Declare your payload types for TypeScript:

```typescript
// In src/augment.ts
declare module "@tokovo/core" {
    interface AppEventPayloads {
        app_myapp: {
            MESSAGE_RECEIVED: {
                from: string;
                text: string;
                conversationId: string;
                message: MyAppMessage;
            };
            MESSAGE_SENT: {
                text: string;
                conversationId: string;
                message: MyAppMessage;
            };
            TYPING_START: {
                from: string;
                conversationId: string;
            };
        };
    }
}
```

---

## Registering the Plugin

```typescript
import { prepareEpisode } from "@tokovo/core";
import { MyAppPlugin } from "@tokovo/apps-myapp";

const compiled = prepareEpisode(myEpisode, [MyAppPlugin]);
```

---

## Plugin Tiers

You don't have to implement everything. Choose a tier:

| Tier | Name | What's Required | Use Case |
|------|------|-----------------|----------|
| **A** | Runtime-only | reducer + views | Consume events, render UI |
| **B** | IR Lowering | + lowering | Support DSL compilation |
| **C** | Authoring | + DSL API | Full author experience |

**Start with Tier A**, add more as needed.

---

## Complete Example

```typescript
import type { TokovoPlugin } from "@tokovo/core";

export const MyAppPlugin: TokovoPlugin<"app_myapp"> = {
    id: "app_myapp",
    version: "1.0.0",
    displayName: "My App",

    reducer: (state, event) => {
        if (event.kind !== "APP" || event.appId !== "app_myapp") return;
        
        const payload = event.payload as any;
        const conv = state.conversations[payload.conversationId];
        
        switch (event.type) {
            case "MESSAGE_RECEIVED":
                conv?.messages.push(payload.message);
                break;
            case "TYPING_START":
                if (conv) conv.typing[payload.from] = true;
                break;
            case "TYPING_END":
                if (conv) delete conv.typing[payload.from];
                break;
        }
    },

    views: {
        AppRoot: ({ world, deviceId }) => {
            return <MyAppUI world={world} deviceId={deviceId} />;
        }
    },

    lowering: {
        handles: ["MessageReceived", "TypingStarted"],
        lower: (op, ctx) => [{
            at: ctx.frame,
            kind: "APP",
            appId: "app_myapp",
            type: op.kind === "MessageReceived" ? "MESSAGE_RECEIVED" : "TYPING_START",
            deviceId: ctx.deviceId,
            payload: { /* ... */ }
        }]
    },

    assets: {
        sounds: {
            message_received: "/audio/app_myapp/message_received.mp3",
            message_sent: "/audio/app_myapp/message_sent.mp3"
        }
    },

    audioRules: [
        { match: { type: "MESSAGE_RECEIVED" }, sound: "message_received" },
        { match: { type: "MESSAGE_SENT" }, sound: "message_sent" }
    ]
};
```
