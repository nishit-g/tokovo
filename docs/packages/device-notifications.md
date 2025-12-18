# @tokovo/device-notifications

> **Enterprise Notification System for Tokovo**  
> **Version**: 1.0.0  
> **Status**: Production Ready

---

## Overview

The `@tokovo/device-notifications` package provides a complete notification system for Tokovo. It follows the **single package ownership** pattern where one package owns all notification logic: DSL, types, lowering, reducer, scheduler, views, and visual strategies.

### Key Principles

| Principle | Implementation |
|-----------|----------------|
| Single Source of Truth | One reducer in one package |
| Canonical Types | Flat `NotificationInstance` (no nesting) |
| Registry Pattern | Extensible via registries |
| Auto-Registration | Plugin registers on import |

---

## Package Structure

```
@tokovo/device-notifications
├── src/
│   ├── index.ts                   # Barrel exports + auto-registration
│   ├── plugin.ts                  # Plugin contract + registration
│   │
│   ├── types/
│   │   ├── index.ts               # NotificationIR, NotificationInstance
│   │   ├── payloads.ts            # Event payloads
│   │   └── adapter-types.ts       # Adapter interface
│   │
│   ├── dsl/
│   │   └── track-builder.ts       # NotificationTrackBuilder
│   │
│   ├── ir/
│   │   └── track-event.ts         # Typed IR events
│   │
│   ├── lowering/
│   │   └── handler.ts             # IR → Runtime events
│   │
│   ├── reducer.ts                 # State management
│   ├── scheduler.ts               # Heads-up queue logic
│   │
│   ├── adapters/
│   │   └── registry.ts            # NotificationAdapterRegistry
│   │
│   ├── registries/
│   │   ├── index.ts               # Registry exports
│   │   └── strategy.ts            # NotificationStrategyRegistry
│   │
│   ├── views/
│   │   └── HeadsUpNotification.tsx
│   │
│   ├── strategies/
│   │   ├── IOSNotificationStrategy.tsx
│   │   └── AndroidNotificationStrategy.tsx
│   │
│   └── assets/
│       └── audio-rules.ts         # Auto-sound rules
```

---

## Quick Start

### 1. Import (Auto-Registers)

```typescript
import { NotificationTrackBuilder } from "@tokovo/device-notifications";
```

The package auto-registers its reducer, audio rules, and default strategies on import.

### 2. Create Notifications in Episodes

```typescript
const noti = new NotificationTrackBuilder(30, "phone", getOrder);

noti.at("2s").show({
    appId: "app_whatsapp",
    title: "Alex 👋",
    body: "Hey! How are you?",
    mode: "headsup",
    priority: "high",
});

noti.at("5s").dismiss("notif_1");
noti.at("8s").clearAll();
```

### 3. Use in Episode

```typescript
export function notificationDemoEpisode() {
    const noti = new NotificationTrackBuilder(30, "phone", getOrder);
    
    // Add notifications...
    
    return {
        initialWorld: { ... },
        events: [...noti._events],
    };
}
```

---

## API Reference

### NotificationTrackBuilder

```typescript
const noti = new NotificationTrackBuilder(fps, deviceId, getOrder);

// Navigate to a point in time
noti.at("2s")              // At 2 seconds
noti.at("500ms")           // At 500 milliseconds
noti.at(60)                // At frame 60
```

### NotificationPointBuilder Methods

| Method | Description | Example |
|--------|-------------|---------|
| `.show(opts)` | Display a notification | `noti.at("2s").show({ appId: "app_whatsapp", title: "Alex", body: "Hey!" })` |
| `.dismiss(id)` | Dismiss a notification | `noti.at("5s").dismiss("notif_1")` |
| `.tap(id)` | Simulate tap action | `noti.at("4s").tap("notif_1")` |
| `.swipe(id, dir, action)` | Swipe gesture | `noti.at("4s").swipe("notif_1", "left", "dismiss")` |
| `.dynamicIsland(opts)` | Dynamic Island state | `noti.at("2s").dynamicIsland({ mode: "compact" })` |
| `.openPanel()` | Open notification shade | `noti.at("10s").openPanel()` |
| `.closePanel()` | Close notification shade | `noti.at("15s").closePanel()` |
| `.clearAll()` | Clear all notifications | `noti.at("20s").clearAll()` |

