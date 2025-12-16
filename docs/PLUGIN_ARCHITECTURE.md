# 🧩 Tokovo Plugin Architecture: The App OS

> **Status:** Living Document
> **Version:** 2.0.0 (The Bible Edition)
> **Mental Model:** Locked
> **Word Count:** 3000+

---

## 1. The Vertical Slice Philosophy

Tokovo is an Operating System. Your app (WhatsApp, Twitter, Messages) is a **Plugin**.
We adhere strictly to the **Vertical Slice Architecture**.

**Why?**
In a traditional monorepo, you might have `components/`, `reducers/`, `assets/`.
In Tokovo, that is illegal.
A plugin package (e.g., `packages/apps-whatsapp`) must contain **EVERYTHING** it needs to exist. If you delete the folder, the app should vanish cleanly from the OS without breaking the build (other than configuration imports).

**The Golden Rule:**
> The Core Engine understands *App IDs*, but it knows *nothing* about "Chat Bubbles" or "Retweets". It delegates everything to the plugin via the Definition Contract.

---

## 2. Directory Structure (The Law)

Every plugin must follow this exact structure. No deviations.

```bash
packages/apps-whatsapp/
├── package.json          # definitions
├── src/
│   ├── index.ts          # THE ENTRY POINT (exports definePlugin)
│   ├── types.ts          # Local State Interfaces
│   ├── logic/
│   │   └── reducer.ts    # The Brain (State updates)
│   ├── ui/
│   │   ├── index.ts      # Exporting the Main View
│   │   └── components/   # React Components
│   ├── assets/
│   │   ├── icons/        # SVGs
│   │   ├── sounds.ts     # Sound mappings
│   │   └── metadata.ts   # App Name, Color
│   ├── adapters/
│   │   ├── anchors.ts    # Camera framing logic
│      └── notifications.ts # Push notification formatting
│   └── widgets/          # (Optional) Dynamic Island, Lockscreen
```

---

## 3. How to Think: The "3 Minds"

When building a plugin, you must wear three hats. Do not mix them.

### Mind 1: The Logician (The Reducer)
*   **Goal:** Manage State.
*   **Input:** `TimelineEvent`.
*   **Output:** `draft.apps.myapp`.
*   **Mantra:** "I don't care about pixels. I only care about truth."
*   **Anti-Pattern:** Storing UI state like "isAnimating" or "scrollPosition" in the reducer. The reducer handles *Business Logic* (Messages, Likes). UI State belongs in React.

### Mind 2: The Artist (The View)
*   **Goal:** Render Pixels.
*   **Input:** `WorldState`.
*   **Output:** `JSX`.
*   **Mantra:** "I must look perfect at 393px width."
*   **Responsibility:** You must handle both iOS and Android variants if your app supports them. Use `props.platform` to switch styles, or render distinct components (`IOSChat` vs `AndroidChat`).

### Mind 3: The Cinematographer (The Anchors)
*   **Goal:** Direct Attention.
*   **Input:** "Look at the last message."
*   **Output:** `{ x, y, width, height }`.
*   **Mantra:** "I must tell the camera where the action is."
*   **Critical:** If you don't define Anchors, the Camera is blind. It won't know how to zoom into your app.

---

## 4. The Definition Contract (`definePlugin`)

The heart of the system is `src/index.ts`.
It exports a single `TokovoPlugin` object using the `definePlugin` helper.

```typescript
// packages/apps-whatsapp/src/index.ts

export const WhatsAppPlugin = definePlugin({
    id: "app_whatsapp",
    name: "WhatsApp",
    version: "2.0.0",

    // 1. Metadata
    metadata: {
        themeColor: "#25D366",
        icon: "..." // SVG or Path
    },

    // 2. Logic (The Logician)
    reducer: whatsappReducer,

    // 3. View (The Artist)
    appView: ui.WhatsappChatView,

    // 4. Camera (The Cinematographer)
    anchors: WhatsAppAnchors.framing,
    getAnchors: WhatsAppAnchors.getAnchors,

    // 5. Extensions
    notificationAdapter: WhatsAppNotificationAdapter,
    widgets: [ /* Dynamic Island, etc */ ],
    
    // 6. Sound Effects (Registry)
    sounds: {
        "sent": "plugins/whatsapp/sent.wav"
    }
});
```

---

## 5. Implementation Guides (The "How-To")

### 5.1 Implementing Audio (The "Lock 1" Compliance)
**Warning:** Never use `<audio>` tags in your React components.
You must use the **Event-Driven Audio System**.

