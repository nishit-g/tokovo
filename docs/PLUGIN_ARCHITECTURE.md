# 🧩 Tokovo Plugin Architecture: The Complete Guide

> **Status:** Living Document  
> **Version:** 3.0.0 (Post-Core-Cleanup Edition)  
> **Last Updated:** December 17, 2024  
> **Breaking Changes:** Core types removed, plugins own their data

---

## Table of Contents

1. [The Vertical Slice Philosophy](#1-the-vertical-slice-philosophy)
2. [Directory Structure](#2-directory-structure-the-law)
3. [The "4 Minds" Mental Model](#3-how-to-think-the-4-minds)
4. [Type System & Data Ownership](#4-type-system--data-ownership)
5. [The Definition Contract](#5-the-definition-contract-defineplugin)
6. [UI Strategy Pattern](#6-ui-strategy-pattern)
7. [Implementation Guides](#7-implementation-guides)
8. [Internationalization (i18n)](#8-internationalization-i18n)
9. [Platform Specifics](#9-advanced-patterns-platform-specifics)
10. [Registry & Bootstrap](#10-migration--registry)
11. [Complete Plugin Example](#11-complete-plugin-example)
12. [Checklist](#12-summary-checklist)

---

## 1. The Vertical Slice Philosophy

Tokovo is an **Operating System**. Your app (WhatsApp, Twitter, Instagram) is a **Plugin**.

We adhere strictly to the **Vertical Slice Architecture**:

> **If you delete the plugin folder, the app should vanish cleanly from the OS without breaking the build.**

### Core vs Plugin Boundary

```
┌─────────────────────────────────────────────────────────────────┐
│                        @tokovo/core                              │
│  • Devices (lock, unlock, open app)                              │
│  • Camera (zoom, pan, shake)                                     │
│  • Audio engine (play, stop, fade)                               │
│  • Event routing (dispatch to reducers)                          │
│  • WorldState container (generic Record<string, unknown>)        │
│                                                                  │
│  ❌ Core does NOT know about:                                    │
│  • Messages, Tweets, Posts                                       │
│  • Reactions, Likes, Retweets                                    │
│  • Chat bubbles, Avatars                                         │
│  • Any app-specific data structures                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Plugin (e.g., WhatsApp)                      │
│  • Types (Message, Conversation, Reaction)                       │
│  • Reducer (handles events, updates state)                       │
│  • UI Components (bubbles, headers, inputs)                      │
│  • UI Strategies (iOS, Android, Custom themes)                   │
│  • Assets (sounds, icons, metadata)                              │
│  • Adapters (anchors, notifications)                             │
│  • DSL extensions (d.whatsapp.message())                         │
│  • i18n strings                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### The Golden Rule

> The Core Engine understands *App IDs* and *event routing*.  
> It knows **NOTHING** about "Chat Bubbles" or "Retweets".  
> It delegates **EVERYTHING** to the plugin.

---

## 2. Directory Structure (The Law)

Every plugin **MUST** follow this exact structure:

```bash
packages/apps-whatsapp/
├── package.json                # Package definition
├── tsconfig.json               # TypeScript config
├── src/
│   ├── index.ts                # THE ENTRY POINT (exports plugin)
│   ├── types.ts                # ALL app-specific types (CRITICAL)
│   ├── augment.ts              # Module augmentation for type safety
│   │
│   ├── logic/
│   │   └── reducer.ts          # The Brain (state updates)
│   │
│   ├── ui/
│   │   ├── index.tsx           # Main view export
│   │   ├── ui-strategy.ts      # Strategy pattern interfaces
│   │   ├── strategies/
│   │   │   ├── index.ts        # Auto-register all strategies
│   │   │   ├── ios.tsx         # iOS strategy
│   │   │   └── android.tsx     # Android strategy
│   │   └── screens/
│   │       ├── ios/            # iOS-specific screens
│   │       └── android/        # Android-specific screens
│   │
│   ├── components/
│   │   ├── ios/                # iOS components
│   │   │   ├── Header.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── InputArea.tsx
│   │   │   └── TypingIndicator.tsx
│   │   └── android/            # Android components
│   │       ├── Header.tsx
│   │       ├── MessageBubble.tsx
│   │       ├── InputArea.tsx
│   │       └── TypingIndicator.tsx
│   │
│   ├── config/
│   │   ├── index.ts            # Config barrel export
│   │   ├── layout-config.ts    # UI constants
│   │   ├── colors.ts           # Color palettes
│   │   └── color-utils.ts      # Color helper functions
│   │
│   ├── assets/
│   │   ├── icons/              # SVG icons
│   │   ├── sounds.ts           # Sound mappings
│   │   ├── audio-rules.ts      # Auto-play rules
│   │   └── metadata.ts         # App name, color, icon
│   │
│   ├── adapters/
│   │   ├── anchors.ts          # Camera framing logic
│   │   └── notifications.ts    # Push notification formatting
│   │
│   ├── ir/                     # IR types & operations
│   │   └── group-ops.ts        # Custom operations
│   │
│   ├── dsl/                    # DSL extensions
│   │   └── group-builder.ts    # GroupBuilder class
│   │
│   ├── i18n/                   # Internationalization
│   │   ├── index.ts            # i18n barrel
│   │   ├── en.ts               # English strings
│   │   ├── es.ts               # Spanish strings
│   │   └── types.ts            # i18n type definitions
│   │
│   └── widgets/                # (Optional)
│       └── DynamicIsland.tsx   # Dynamic Island widget
```

---

## 3. How to Think: The "4 Minds"

When building a plugin, you must wear **four hats**. Never mix them.

### Mind 1: The Logician (The Reducer)

| Aspect | Details |
|--------|---------|
| **Goal** | Manage State |
| **Input** | `TimelineEvent` |
| **Output** | Mutate `draft.conversations`, `draft.appState` |
| **Mantra** | "I don't care about pixels. I only care about truth." |

**Anti-Patterns:**
- ❌ Storing UI state like `isAnimating` or `scrollPosition`
- ❌ Making assumptions about rendering
- ❌ Using `any` types - always use plugin types

```typescript
// ✅ CORRECT: Type-safe reducer
function getConversations(draft: WorldState): Record<string, WhatsAppConversation> {
    return draft.conversations as Record<string, WhatsAppConversation>;
}

export function whatsappReducer(draft: WorldState, event: TimelineEvent): void {
    const conversations = getConversations(draft);
    const chat = conversations[conversationId];
    
    // Fully typed - autocomplete works
    chat.messages.push({
        id: generateId(),
        from: "me",
        type: "text",
        text: "Hello!",
        status: "sending"
    });
}
```

### Mind 2: The Artist (The View)

| Aspect | Details |
|--------|---------|
| **Goal** | Render Pixels |
| **Input** | `WorldState` |
| **Output** | `JSX` |
| **Mantra** | "I must look perfect at 393px width." |

**Responsibilities:**
- Handle both iOS and Android via **UI Strategy Pattern**
- Use type-safe accessors to get data from WorldState
- Never store business state in React - only UI state

```typescript
// ✅ CORRECT: Type-safe view
import { getWhatsAppConversation, getWhatsAppMessages } from "@tokovo/apps-whatsapp";

export const ChatScreen: React.FC<ChatScreenProps> = ({ world }) => {
    const conversation = getWhatsAppConversation(world, "main");
    const messages = getWhatsAppMessages(world, "main");
    
    return (
        <div>
            {messages.map(msg => (
                <MessageBubble 
                    key={msg.id}
                    message={msg}  // Fully typed!
                    isMe={msg.from === "me"}
                />
            ))}
        </div>
    );
};
```

### Mind 3: The Cinematographer (The Anchors)

| Aspect | Details |
|--------|---------|
| **Goal** | Direct Attention |
| **Input** | "Look at the last message" |
| **Output** | `{ x, y, width, height }` |
| **Mantra** | "I must tell the camera where the action is." |

**Critical:** If you don't define Anchors, the Camera is blind!

```typescript
getAnchors: (world, layout) => {
    const chatLayout = layout as ChatLayoutState;
    return {
        anchors: {
            "lastMessage": chatLayout.messageLayouts["msg_123"].rect,
            "typingIndicator": chatLayout.typingLayout?.rect
        }
    };
}
```

### Mind 4: The Translator (i18n)

| Aspect | Details |
|--------|---------|
| **Goal** | Speak User's Language |
| **Input** | String keys |
| **Output** | Localized strings |
| **Mantra** | "No hardcoded strings in components." |

```typescript
// ✅ CORRECT: Use i18n
const t = useTranslation("whatsapp");
return <span>{t("typing_indicator")}</span>;  // "typing..." or "escribiendo..."
```

---

## 4. Type System & Data Ownership

### The Core Contract

Core provides a **minimal, generic** `WorldState`:

```typescript
// @tokovo/core/src/types.ts

export interface WorldState {
    devices: Record<DeviceId, DeviceState>;
    
    // App-specific data - plugins cast to their own types
    conversations: Record<string, unknown>;
    appState: Record<string, unknown>;
    
    // Engine primitives
    camera: CameraState;
    audio: AudioState;
    config?: VideoConfig;
    touches?: TouchState[];
}
```

### Plugin Types

Each plugin defines its **own complete type system**:

```typescript
// packages/apps-whatsapp/src/types.ts

// Message types
export type WhatsAppMessageType = 
    | "text" | "image" | "video" | "voice" 
    | "system" | "gif" | "deleted"
    | "call_missed" | "screenshot_alert";

export interface WhatsAppMessage {
    id: string;
    from: string;
    type: WhatsAppMessageType;
    text?: string;
    imageUrl?: string;
    reactions?: WhatsAppReaction[];
    replyTo?: ReplyToData;
    linkPreview?: LinkPreviewData;
    status?: "sending" | "sent" | "delivered" | "read";
    timestamp?: string;
    at?: number;
    // ... all WhatsApp-specific fields
}

// Conversation type
export interface WhatsAppConversation {
    id: string;
    type?: "dm" | "group";
    name?: string;
    avatar?: string;
    members?: WhatsAppGroupMember[];
    messages: WhatsAppMessage[];
    typing?: Record<string, boolean>;
    unreadCount?: number;
}

// App state
export interface WhatsAppState {
    conversationId?: string;
    screen?: string;
    viewMode?: "CHAT" | "LIST" | "TRANSITION";
}
```

### Type-Safe Accessors

**ALWAYS** use accessor functions instead of raw casts:

```typescript
// packages/apps-whatsapp/src/augment.ts

import { WorldState } from "@tokovo/core";
import { WhatsAppConversation, WhatsAppState, WhatsAppMessage } from "./types";

/**
 * Get all WhatsApp conversations with type safety.
 */
export function getWhatsAppConversations(
    world: WorldState
): Record<string, WhatsAppConversation> {
    return world.conversations as Record<string, WhatsAppConversation>;
}

/**
 * Get a single conversation.
 */
export function getWhatsAppConversation(
    world: WorldState,
    conversationId: string
): WhatsAppConversation | undefined {
    return world.conversations[conversationId] as WhatsAppConversation | undefined;
}

/**
 * Get messages from a conversation.
 */
export function getWhatsAppMessages(
    world: WorldState,
    conversationId: string
): WhatsAppMessage[] {
    const conv = getWhatsAppConversation(world, conversationId);
    return (conv?.messages || []) as WhatsAppMessage[];
}

/**
 * Get WhatsApp app state.
 */
export function getWhatsAppAppState(
    world: WorldState
): WhatsAppState | undefined {
    return (
        (world.appState?.app_whatsapp as WhatsAppState) || 
        (world.appState?.whatsapp as WhatsAppState)
    );
}
```

### Usage in Components

```typescript
import { 
    getWhatsAppConversation,
    getWhatsAppMessages,
    getWhatsAppAppState
} from "@tokovo/apps-whatsapp";

const ChatScreen: React.FC<{ world: WorldState }> = ({ world }) => {
    // Type-safe access
    const appState = getWhatsAppAppState(world);
    const conversationId = appState?.conversationId || "main";
    
    const conversation = getWhatsAppConversation(world, conversationId);
    const messages = getWhatsAppMessages(world, conversationId);
    
    // Full autocomplete works!
    return (
        <div>
            <Header name={conversation?.name || "Unknown"} />
            {messages.map(msg => (
                <MessageBubble
                    key={msg.id}
                    text={msg.text}           // TypeScript knows this exists
                    reactions={msg.reactions} // TypeScript knows this exists
                    status={msg.status}       // TypeScript knows this exists
                />
            ))}
        </div>
    );
};
```

---

## 5. The Definition Contract (`definePlugin`)

The heart of the system is `src/index.ts`:

```typescript
// packages/apps-whatsapp/src/index.ts

import { APP_IDS, definePlugin, AutoSoundRegistry } from "@tokovo/core";
import { whatsappReducer } from "./logic/reducer";
import { ui } from "./ui";
import { WhatsAppAnchors } from "./adapters/anchors";
import { WhatsAppMetadata } from "./assets/metadata";
import { WhatsAppNotificationAdapter } from "./adapters/notifications";
import { whatsappAudioRules } from "./assets/audio-rules";

// Register audio rules
AutoSoundRegistry.register(whatsappAudioRules);

// Import strategies to auto-register
import "./ui/strategies";

// Export types and accessors for external use
export * from "./types";
export * from "./augment";
export * from "./ui/ui-strategy";

// Define the plugin
export const WhatsAppPlugin = definePlugin({
    id: APP_IDS.WHATSAPP,          // "app_whatsapp"
    name: "WhatsApp",
    version: "3.0.0",

    // 1. Metadata
    metadata: WhatsAppMetadata,

    // 2. Logic (The Logician)
    reducer: whatsappReducer,

    // 3. View (The Artist)
    appView: ui.WhatsappChatView,

    // 4. Camera (The Cinematographer)
    anchors: WhatsAppAnchors.framing,
    getAnchors: WhatsAppAnchors.getAnchors,

    // 5. Extensions
    notificationAdapter: WhatsAppNotificationAdapter,
    
    // 6. Custom event types this plugin handles
    eventTypes: [
        "GROUP_MEMBER_ADDED",
        "GROUP_MEMBER_REMOVED",
        "VOICE_MESSAGE_RECEIVED"
    ]
});

export default WhatsAppPlugin;
```

---

## 6. UI Strategy Pattern

The **UI Strategy Pattern** enables platform-specific rendering with easy extensibility for custom themes.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UIStrategyRegistry                        │
│   • register(strategy)                                       │
│   • get(id): UIStrategy                                      │
│   • forPlatform("ios" | "android"): UIStrategy               │
│   • list(): string[]                                         │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┬──────────────┐
            ▼               ▼               ▼              ▼
    ┌───────────┐   ┌───────────────┐   ┌────────────┐  ┌─────────┐
    │ iOS       │   │ Android       │   │ Ghibli     │  │ Dark    │
    │ Strategy  │   │ Strategy      │   │ Theme      │  │ Mode    │
    └───────────┘   └───────────────┘   └────────────┘  └─────────┘
         │                 │
         ▼                 ▼
    ┌─────────┐       ┌─────────┐
    │ Header  │       │ Header  │
    │ Bubble  │       │ Bubble  │
    │ Typing  │       │ Typing  │
    │ Input   │       │ Input   │
    └─────────┘       └─────────┘
```

### Strategy Interface

```typescript
// packages/apps-whatsapp/src/ui/ui-strategy.ts

export interface UIStrategy {
    /** Unique identifier */
    id: string;
    
    /** Display name */
    name: string;
    
    /** Platform: "ios" | "android" | "custom" */
    platform: "ios" | "android" | "custom";
    
    // Component factory methods
    Header: React.FC<HeaderProps>;
    MessageBubble: React.FC<MessageBubbleProps>;
    TypingIndicator: React.FC<TypingIndicatorProps>;
    InputArea: React.FC<InputAreaProps>;
    
    // Theme tokens
    tokens: UIThemeTokens;
}

export interface UIThemeTokens {
    backgroundColor: string;
    bubbleMyBg: string;
    bubbleOtherBg: string;
    textColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
}
```

### Implementing a Strategy

```typescript
// packages/apps-whatsapp/src/ui/strategies/ios.tsx

import { UIStrategy, UIStrategyRegistry } from "../ui-strategy";
import { Header } from "../../components/ios/Header";
import { MessageBubble } from "../../components/ios/MessageBubble";
import { TypingIndicator } from "../../components/ios/TypingIndicator";
import { InputArea } from "../../components/ios/InputArea";

export const iOSStrategy: UIStrategy = {
    id: "whatsapp-ios",
    name: "WhatsApp iOS",
    platform: "ios",
    
    // Components
    Header: IOSHeader,
    MessageBubble: IOSMessageBubble,
    TypingIndicator: IOSTypingIndicator,
    InputArea: IOSInputArea,
    
    // iOS Theme Tokens
    tokens: {
        backgroundColor: "#ECE5DD",
        bubbleMyBg: "#DCF8C6",
        bubbleOtherBg: "#FFFFFF",
        textColor: "#111B21",
        secondaryColor: "#667781",
        accentColor: "#00A884",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
    }
};

// Auto-register on import
UIStrategyRegistry.register(iOSStrategy);
```

### Using Strategies

```typescript
import { UIStrategyRegistry } from "@tokovo/apps-whatsapp";
import "@tokovo/apps-whatsapp/ui/strategies";  // Auto-registers strategies

const ChatScreen: React.FC<{ platform: "ios" | "android" }> = ({ platform }) => {
    // Get the right strategy for the platform
    const strategy = UIStrategyRegistry.forPlatform(platform);
    
    return (
        <div style={{ backgroundColor: strategy.tokens.backgroundColor }}>
            <strategy.Header conversation={conversation} safeAreaTop={48} />
            
            {messages.map(msg => (
                <strategy.MessageBubble
                    key={msg.id}
                    message={msg}
                    isMe={msg.from === "me"}
                    isFirst
                    isLast
                />
            ))}
            
            <strategy.TypingIndicator 
                typingMembers={typingMembers} 
                isGroupChat={isGroup} 
            />
            
            <strategy.InputArea 
                text={draftText} 
                showCursor={isFocused} 
                safeAreaBottom={34} 
            />
        </div>
    );
};
```

### Adding a Custom Theme

```typescript
// packages/apps-whatsapp/src/ui/strategies/ghibli.tsx

export const ghibliStrategy: UIStrategy = {
    id: "whatsapp-ghibli",
    name: "Ghibli Theme",
    platform: "custom",
    
    Header: GhibliHeader,
    MessageBubble: GhibliMessageBubble,
    TypingIndicator: GhibliTypingIndicator,
    InputArea: GhibliInputArea,
    
    tokens: {
        backgroundColor: "#F5E6D3",   // Warm paper
        bubbleMyBg: "#A8D5BA",        // Soft green (Totoro forest)
        bubbleOtherBg: "#FFF8DC",     // Cream
        textColor: "#3D3D3D",         // Soft black
        secondaryColor: "#8B7355",    // Brown
        accentColor: "#6B8E4E",       // Forest green
        fontFamily: "'Kosugi Maru', sans-serif",
    }
};

UIStrategyRegistry.register(ghibliStrategy);

// Usage: UIStrategyRegistry.get("whatsapp-ghibli")
```

---

## 7. Implementation Guides

### 7.1 Audio (Event-Driven System)

**⚠️ Warning:** Never use `<audio>` tags in React components.

**Step A: Register Sounds**

```typescript
// src/assets/sounds.ts
import { SoundRegistry } from "@tokovo/core";

SoundRegistry.registerMany({
    "app_whatsapp.sent": "/sounds/whatsapp/sent.mp3",
    "app_whatsapp.received": "/sounds/whatsapp/received.mp3",
    "app_whatsapp.typing": "/sounds/whatsapp/typing.mp3"
});
```

**Step B: Define Auto-Play Rules**

```typescript
// src/assets/audio-rules.ts
import { AutoSoundRule } from "@tokovo/core";

export const whatsappAudioRules: AutoSoundRule[] = [
    {
        match: { kind: "APP", appId: "app_whatsapp", type: "MESSAGE_SENT" },
        action: "PLAY_ONE_SHOT",
        sound: "app_whatsapp.sent"
    },
    {
        match: { kind: "APP", appId: "app_whatsapp", type: "MESSAGE_RECEIVED" },
        action: "PLAY_ONE_SHOT",
        sound: "app_whatsapp.received"
    },
    {
        match: { kind: "APP", appId: "app_whatsapp", type: "TYPING_START" },
        action: "PLAY_LOOP",
        sound: "app_whatsapp.typing"
    },
    {
        match: { kind: "APP", appId: "app_whatsapp", type: "TYPING_END" },
        action: "STOP",
        sound: "app_whatsapp.typing"
    }
];
```

**Step C: Register in index.ts**

```typescript
import { AutoSoundRegistry } from "@tokovo/core";
import { whatsappAudioRules } from "./assets/audio-rules";

AutoSoundRegistry.register(whatsappAudioRules);
```

### 7.2 Anchors (Camera Framing)

**Strategy A: Static Framing**

```typescript
// src/adapters/anchors.ts

export const WhatsAppAnchors = {
    framing: {
        header: {
            anchorPoint: { x: 0.5, y: 0.1 },
            targetFill: 0.8
        },
        input: {
            anchorPoint: { x: 0.5, y: 0.9 },
            targetFill: 0.9
        }
    },
    
    getAnchors: (world: WorldState, layout: LayoutState) => {
        const chatLayout = layout as ChatLayoutState;
        const anchors: Record<string, Rect> = {};
        
        // Add message anchors
        Object.entries(chatLayout.messageLayouts).forEach(([id, msgLayout]) => {
            if (msgLayout.rect) {
                anchors[`msg_${id}`] = msgLayout.rect;
            }
        });
        
        // Add typing indicator anchor
        if (chatLayout.typingLayout?.rect) {
            anchors["typing"] = chatLayout.typingLayout.rect;
        }
        
        return { anchors };
    }
};
```

### 7.3 Notifications

```typescript
// src/adapters/notifications.ts

export const WhatsAppNotificationAdapter = {
    formatNotification: (event: TimelineEvent): NotificationData | null => {
        if (event.type !== "MESSAGE_RECEIVED") return null;
        
        const appEvent = event as any;
        return {
            id: `whatsapp_${appEvent.conversationId}_${Date.now()}`,
            appId: "app_whatsapp",
            title: appEvent.from || "Unknown",
            body: appEvent.message?.text || "New message",
            icon: "/icons/whatsapp.png",
            sound: "app_whatsapp.received"
        };
    }
};
```

### 7.4 DSL Extensions (Module Augmentation)

**Step A: Create Builder**

```typescript
// src/dsl/group-builder.ts

export class GroupBuilder {
    constructor(private beat: BeatBuilder, private conversationId: string) {}

    addMember(member: WhatsAppGroupMember, addedBy: string = "me") {
        this.beat.customOp("whatsapp", "GROUP_MEMBER_ADDED", {
            conversationId: this.conversationId,
            member,
            addedBy
        });
        return this;
    }

    removeMember(memberId: string, memberName: string, removedBy: string = "admin") {
        this.beat.customOp("whatsapp", "GROUP_MEMBER_REMOVED", {
            conversationId: this.conversationId,
            memberId,
            memberName,
            removedBy
        });
        return this;
    }
}
```

**Step B: Module Augmentation**

```typescript
// src/dsl/dsl-augment.ts

declare module "@tokovo/dsl" {
    interface DeviceBuilder {
        whatsappGroup(conversationId: string): GroupBuilder;
    }
}

// Implementation
Object.defineProperty(DeviceBuilder.prototype, "whatsappGroup", {
    value: function(conversationId: string) {
        return new GroupBuilder(this.beat, conversationId);
    }
});
```

**Usage:**

```typescript
// In DSL script
d.device1.whatsappGroup("family")
    .addMember({ id: "mom", name: "Mom" }, "me")
    .addMember({ id: "dad", name: "Dad" }, "me");
```

---

## 8. Internationalization (i18n)

Every plugin should support internationalization for system messages and UI strings.

### Directory Structure

```bash
src/i18n/
├── index.ts        # Barrel export + useTranslation hook
├── types.ts        # Type definitions
├── en.ts           # English strings
├── es.ts           # Spanish strings
├── hi.ts           # Hindi strings
└── ja.ts           # Japanese strings
```

### Type Definitions

```typescript
// src/i18n/types.ts

export interface WhatsAppStrings {
    // System messages
    "system.member_added": string;          // "{actor} added {member}"
    "system.member_removed": string;        // "{actor} removed {member}"
    "system.member_left": string;           // "{member} left"
    "system.group_created": string;         // "{actor} created group \"{name}\""
    "system.admin_promoted": string;        // "{actor} made {member} an admin"
    
    // UI strings
    "typing.single": string;                // "typing..."
    "typing.multiple": string;              // "{name1} and {name2} are typing..."
    "typing.many": string;                  // "{count} people typing..."
    
    // Input placeholder
    "input.placeholder": string;            // "Message"
    
    // Status
    "status.online": string;                // "online"
    "status.offline": string;               // "offline"
    "status.last_seen": string;             // "last seen {time}"
    
    // Message status
    "message.sending": string;              // "Sending..."
    "message.sent": string;                 // "Sent"
    "message.delivered": string;            // "Delivered"
    "message.read": string;                 // "Read"
    
    // Time
    "time.today": string;                   // "Today"
    "time.yesterday": string;               // "Yesterday"
}
```

### String Files

```typescript
// src/i18n/en.ts
import { WhatsAppStrings } from "./types";

export const en: WhatsAppStrings = {
    "system.member_added": "{actor} added {member}",
    "system.member_removed": "{actor} removed {member}",
    "system.member_left": "{member} left",
    "system.group_created": "{actor} created group \"{name}\"",
    "system.admin_promoted": "{actor} made {member} an admin",
    
    "typing.single": "typing...",
    "typing.multiple": "{name1} and {name2} are typing...",
    "typing.many": "{count} people typing...",
    
    "input.placeholder": "Message",
    
    "status.online": "online",
    "status.offline": "offline",
    "status.last_seen": "last seen {time}",
    
    "message.sending": "Sending...",
    "message.sent": "Sent",
    "message.delivered": "Delivered",
    "message.read": "Read",
    
    "time.today": "Today",
    "time.yesterday": "Yesterday"
};
```

```typescript
// src/i18n/es.ts
import { WhatsAppStrings } from "./types";

export const es: WhatsAppStrings = {
    "system.member_added": "{actor} añadió a {member}",
    "system.member_removed": "{actor} eliminó a {member}",
    "system.member_left": "{member} salió",
    "system.group_created": "{actor} creó el grupo \"{name}\"",
    "system.admin_promoted": "{actor} hizo admin a {member}",
    
    "typing.single": "escribiendo...",
    "typing.multiple": "{name1} y {name2} están escribiendo...",
    "typing.many": "{count} personas escribiendo...",
    
    "input.placeholder": "Mensaje",
    
    "status.online": "en línea",
    "status.offline": "desconectado",
    "status.last_seen": "últ. vez {time}",
    
    "message.sending": "Enviando...",
    "message.sent": "Enviado",
    "message.delivered": "Entregado",
    "message.read": "Leído",
    
    "time.today": "Hoy",
    "time.yesterday": "Ayer"
};
```

### i18n Hook & Utilities

```typescript
// src/i18n/index.ts
import { en } from "./en";
import { es } from "./es";
import { hi } from "./hi";
import { ja } from "./ja";
import { WhatsAppStrings } from "./types";

const locales: Record<string, WhatsAppStrings> = { en, es, hi, ja };

let currentLocale = "en";

export function setLocale(locale: string) {
    if (locales[locale]) {
        currentLocale = locale;
    }
}

export function t(key: keyof WhatsAppStrings, params?: Record<string, string | number>): string {
    const strings = locales[currentLocale] || locales.en;
    let result = strings[key] || key;
    
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            result = result.replace(`{${k}}`, String(v));
        });
    }
    
    return result;
}

// React hook
export function useTranslation() {
    return { t, locale: currentLocale };
}

export * from "./types";
```

### Usage in Components

```typescript
import { t } from "../i18n";

const SystemMessage: React.FC<{ message: WhatsAppMessage }> = ({ message }) => {
    let text = "";
    
    switch (message.systemType) {
        case "member_added":
            text = t("system.member_added", {
                actor: message.actorName || "Someone",
                member: message.targetMember || "a member"
            });
            break;
        case "member_removed":
            text = t("system.member_removed", {
                actor: message.actorName || "Someone",
                member: message.targetMember || "a member"
            });
            break;
        // ...
    }
    
    return <div className="system-message">{text}</div>;
};
```

### Usage in Reducer (System Messages)

```typescript
// In reducer when generating system messages
import { t } from "../i18n";

const systemText = t("system.member_added", {
    actor: payload.addedBy === "me" ? "You" : payload.addedBy,
    member: payload.member.name
});

conversation.messages.push({
    id: `sys_${event.at}_added`,
    from: "system",
    type: "system",
    systemType: "member_added",
    text: systemText,
    at: event.at
});
```

---

## 9. Advanced Patterns: Platform Specifics

### The Strategy Pattern Approach (Recommended)

```typescript
// In your screen component
const ChatScreen: React.FC<{ platform: "ios" | "android" }> = ({ platform }) => {
    const strategy = UIStrategyRegistry.forPlatform(platform);
    
    return (
        <div style={{ backgroundColor: strategy.tokens.backgroundColor }}>
            <strategy.Header {...headerProps} />
            <MessageList MessageBubble={strategy.MessageBubble} />
            <strategy.TypingIndicator {...typingProps} />
            <strategy.InputArea {...inputProps} />
        </div>
    );
};
```

### Alternative: Platform-Specific Screens

For complex apps with significantly different UX per platform:

```bash
src/ui/screens/
├── ios/
│   ├── ChatScreen.tsx      # iOS-specific layout
│   └── ChatListScreen.tsx
└── android/
    ├── ChatScreen.tsx      # Android-specific layout
    └── ChatListScreen.tsx
```

```typescript
// src/ui/index.tsx
import { IOSChatScreen } from "./screens/ios/ChatScreen";
import { AndroidChatScreen } from "./screens/android/ChatScreen";

export const WhatsappChatView: React.FC<AppViewProps> = (props) => {
    if (props.platform === "android") {
        return <AndroidChatScreen {...props} />;
    }
    return <IOSChatScreen {...props} />;
};
```

---

## 10. Migration & Registry

### Bootstrapping

The core engine calls `PluginManager.register(WhatsAppPlugin)`:

```typescript
// This happens automatically in your app's entry point
import { PluginManager } from "@tokovo/core";
import { WhatsAppPlugin } from "@tokovo/apps-whatsapp";

PluginManager.register(WhatsAppPlugin);
```

### What Gets Registered

| Part | Registry | Purpose |
|------|----------|---------|
| `reducer` | `ReducerRegistry` | Handles events |
| `appView` | `AppRegistry` | Renders UI |
| `widgets` | `WidgetRegistry` | Dynamic Island, etc. |
| `metadata` | `AppMetadataRegistry` | Icon, color, name |
| `anchors` | Stored on plugin | Camera framing |
| `notificationAdapter` | Stored on plugin | Push formatting |

### Why This Matters

You never have to manually edit `TokovoRenderer.tsx` or `engine.ts` to add a new app. Just register the plugin, and the OS absorbs it.

---

## 11. Complete Plugin Example

Here's a minimal but complete plugin for a hypothetical "Notes" app:

```typescript
// packages/apps-notes/src/types.ts

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    color?: string;
}

export interface NotesConversation {
    id: string;
    notes: Note[];
}

export interface NotesState {
    selectedNoteId?: string;
    isEditing: boolean;
}

// Type-safe accessors
export function getNotesConversations(world: WorldState): Record<string, NotesConversation> {
    return world.conversations as Record<string, NotesConversation>;
}

export function getNotesAppState(world: WorldState): NotesState | undefined {
    return world.appState?.app_notes as NotesState | undefined;
}
```

```typescript
// packages/apps-notes/src/logic/reducer.ts

import { WorldState, TimelineEvent, APP_IDS } from "@tokovo/core";
import { NotesConversation, Note } from "../types";

function getConversations(draft: WorldState): Record<string, NotesConversation> {
    return draft.conversations as Record<string, NotesConversation>;
}

export function notesReducer(draft: WorldState, event: TimelineEvent): void {
    if (event.kind !== "APP") return;
    if ((event as any).appId !== APP_IDS.NOTES) return;
    
    const conversations = getConversations(draft);
    const eventType = event.type as string;
    
    switch (eventType) {
        case "NOTE_CREATED": {
            const payload = (event as any);
            if (!conversations[payload.folderId]) {
                conversations[payload.folderId] = { id: payload.folderId, notes: [] };
            }
            conversations[payload.folderId].notes.push({
                id: payload.id,
                title: payload.title,
                content: payload.content || "",
                createdAt: event.at,
                updatedAt: event.at,
                color: payload.color
            });
            break;
        }
        
        case "NOTE_UPDATED": {
            const payload = (event as any);
            const folder = conversations[payload.folderId];
            if (folder) {
                const note = folder.notes.find(n => n.id === payload.id);
                if (note) {
                    if (payload.title) note.title = payload.title;
                    if (payload.content) note.content = payload.content;
                    if (payload.color) note.color = payload.color;
                    note.updatedAt = event.at;
                }
            }
            break;
        }
        
        case "NOTE_DELETED": {
            const payload = (event as any);
            const folder = conversations[payload.folderId];
            if (folder) {
                folder.notes = folder.notes.filter(n => n.id !== payload.id);
            }
            break;
        }
    }
}
```

```typescript
// packages/apps-notes/src/index.ts

import { definePlugin, APP_IDS } from "@tokovo/core";
import { notesReducer } from "./logic/reducer";
import { NotesView } from "./ui";

export * from "./types";

export const NotesPlugin = definePlugin({
    id: APP_IDS.NOTES,
    name: "Notes",
    version: "1.0.0",
    
    metadata: {
        themeColor: "#FFCC00",
        icon: "notes-icon.svg"
    },
    
    reducer: notesReducer,
    appView: NotesView,
    
    eventTypes: [
        "NOTE_CREATED",
        "NOTE_UPDATED",
        "NOTE_DELETED"
    ]
});

export default NotesPlugin;
```

---

## 12. Summary Checklist

Before shipping a plugin, verify:

### Core Requirements
- [ ] **Types:** All app-specific types in `types.ts`
- [ ] **Accessors:** Type-safe accessor functions in `augment.ts`
- [ ] **Reducer:** Handles all events with type safety
- [ ] **View:** Renders correctly at 393px width

### Platform Support
- [ ] **iOS Strategy:** Registered with correct components
- [ ] **Android Strategy:** Registered with correct components
- [ ] **Tokens:** Theme tokens defined for both platforms

### Extensions
- [ ] **Audio:** `AutoSoundRules` for feedback effects
- [ ] **Anchors:** Camera knows where to look
- [ ] **Notifications:** `NotificationAdapter` for background alerts

### i18n
- [ ] **Strings:** At least `en.ts` defined
- [ ] **System Messages:** Using `t()` function

### Export
- [ ] **Plugin:** Exported via `definePlugin`
- [ ] **Types:** All public types exported
- [ ] **Accessors:** All accessor functions exported
- [ ] **Strategy:** UI strategies registered on import

---

## Appendix: File Template

Use this as a starting point for new plugins:

```bash
npx @tokovo/create-plugin my-app
```

This will scaffold:
- `package.json`
- `tsconfig.json`
- `src/index.ts`
- `src/types.ts`
- `src/augment.ts`
- `src/logic/reducer.ts`
- `src/ui/index.tsx`
- `src/ui/ui-strategy.ts`
- `src/ui/strategies/ios.tsx`
- `src/components/ios/`
- `src/assets/metadata.ts`
- `src/i18n/en.ts`

---

*Last updated: December 17, 2024*