### Show Notification Options

```typescript
interface ShowNotificationPayload {
    id?: string;                     // Auto-generated if not provided
    appId: string;                   // Required: app that owns this notification
    title: string;                   // Required: notification title
    body: string;                    // Required: notification body
    mode?: "headsup" | "lockscreen" | "both" | "silent";
    priority?: "low" | "default" | "high" | "urgent";
    icon?: string;                   // App icon URL or emoji
    preview?: { kind: "text" | "image" | "video"; value: string };
    actions?: Array<{ id: string; label: string }>;
    groupKey?: string;               // For stacking
    threadId?: string;               // For conversations
    replyable?: boolean;             // Show reply input
    metadata?: Record<string, any>;  // App-specific data
}
```

---

## Types

### NotificationInstance (Canonical Shape)

```typescript
interface NotificationInstance {
    // Identity
    id: string;
    deviceId: string;
    appId: string;
    
    // Content (flat, not nested)
    title: string;
    body: string;
    icon?: string;
    preview?: { kind: "text" | "image" | "video"; value: string };
    actions?: Array<{ id: string; label: string }>;
    replyable?: boolean;
    metadata?: Record<string, any>;
    
    // Grouping
    groupKey?: string;
    threadId?: string;
    
    // Timing
    createdAtFrame: number;
    shownAtFrame?: number;
    dismissedAtFrame?: number;
    
    // State
    state: "pending" | "headsUp" | "inShade" | "dismissed";
    mode: "headsup" | "lockscreen" | "both" | "silent";
    priority: "low" | "default" | "high" | "urgent";
    animationState?: "entering" | "visible" | "exiting" | "dismissed";
}
```

> **Important:** Fields are FLAT. Do not use `ir.appId` or `ir.title` - use top-level fields directly.

---

## Extensibility

### 1. Custom Visual Themes (Strategies)

Register custom notification visual styles:

```typescript
import { NotificationStrategyRegistry } from "@tokovo/device-notifications";
import { GhibliNotificationStrategy } from "./strategies/GhibliNotificationStrategy";

NotificationStrategyRegistry.register("ghibli", GhibliNotificationStrategy);
```

Usage:
```tsx
<HeadsUpNotification 
    variant="ghibli"
    notification={notification}
    currentTime={t}
/>
```

### 2. App-Specific Formatting (Adapters)

Register custom formatting for app notifications:

```typescript
import { NotificationAdapterRegistry } from "@tokovo/device-notifications";

NotificationAdapterRegistry.register({
    appId: "app_instagram",
    format: (notification) => ({
        icon: "📸",
        color: "#E4405F",
        title: notification.title,
        body: notification.body,
    }),
});
```

### 3. Custom Device Sounds

Device profiles can register custom sounds:

```typescript
// In device profile
import { SoundRegistry } from "@tokovo/core";

SoundRegistry.register("device.notification", "os/pixel/notification.ogg");
```

---

## Architecture

### Data Flow

```
Episode (DSL)
    ↓
NotificationTrackBuilder._events (IR)
    ↓
notificationV2Lowering() (Runtime Events)
    ↓
Engine dispatches to notificationReducer
    ↓
device.notificationCenter.items (State)
    ↓
NotificationScheduler.schedule() (Active Heads-Up)
    ↓
HeadsUpNotification (View)
```

### Package Responsibilities

| Package | Reads State | Writes State | Owns Logic |
|---------|-------------|--------------|------------|
| `device-notifications` | ✅ | ✅ | ✅ Reducer, Scheduler |
| `device-lockscreen` | ✅ | ❌ | Renders list |
| `apps-whatsapp` | ❌ | ❌ | Emits events |
| `renderer` | ✅ | ❌ | Renders view |

