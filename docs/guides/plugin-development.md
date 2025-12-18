# Plugin Development Guide

> **How to create custom app plugins for Tokovo.**

---

## Overview

Plugins extend Tokovo with new apps (WhatsApp, Twitter, Instagram, etc.). A plugin provides:

- **Reducer** - State updates for events
- **Views** - React components for rendering
- **V2 Lowering** - Convert IR to runtime events
- **TrackBuilder** - DSL authoring helpers
- **Assets** - Sounds, icons

---

## Plugin Contract

```typescript
interface TokovoPlugin {
    // Identity (required)
    appId: string;
    name: string;
    
    // Runtime (required)
    appView: React.FC<AppViewProps>;
    reducer: AppReducer;
    
    // Compilation (required for V2)
    v2Lowering: {
        eventTypes: string[];
        lower: (event: TrackEvent, ctx: LoweringContext) => RuntimeEvent;
    };
    
    // Optional
    notificationAdapter?: NotificationAdapter;
    anchors?: AnchorDefinition[];
    sounds?: SoundDefinition[];
    behaviors?: AppBehavior;
}
```

---

## Creating a Plugin

### Step 1: Define Identity

```typescript
export const MyApp: TokovoPlugin = {
    appId: "app_myapp",
    name: "My App",
    // ...
};
```

### Step 2: Implement Reducer

```typescript
reducer: (world, event, ctx) => {
    if (event.kind !== "APP" || event.appId !== "app_myapp") {
        return world;
    }
    
    switch (event.type) {
        case "MYAPP_MESSAGE":
            const conv = world.conversations[event.payload.conversationId];
            conv.messages.push(event.payload.message);
            return world;
            
        default:
            return world;
    }
}
```

### Step 3: Implement View

```typescript
appView: ({ world, t, deviceId }) => {
    const appState = world.appState["app_myapp"];
    const conversation = world.conversations[appState.activeConversation];
    
    return <ChatView messages={conversation.messages} />;
}
```

### Step 4: Implement V2 Lowering

```typescript
v2Lowering: {
    eventTypes: ["MYAPP_MESSAGE", "MYAPP_TYPING_START"],
    
    lower: (event, ctx) => ({
        ...event,
        kind: "APP",
        appId: "app_myapp",
        at: event.at,
        payload: event.payload,
    })
}
```

### Step 5: Create TrackBuilder

```typescript
export class MyAppTrackBuilder {
    private fps: number;
    private deviceId: string;
    private conversationId: string;
    readonly _events: TrackEvent[] = [];
    
    constructor(fps: number, deviceId: string, convId: string) {
        this.fps = fps;
        this.deviceId = deviceId;
        this.conversationId = convId;
    }
    
    at(time: string | number) {
        const frame = parseTimeToFrames(time, this.fps);
        return {
            receive: (sender: string, text: string) => {
                this._events.push({
                    at: frame,
                    kind: "APP",
                    appId: "app_myapp",
                    type: "MYAPP_MESSAGE",
                    payload: { sender, text, conversationId: this.conversationId }
                });
            }
        };
    }
}
```

---

## Plugin Tiers

| Tier | What's Required | Use Case |
|------|-----------------|----------|
| **A** | reducer + view | Just render |
| **B** | + v2Lowering | DSL compilation |
| **C** | + TrackBuilder | Full authoring |

Start with Tier A, add more as needed.

---

## Module Augmentation

Declare event types for TypeScript:

```typescript
// In your plugin
declare module "@tokovo/ir" {
    interface AppTrackEventRegistry {
        app_myapp: MyAppTrackEvent;
    }
}

export type MyAppTrackEvent = TrackEventBase & {
    kind: "APP";
    appId: "app_myapp";
} & (
    | { type: "MYAPP_MESSAGE"; payload: { sender: string; text: string } }
    | { type: "MYAPP_TYPING_START"; payload: { conversationId: string } }
);
```

---

## Registering Plugin

```typescript
import { PluginManager } from "@tokovo/core";
import { MyApp } from "@tokovo/apps-myapp";

PluginManager.register(MyApp);
```

---

## Audio Rules

Define automatic sounds:

```typescript
// In plugin audioRules
audioRules: [
    {
        match: { kind: "APP", appId: "app_myapp", type: "MYAPP_MESSAGE" },
        sound: "message_received",
        volume: 0.8
    }
]
```

---

## Semantic Anchors

Define focusable points:

```typescript
anchors: [
    {
        id: "message[last]",
        resolver: (world) => {
            const msgs = getMessages(world);
            return { x: 0.5, y: getMessageY(msgs[msgs.length - 1]) };
        }
    }
]
```

---

## Turbo Generator

Create a new plugin quickly:

```bash
pnpm turbo gen plugin
```

This generates the full package structure.

---

## Complete Example

```typescript
export const MyApp: TokovoPlugin = {
    appId: "app_myapp",
    name: "My App",
    
    appView: ({ world }) => <MyAppUI world={world} />,
    
    reducer: (world, event) => {
        if (event.appId !== "app_myapp") return world;
        // Handle events...
        return world;
    },
    
    v2Lowering: {
        eventTypes: ["MYAPP_MESSAGE"],
        lower: (event, ctx) => ({ ...event, kind: "APP" })
    },
    
    sounds: [
        { id: "message_received", url: "/audio/myapp/received.mp3" }
    ],
    
    anchors: [
        { id: "lastMessage", resolver: (w) => ({ x: 0.5, y: 0.8 }) }
    ]
};
```
