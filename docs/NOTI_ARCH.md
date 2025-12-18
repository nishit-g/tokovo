# Notification Architecture V2

> **Enterprise Implementation Plan**  
> **Status**: Approved for Implementation  
> **Date**: 2024-12-18

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Old vs New Architecture](#old-vs-new-architecture)
3. [Design Decisions & Rationale](#design-decisions--rationale)
4. [Package Structure](#package-structure)
5. [Implementation Steps](#implementation-steps)
6. [API Reference](#api-reference)
7. [Migration Guide](#migration-guide)

---

## Executive Summary

| Aspect | Current | Target |
|--------|---------|--------|
| **Package** | Scattered in core/renderer | `@tokovo/device-notifications` |
| **DSL** | Raw functions | `NotificationTrackBuilder` |
| **Device Sounds** | ❌ Not supported | ✅ `DeviceProfile.sounds` |
| **Views** | `@tokovo/renderer` | **Stay in renderer** (no change) |
| **Extensibility** | Hard-coded | Strategy pattern ready |

**Estimated Time**: ~3-4 hours total

---

## Old vs New Architecture

### ❌ Before: Scattered & Coupled

```
@tokovo/core
├── types.ts                    ← Notification, NotificationIR
├── notifications/
│   ├── adapter.ts              ← NotificationAdapterRegistry
│   ├── dsl.ts                  ← showNotification(), dismissNotification()
│   ├── registry.ts             ← NotificationViewRegistry
│   └── scheduler.ts            ← NotificationScheduler
└── engine/handlers/
    └── notification.ts         ← Event handler

@tokovo/renderer
└── os/
    ├── HeadsUpNotification.tsx
    ├── NotificationShade.tsx
    └── DynamicIsland.tsx
└── strategies/
    ├── IOSNotificationStrategy.tsx
    └── AndroidNotificationStrategy.tsx
```

**Problems:**
1. Types in core → Every change rebuilds core
2. DSL uses raw functions, not TrackBuilder pattern
3. No device sound registration
4. Views tightly coupled to renderer

---

### ✅ After: Clean Separation

```
@tokovo/device-notifications           ← NEW PACKAGE
├── src/
│   ├── index.ts                       # Barrel exports
│   ├── plugin.ts                      # Plugin contract
│   ├── types/
│   │   ├── index.ts                   # Notification types
│   │   └── payloads.ts                # Event payloads
│   ├── dsl/
│   │   └── track-builder.ts           # NotificationTrackBuilder
│   ├── ir/
│   │   └── track-event.ts             # Typed IR events
│   ├── lowering/
│   │   └── handler.ts                 # IR → Runtime
│   ├── reducer.ts                     # State management
│   ├── adapters/
│   │   ├── types.ts                   # Adapter interface
│   │   └── registry.ts                # Registry (moved from core)
│   └── assets/
│       └── audio-rules.ts             # Auto-sound rules

@tokovo/core                           ← MINIMAL CHANGES
├── notifications/
│   └── index.ts                       # Re-exports for backward compat
└── types.ts                           # Keep types (re-exported)

@tokovo/devices                        ← ENHANCED
├── src/
│   ├── types.ts                       # + sounds property
│   └── iphone16/profile.ts            # + device sounds

@tokovo/renderer                       ← NO CHANGES
└── os/                                # Views stay here
```

---

## Design Decisions & Rationale

### Decision 1: Pure Logic Package (No Views)

| Option | Description | Chosen |
|--------|-------------|--------|
| A | Views in device-notifications | ❌ |
| B | Views stay in renderer | ✅ |

**Rationale**: Notifications are *frames around app content*, not standalone widgets. The shell (iOS/Android chrome) belongs to the device/OS, the content belongs to apps. Slot-based composition is the correct pattern.

```
SHELL (Device owns)        CONTENT (App owns)
┌──────────────────┐      ┌──────────────┐
│ iOS notification │  +   │ WhatsApp:    │
│ chrome/styling   │      │ title, body  │
└──────────────────┘      └──────────────┘
```

---

### Decision 2: Device Sound Registration via Profile

| Option | Description | Chosen |
|--------|-------------|--------|
| A | Separate device-sounds package | ❌ |
| B | Sounds property on DeviceProfile | ✅ |

**Rationale**: Device profiles already define device characteristics. Adding `sounds` is natural extension. Auto-registration on import follows keyboard pattern.

```typescript
// Before: No device sounds
export const iPhone16Profile: DeviceProfile = {
    id: "iphone16",
    dimensions: { ... },
};

// After: Device sounds included
export const iPhone16Profile: DeviceProfile = {
    id: "iphone16",
    dimensions: { ... },
    sounds: {
        "device.notification": "os/ios/notification.wav",
        "device.lock": "os/ios/lock.wav",
    },
};
```

---

### Decision 3: TrackBuilder Pattern (Like Keyboard)

| Option | Description | Chosen |
|--------|-------------|--------|
| A | Raw DSL functions (current) | ❌ |
| B | NotificationTrackBuilder | ✅ |

**Rationale**: Consistency with WhatsApp/Keyboard. Fluent API is more ergonomic and type-safe.

```typescript
// Before: Raw functions
showNotification(60, "phone", {
    appId: "app_whatsapp",
    title: "Alex",
    body: "Hey!",
});

// After: TrackBuilder
noti.at("2s").show({
    appId: "app_whatsapp",
    title: "Alex",
    body: "Hey!",
});
```

---

### Decision 4: Backward Compatibility via Re-exports

| Concern | Solution |
|---------|----------|
| Existing code uses `@tokovo/core` types | Re-export from core |
| DSL helpers still work | Mark deprecated, keep working |

```typescript
// @tokovo/core/notifications/index.ts
// Re-export for backward compat (deprecated)
export * from "@tokovo/device-notifications";

/** @deprecated Use NotificationTrackBuilder instead */
export { showNotification } from "./dsl";
```

---

## Package Structure

### @tokovo/device-notifications

```
packages/device-notifications/
├── src/
│   ├── index.ts
│   │   └── Barrel exports
│   │
│   ├── plugin.ts
│   │   └── NotificationPlugin contract
│   │
│   ├── types/
│   │   ├── index.ts
│   │   │   └── NotificationIR, NotificationInstance, etc.
│   │   └── payloads.ts
│   │       └── Event payload types
│   │
│   ├── dsl/
│   │   └── track-builder.ts
│   │       └── NotificationTrackBuilder
│   │       └── NotificationPointBuilder (at)
│   │
│   ├── ir/
│   │   └── track-event.ts
│   │       └── NotificationTrackEvent type
│   │
│   ├── lowering/
│   │   └── handler.ts
│   │       └── notificationV2Lowering
│   │
│   ├── reducer.ts
│   │   └── notificationReducer
│   │
│   ├── adapters/
│   │   ├── types.ts
│   │   │   └── NotificationAdapter interface
│   │   └── registry.ts
│   │       └── NotificationAdapterRegistry
│   │
│   └── assets/
│       └── audio-rules.ts
│           └── notificationAudioRules
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Implementation Steps

### Phase 1: Create Package Skeleton (~30 min)

```bash
# Step 1.1: Generate with turbo
npx turbo gen plugin --name notifications

# Step 1.2: Rename to device-notifications
mv packages/apps-notifications packages/device-notifications

# Step 1.3: Update package.json
{
  "name": "@tokovo/device-notifications",
  "version": "1.0.0",
  "main": "src/index.ts"
}

# Step 1.4: Add to workspace
pnpm install
```

---

### Phase 2: Types (~20 min)

```typescript
// src/types/index.ts
export interface NotificationIR {
    id: string;
    appId: string;
    title: string;
    body: string;
    mode?: "headsup" | "lockscreen" | "both" | "silent";
    priority?: "low" | "default" | "high" | "urgent";
    icon?: string;
    preview?: { kind: "text" | "image"; value: string };
    actions?: Array<{ id: string; label: string }>;
    groupKey?: string;
    threadId?: string;
}

export interface NotificationInstance {
    id: string;
    ir: NotificationIR;
    deviceId: string;
    shownAtFrame: number;
    mode: NotificationIR["mode"];
    dismissed?: boolean;
    dismissedAt?: number;
}

// src/types/payloads.ts
export interface NotificationPayloads {
    SHOW: NotificationIR;
    DISMISS: { id?: string; groupKey?: string; all?: boolean };
    TAP: { id: string; actionId?: string };
    SWIPE: { id: string; direction: "left" | "right"; action: string };
    DYNAMIC_ISLAND: { mode: "idle" | "minimal" | "compact" | "expanded"; appId?: string };
    OPEN_PANEL: {};
    CLOSE_PANEL: {};
    CLEAR_ALL: {};
}
```

---

### Phase 3: TrackBuilder (~45 min)

```typescript
// src/dsl/track-builder.ts
import type { NotificationPayloads } from "../types/payloads";
import type { NotificationTrackEvent } from "../ir/track-event";

type GetOrder = () => number;

export class NotificationPointBuilder {
    constructor(
        private _frame: number,
        private _deviceId: string,
        private _events: NotificationTrackEvent[],
        private _getOrder: GetOrder
    ) {}

    private emit<T extends keyof NotificationPayloads>(
        type: T,
        payload: NotificationPayloads[T]
    ): void {
        this._events.push({
            kind: "DEVICE",
            deviceId: this._deviceId,
            type: `NOTIFICATION_${type}` as any,
            ...payload,
            at: this._frame,
            _declarationOrder: this._getOrder(),
        });
    }

    show(opts: NotificationPayloads["SHOW"]): this {
        this.emit("SHOW", opts);
        return this;
    }

    dismiss(idOrOpts: string | NotificationPayloads["DISMISS"]): this {
        const opts = typeof idOrOpts === "string" ? { id: idOrOpts } : idOrOpts;
        this.emit("DISMISS", opts);
        return this;
    }

    tap(id: string, actionId?: string): this {
        this.emit("TAP", { id, actionId });
        return this;
    }

    swipe(id: string, direction: "left" | "right", action: string = "dismiss"): this {
        this.emit("SWIPE", { id, direction, action });
        return this;
    }

    dynamicIsland(opts: NotificationPayloads["DYNAMIC_ISLAND"]): this {
        this.emit("DYNAMIC_ISLAND", opts);
        return this;
    }

    openPanel(): this {
        this.emit("OPEN_PANEL", {});
        return this;
    }

    closePanel(): this {
        this.emit("CLOSE_PANEL", {});
        return this;
    }

    clearAll(): this {
        this.emit("CLEAR_ALL", {});
        return this;
    }
}

export class NotificationTrackBuilder {
    _events: NotificationTrackEvent[] = [];

    constructor(
        private _fps: number,
        private _deviceId: string,
        private _getOrder: GetOrder
    ) {}

    at(time: string | number): NotificationPointBuilder {
        const frame = this.parseTime(time);
        return new NotificationPointBuilder(
            frame,
            this._deviceId,
            this._events,
            this._getOrder
        );
    }

    private parseTime(time: string | number): number {
        if (typeof time === "number") return Math.round(time);
        const t = time.trim();
        if (t.endsWith("ms")) return Math.round((parseFloat(t) / 1000) * this._fps);
        if (t.endsWith("s")) return Math.round(parseFloat(t) * this._fps);
        return Math.round(parseFloat(t));
    }
}
```

---

### Phase 4: Lowering Handler (~20 min)

```typescript
// src/lowering/handler.ts
import type { TimelineOp } from "@tokovo/ir";
import type { NotificationTrackEvent } from "../ir/track-event";

export function notificationV2Lowering(
    event: NotificationTrackEvent,
    ctx: { fps: number }
): TimelineOp[] {
    // Most events map 1:1 to DEVICE events
    return [{
        at: event.at,
        kind: "DEVICE",
        deviceId: event.deviceId,
        type: event.type,
        ...event,
    }];
}
```

---

### Phase 5: Reducer (~30 min)

```typescript
// src/reducer.ts
import type { WorldState } from "@tokovo/core";
import type { NotificationInstance } from "./types";

export function notificationReducer(
    draft: WorldState,
    event: any
): void {
    const device = draft.devices[event.deviceId];
    if (!device) return;

    device.notifications ??= [];

    switch (event.type) {
        case "SHOW_NOTIFICATION":
        case "NOTIFICATION_SHOW": {
            const instance: NotificationInstance = {
                id: event.id || `notif_${Date.now()}`,
                ir: event,
                deviceId: event.deviceId,
                shownAtFrame: event.at,
                mode: event.mode || "headsup",
            };
            device.notifications.push(instance);
            break;
        }

        case "DISMISS_NOTIFICATION":
        case "NOTIFICATION_DISMISS": {
            if (event.all) {
                device.notifications = [];
            } else if (event.id) {
                const n = device.notifications.find(n => n.id === event.id);
                if (n) n.dismissedAt = event.at;
            }
            break;
        }

        // ... other cases
    }
}
```

---

### Phase 6: Audio Rules (~15 min)

```typescript
// src/assets/audio-rules.ts
import { AutoSoundRule } from "@tokovo/core";

export const notificationAudioRules: AutoSoundRule[] = [
    {
        match: { kind: "DEVICE", type: "SHOW_NOTIFICATION" },
        action: "PLAY_ONE_SHOT",
        sound: "device.notification",
        bus: "ui",
        volume: 0.8,
    },
    {
        match: { kind: "DEVICE", type: "NOTIFICATION_SHOW" },
        action: "PLAY_ONE_SHOT",
        sound: "device.notification",
        bus: "ui",
        volume: 0.8,
    },
];
```

---

### Phase 7: Plugin & Registration (~20 min)

```typescript
// src/plugin.ts
import { ReducerRegistry, AutoSoundRegistry, SoundRegistry } from "@tokovo/core";
import { notificationReducer } from "./reducer";
import { notificationAudioRules } from "./assets/audio-rules";

export const NotificationPlugin = {
    id: "device_notifications",
    version: "1.0.0",
    displayName: "Notifications",
};

export function registerNotificationPlugin(): void {
    ReducerRegistry.registerFeatureReducer("NOTIFICATION", notificationReducer);
    AutoSoundRegistry.register(notificationAudioRules);
}

// src/index.ts - Auto-registration on import
import { registerNotificationPlugin } from "./plugin";
registerNotificationPlugin();

export * from "./types";
export * from "./dsl/track-builder";
export * from "./adapters/registry";
export { NotificationPlugin } from "./plugin";
```

---

### Phase 8: Device Sounds (~15 min)

```typescript
// packages/devices/src/types.ts
export interface DeviceProfile {
    // ... existing fields
    
    /** Device OS sounds */
    sounds?: Record<string, string>;
}

// packages/devices/src/iphone16/profile.ts
export const iPhone16Profile: DeviceProfile = {
    id: "iphone16",
    // ... existing
    
    sounds: {
        "device.notification": "os/ios/notification.wav",
        "device.lock": "os/ios/lock.wav",
        "device.unlock": "os/ios/unlock.wav",
        "device.screenshot": "os/ios/screenshot.wav",
    },
};

// packages/devices/src/index.ts - Auto-registration
import { SoundRegistry } from "@tokovo/core";
import { iPhone16Profile } from "./iphone16/profile";

if (iPhone16Profile.sounds) {
    SoundRegistry.registerMany(iPhone16Profile.sounds);
}
```

---

### Phase 9: Backward Compatibility (~10 min)

```typescript
// packages/core/src/notifications/index.ts
// Re-export for backward compat

export {
    NotificationAdapterRegistry,
    type NotificationAdapter,
    type FormattedNotification,
} from "@tokovo/device-notifications";

// Mark old DSL as deprecated but keep working
/** @deprecated Use NotificationTrackBuilder from @tokovo/device-notifications */
export { showNotification } from "./dsl";
```

---

## API Reference

### NotificationTrackBuilder

```typescript
const noti = new NotificationTrackBuilder(fps: number, deviceId: string, getOrder: () => number);

// Point-in-time methods
noti.at(time: string | number): NotificationPointBuilder

// NotificationPointBuilder methods
.show(opts: {
    id?: string;
    appId: string;
    title: string;
    body: string;
    mode?: "headsup" | "lockscreen" | "both" | "silent";
    priority?: "low" | "default" | "high" | "urgent";
    icon?: string;
    actions?: Array<{ id: string; label: string }>;
})

.dismiss(id: string)
.dismiss({ id?: string; groupKey?: string; all?: boolean })

.tap(id: string, actionId?: string)

.swipe(id: string, direction: "left" | "right", action?: string)

.dynamicIsland({ mode: "idle" | "minimal" | "compact" | "expanded"; appId?: string })

.openPanel()
.closePanel()
.clearAll()
```

---

## Migration Guide

### For Episode Authors

```typescript
// Before
import { showNotification, dismissNotification } from "@tokovo/core";

showNotification(60, "phone", {
    appId: "app_whatsapp",
    title: "Alex",
    body: "Hey!",
});

// After
import { NotificationTrackBuilder } from "@tokovo/device-notifications";

const noti = new NotificationTrackBuilder(30, "phone", getOrder);
noti.at("2s").show({
    appId: "app_whatsapp",
    title: "Alex",
    body: "Hey!",
});
```

### For App Developers

No changes required. `NotificationAdapterRegistry` continues to work.

### For Device Developers

```typescript
// Add sounds to your device profile
export const MyDeviceProfile: DeviceProfile = {
    // ... existing
    sounds: {
        "device.notification": "os/mydevice/notification.wav",
    },
};
```

---

## Checklist

### Phase 1: Package Skeleton
- [ ] Generate with turbo
- [ ] Rename to device-notifications
- [ ] Update package.json
- [ ] Add to workspace

### Phase 2: Core Implementation
- [ ] Types (NotificationIR, NotificationInstance, Payloads)
- [ ] TrackBuilder (NotificationTrackBuilder, PointBuilder)
- [ ] IR events
- [ ] Lowering handler
- [ ] Reducer
- [ ] Audio rules

### Phase 3: Integration
- [ ] Plugin registration
- [ ] Auto-registration on import
- [ ] Device sounds in DeviceProfile
- [ ] Backward compat re-exports

### Phase 4: Testing
- [ ] Create demo episode using TrackBuilder
- [ ] Verify audio plays
- [ ] Verify notification renders

---

## Summary

| Change | Files Affected | Time |
|--------|---------------|------|
| Create package | New package | 30m |
| Types | 2 files | 20m |
| TrackBuilder | 2 files | 45m |
| Lowering | 1 file | 20m |
| Reducer | 1 file | 30m |
| Audio rules | 1 file | 15m |
| Plugin/Registration | 2 files | 20m |
| Device sounds | 3 files | 15m |
| Backward compat | 1 file | 10m |
| **Total** | **~14 files** | **~3.5h** |