**Step A: Register Sounds**
In `src/assets/sounds.ts`:
```typescript
SoundRegistry.registerMany({
    "app_whatsapp.sent": "plugins/whatsapp/sent.wav",
    "app_whatsapp.typing": "plugins/whatsapp/typing_loop.wav"
});
```

**Step B: Define Rules**
In `src/assets/audio-rules.ts`:
```typescript
export const whatsappAudioRules: AutoSoundRule[] = [
    {
        // When this event happens...
        match: { kind: "APP", type: "MESSAGE_SENT" },
        // ...play this sound
        action: "PLAY_ONE_SHOT",
        sound: "app_whatsapp.sent"
    }
];
```

**Step C: Hooks**
In `src/index.ts`, register the rules:
```typescript
AutoSoundRegistry.register(whatsappAudioRules);
```

### 5.2 Implementing Anchors (Visual Semantics)
You need to tell the camera where things are. There are two ways.

**Strategy A: Static Framing (The Simple Way)**
For fixed UI elements (Header, Footer, Input).
Definition in `adapters/anchors.ts`:
```typescript
framing: {
    header: {
        anchorPoint: { x: 0.5, y: 0.1 }, // Top Center
        targetFill: 0.8 // Fill 80% of width
    },
    input: {
        anchorPoint: { x: 0.5, y: 0.9 }, // Bottom Center
        targetFill: 0.9
    }
}
```

**Strategy B: Dynamic Calculation (The Pro Way)**
For scrolling lists (Messages/Tweets).
You must calculate where the element is based on the *state*.
```typescript
getAnchors: (world, layout) => {
    // 1. Ask the Layout Engine for computed regions
    const regions = (layout as ChatLayoutState).regions;
    
    // 2. Map semantic IDs to physical rects
    return {
        anchors: {
            "lastMessage": regions["msg_123"].rect,
            "avatar": regions["avatar_123"].rect
        }
    };
}
```

### 5.3 Extending the DSL (`d.myapp`)
You want developers to write `d.whatsapp.message("Hi")`.
This requires **Module Augmentation**.

**Step A: Define the Builder**
Create `packages/dsl/src/author/whatsapp-builder.ts`:
```typescript
export class WhatsAppBuilder {
    constructor(private beat: BeatBuilder) {}

    message(text: string) {
        this.beat.push({
            kind: "APP",
            appId: "whatsapp",
            type: "MESSAGE_RECEIVED",
            payload: { text }
        });
    }
}
```

**Step B: Augment the Core DSL**
In `packages/dsl/src/index.ts` (or where `DeviceBuilder` is defined):
```typescript
declare module "./author/device-builder" {
    interface DeviceBuilder {
        whatsapp: WhatsAppBuilder;
    }
}

// Implement the getter
Object.defineProperty(DeviceBuilder.prototype, "whatsapp", {
    get() { return new WhatsAppBuilder(this.beat); }
});
```

---

## 6. Advanced Patterns: Platform Specifics

Your plugin must handle platform differences inside the **View Layer**.
Do not create separate plugins (`whatsapp-ios`, `whatsapp-android`).

**Pattern: The Split Component**
In `ui/WhatsappChatView.tsx`:

```typescript
export const WhatsappChatView: React.FC<AppViewProps> = (props) => {
    // 1. Logic is shared
    const messages = useMessages(props.world);

    // 2. Platform branching
    if (props.platform === "android") {
        return <AndroidChat messages={messages} />;
    }
    
    return <IOSChat messages={messages} />;
};
```
This keeps your business logic (hooks/reducers) DRY, while allowing completely different rendering trees for iOS vs Android fidelity.

---

## 7. Migration & Registry

**Bootstrapping:**
The core engine calls `PluginManager.register(WhatsAppPlugin)`.
This function automatically distributes your Vertical Slice:
*   `reducer` -> `ReducerRegistry`
*   `appView` -> `AppRegistry`
*   `widgets` -> `WidgetRegistry`
*   `metadata` -> `AppMetadataRegistry`

**Why this matters:**
It means you never have to manually edit `TokovoRenderer.tsx` or `engine.ts` to add a new app. You just register the plugin config, and the OS absorbs it.

---

## 8. Summary Checklist
Before shipping a plugin:
1.  [ ] **State Check:** Does the reducer handle all events?
2.  [ ] **View Check:** Does it render correctly at 393px width?
3.  [ ] **Audio Check:** Did you add `AutoSoundRules` for feedback?
4.  [ ] **Camera Check:** Did you implement `Anchors` so the director knows where to look?
5.  [ ] **Notification Check:** Did you implement `NotificationAdapter` for background alerts?
6.  [ ] **Export Check:** Is everything bundled in `definePlugin`?