### Comparison with device-keyboard

| Aspect | device-keyboard | device-notifications |
|--------|-----------------|---------------------|
| Own reducer? | ✅ | ✅ |
| Own views? | ✅ | ✅ |
| Own DSL? | ✅ | ✅ |
| Own lowering? | ✅ | ✅ |
| Own types? | ✅ | ✅ |
| Auto-registers? | ✅ | ✅ |
| Registry pattern? | ✅ | ✅ (strategies) |

---

## Scheduler

The `NotificationScheduler` determines which notification is currently visible:

```typescript
import { NotificationScheduler } from "@tokovo/device-notifications";

const { headsUp } = NotificationScheduler.schedule(device, currentFrame);
if (headsUp) {
    // Render headsUp notification
}
```

### Scheduler Rules

1. **FIFO Order**: Notifications show in creation order
2. **Duration**: Each heads-up shows for 150 frames (5s at 30fps)
3. **Gap**: 10 frame gap between consecutive notifications
4. **DND**: No heads-up when `device.os.dnd` is true
5. **Mode Filter**: `lockscreen` mode skips heads-up

---

## Registries

### NotificationStrategyRegistry

```typescript
// Register
NotificationStrategyRegistry.register("ghibli", GhibliNotificationStrategy);

// Get
const Strategy = NotificationStrategyRegistry.get("ghibli");

// Get with fallback
const Strategy = NotificationStrategyRegistry.getWithFallback("ghibli", "ios");

// Check
if (NotificationStrategyRegistry.has("ghibli")) { ... }

// List all
const themes = NotificationStrategyRegistry.getRegisteredThemes();
// ["ios", "android", "ghibli"]
```

### NotificationAdapterRegistry

```typescript
// Register app-specific formatting
NotificationAdapterRegistry.register({
    appId: "app_whatsapp",
    format: (notification) => ({
        icon: "💬",
        color: "#25D366",
        title: notification.title,
        body: notification.body,
    }),
});

// Get adapter
const adapter = NotificationAdapterRegistry.get("app_whatsapp");
const formatted = adapter?.format(notification);
```

---

## Views

### HeadsUpNotification

```tsx
import { HeadsUpNotification } from "@tokovo/device-notifications";

<HeadsUpNotification
    notification={activeHeadsUp}
    currentTime={t}
    variant="ios"           // Theme from registry
    autoDismissAfter={150}  // Frames
    deviceWidth={1290}      // Physical pixels
/>
```

### Strategy Components

```tsx
import { IOSNotificationStrategy } from "@tokovo/device-notifications";

<IOSNotificationStrategy notification={notification} />
```

---

## Audio Integration

Auto-sound rules trigger notification sounds:

```typescript
// Automatically plays when SHOW_NOTIFICATION event fires
{
    match: { kind: "DEVICE", type: "SHOW_NOTIFICATION" },
    action: "PLAY_ONE_SHOT",
    sound: "device.notification",
    bus: "ui",
    volume: 0.8,
}
```

---

## Migration from Core

### Before
```typescript
import { showNotification } from "@tokovo/core";
showNotification(60, "phone", { appId: "...", title: "...", body: "..." });
```

### After
```typescript
import { NotificationTrackBuilder } from "@tokovo/device-notifications";
const noti = new NotificationTrackBuilder(30, "phone", getOrder);
noti.at("2s").show({ appId: "...", title: "...", body: "..." });
```

---

## Related Documentation

- [NOTI_ARCH.md](../NOTI_ARCH.md) - Original architecture plan
- [NOTI_ARCH_2.md](../NOTI_ARCH_2.md) - Refactoring decisions and fixes
- [core.md](./core.md) - Core engine and registries
- [dsl.md](./dsl.md) - DSL patterns
- [renderer.md](./renderer.md) - Rendering layer
