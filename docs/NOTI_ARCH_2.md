# Notification Architecture V2.1

> **Enterprise Refactoring Plan**  
> **Status**: Design Review  
> **Date**: 2024-12-19

---

## What We Did vs What We Should Have Done

### The Unintended Mess

During implementation, we took shortcuts that created architectural debt:

| What NOTI_ARCH.md Said | What We Actually Did |
|------------------------|----------------------|
| Create `device-notifications` package | ✅ Created |
| TrackBuilder pattern | ✅ Created |
| Reducer in `device-notifications` | ⚠️ Created but **never registered** |
| Remove from core | ❌ Left notification handler in core |
| Remove from devices reducer | ❌ Left SHOW_NOTIFICATION in devices |
| Views stay in renderer | ✅ Kept |

### Result: 3 Places Handle Notifications

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CURRENT STATE (BROKEN)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  @tokovo/core                                                       │
│  └── engine/handlers/notification.ts  ← Handles SHOW_NOTIFICATION   │
│                                                                     │
│  @tokovo/devices                                                    │
│  └── reducer.ts                       ← ALSO handles SHOW_NOTIFICATION│
│                                                                     │
│  @tokovo/device-notifications                                       │
│  └── reducer.ts                       ← NOT REGISTERED (dead code) │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Fallback Hacks We Added

```typescript
// HACK 1: Runtime duck-typing in HeadsUpNotification
const ir = notification.ir || notification;

// HACK 2: Type assertions in scheduler
const aTime = a.createdAtFrame ?? (a as any).at ?? (a as any).deliveredAt ?? 0;

// HACK 3: Dual location check in scheduler
const notifications = device.notificationCenter?.items || device.os?.notifications || [];
```

---

## The Enterprise Way

### Principle: One Package = One Responsibility

Following the `device-keyboard` pattern:

| Package | Responsibility |
|---------|---------------|
| `@tokovo/device-notifications` | DSL, Types, Lowering, **Reducer**, Views |
| `@tokovo/devices` | Device profiles, frames, device shell |
| `@tokovo/core` | Engine, registries, runtime orchestration |
| `@tokovo/renderer` | Rendering layer only (no business logic) |

### Decision: Move NotificationReducer to device-notifications

**Not devices.** Not core. The `device-notifications` package should OWN all notification logic.

Why? Because:
1. `device-keyboard` has its own reducer in its package
2. Apps like `apps-whatsapp` have their own reducers
3. Notifications are a device capability, not device state

---

## Clean Architecture

```
@tokovo/device-notifications (OWNS NOTIFICATIONS)
├── src/
│   ├── index.ts                   # Auto-register on import
│   ├── plugin.ts                  # Plugin contract + registration
│   │
│   ├── types/
│   │   ├── index.ts               # NotificationIR, NotificationInstance
│   │   ├── payloads.ts            # Event payloads
│   │   ├── state.ts               # NotificationCenterState
│   │   └── adapter-types.ts       # Adapter interface
│   │
│   ├── dsl/
│   │   └── track-builder.ts       # NotificationTrackBuilder
│   │
│   ├── ir/
│   │   └── track-event.ts         # Typed IR events
│   │
│   ├── lowering/
│   │   └── handler.ts             # IR → Runtime
│   │
│   ├── reducer.ts                 # ★ THE SINGLE SOURCE OF TRUTH
│   │
│   ├── scheduler.ts               # ★ MOVE FROM CORE
│   │
│   ├── adapters/
│   │   ├── registry.ts            # NotificationAdapterRegistry
│   │   └── whatsapp.ts            # WhatsApp-specific formatting
│   │
│   ├── views/                     # ★ MOVE FROM RENDERER
│   │   ├── HeadsUpNotification.tsx
│   │   ├── NotificationShade.tsx
│   │   └── DynamicIslandNotification.tsx
│   │
│   ├── strategies/                # ★ MOVE FROM RENDERER
│   │   ├── IOSNotificationStrategy.tsx
│   │   └── AndroidNotificationStrategy.tsx
│   │
│   └── assets/
│       ├── audio-rules.ts
│       └── sounds/                # Default notification sounds
│           └── default.wav

@tokovo/core (MINIMAL)
├── notifications/
│   └── index.ts                   # Re-exports only (backward compat)
├── types.ts                       # Keep NotificationInstance def (shared)
└── engine/handlers/
    └── notification.ts            # ★ DELETE or convert to router

@tokovo/devices (UNCHANGED)
├── reducer.ts                     # ★ REMOVE SHOW_NOTIFICATION handling
└── types.ts                       # Keep notificationCenter in DeviceState

@tokovo/renderer (PURE RENDERING)
├── TokovoRenderer.tsx             # Import views from device-notifications
└── os/
    ├── DynamicIsland.tsx          # Shell only
    └── StatusBar.tsx              # Shell only
```

---

## Migration Steps

### Step 1: Move Scheduler to device-notifications

```bash
mv packages/core/src/notifications/scheduler.ts \
   packages/device-notifications/src/scheduler.ts
```

Update imports in `TokovoRenderer.tsx`:
```typescript
// Before
import { NotificationScheduler } from "@tokovo/core";

// After
import { NotificationScheduler } from "@tokovo/device-notifications";
```

### Step 2: Move Views to device-notifications

```bash
mv packages/renderer/src/os/HeadsUpNotification.tsx \
   packages/device-notifications/src/views/

mv packages/renderer/src/strategies/IOSNotificationStrategy.tsx \
   packages/device-notifications/src/strategies/

mv packages/renderer/src/strategies/AndroidNotificationStrategy.tsx \
   packages/device-notifications/src/strategies/
```

Update `device-notifications/src/index.ts`:
```typescript
// Views
export { HeadsUpNotification } from "./views/HeadsUpNotification";
export { IOSNotificationStrategy } from "./strategies/IOSNotificationStrategy";
export { AndroidNotificationStrategy } from "./strategies/AndroidNotificationStrategy";

// Scheduler
export { NotificationScheduler } from "./scheduler";
```

### Step 3: Activate the Reducer

```typescript
// device-notifications/src/plugin.ts
import { ReducerRegistry } from "@tokovo/core";
import { notificationReducer } from "./reducer";

export function registerNotificationPlugin(): void {
    // Register as device reducer OR feature reducer
    ReducerRegistry.registerDeviceReducer(notificationReducer);
}
```

### Step 4: Remove from devices reducer

```typescript
// packages/devices/src/reducer.ts
// REMOVE these cases:
case "SHOW_NOTIFICATION":
case "DISMISS_NOTIFICATION":
case "TAP_NOTIFICATION":
// etc.
```

### Step 5: Remove from core

```typescript
// packages/core/src/engine/handlers/notification.ts
// Either DELETE entirely or convert to simple router:
export function notificationHandler(draft, event) {
    // Just route to device-notifications reducer
    // (Or delete if device-notifications auto-registers)
}
```

### Step 6: Fix Types - Single Canonical Shape

```typescript
// device-notifications/src/types/index.ts
export interface NotificationInstance {
    id: string;
    deviceId: string;
    
    // Content (from IR)
    appId: string;
    title: string;
    body: string;
    icon?: string;
    preview?: { kind: "text" | "image"; value: string };
    
    // Timing
    createdAtFrame: number;     // ★ NOT `at` or `deliveredAt`
    shownAtFrame?: number;
    dismissedAtFrame?: number;
    
    // State
    state: "pending" | "headsUp" | "inShade" | "dismissed";
    mode: "headsup" | "lockscreen" | "both" | "silent";
    priority: "low" | "default" | "high" | "urgent";
    
    // Grouping
    groupKey?: string;
    threadId?: string;
    
    // Actions
    actions?: Array<{ id: string; label: string }>;
    replyable?: boolean;
}
```

### Step 7: Remove Fallback Hacks

```typescript
// HeadsUpNotification.tsx - BEFORE
const ir = notification.ir || notification;  // HACK

// HeadsUpNotification.tsx - AFTER
// notification is NotificationInstance, use directly
const { appId, title, body } = notification;
```

```typescript
// scheduler.ts - BEFORE
const aTime = a.createdAtFrame ?? (a as any).at ?? 0;  // HACK

// scheduler.ts - AFTER
const aTime = a.createdAtFrame;  // Clean
```

---

## Final Package Ownership

| Concern | Package | Reason |
|---------|---------|--------|
| NotificationInstance type | device-notifications | Owns the domain |
| NotificationTrackBuilder | device-notifications | DSL authoring |
| notificationReducer | device-notifications | State mutations |
| NotificationScheduler | device-notifications | Domain logic |
| HeadsUpNotification view | device-notifications | Self-contained |
| Notification strategies | device-notifications | Self-contained |
| Device profile (sounds) | devices | Device metadata |
| TokovoRenderer | renderer | Imports from device-notifications |
| Engine routing | core | Routes to reducers |

---

## Comparison with device-keyboard

| Aspect | device-keyboard | device-notifications (target) |
|--------|-----------------|-------------------------------|
| Own reducer? | ✅ `reducer.ts` | ✅ (needs activation) |
| Own views? | ✅ `views/` | ✅ (needs move) |
| Own DSL? | ✅ `dsl/` | ✅ |
| Own lowering? | ✅ `lowering/` | ✅ |
| Own types? | ✅ `types/` | ✅ |
| Auto-registers? | ✅ in index.ts | ⚠️ needs fixing |

---

## Estimated Effort

| Task | Time | Risk |
|------|------|------|
| Move scheduler | 15m | Low |
| Move views | 30m | Medium |
| Activate reducer | 20m | Medium |
| Remove from devices | 15m | Medium |
| Remove from core | 10m | Low |
| Fix types | 30m | Medium |
| Remove hacks | 20m | Low |
| Test | 30m | - |
| **Total** | **~3h** | - |

---

## Cross-Package Access (Lockscreen, Widgets, etc.)

### The Question
> "If I build `device-lockscreen`, how does it access the list of notifications?"

### The Answer: Shared State, Owned Logic

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STATE vs LOGIC                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  DeviceState (SHARED - accessible to all)                          │
│  └── notificationCenter                                             │
│      ├── items: NotificationInstance[]     ← DATA                  │
│      ├── groups: NotificationGroup[]                               │
│      └── headsUp: string | null                                    │
│                                                                     │
│  device-notifications (OWNS LOGIC)                                 │
│  ├── reducer.ts        → Mutates notificationCenter                │
│  ├── scheduler.ts      → Computes active heads-up                  │
│  └── views/            → Renders heads-up notification             │
│                                                                     │
│  device-lockscreen (READS STATE)                                   │
│  └── views/            → Reads notificationCenter.items            │
│                        → Renders list of notifications             │
│                                                                     │
│  device-dynamic-island (READS STATE)                               │
│  └── views/            → Reads notificationCenter.headsUp          │
│                        → Renders expanded DI notification          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Example: Lockscreen Reading Notifications

```typescript
// device-lockscreen/src/views/LockscreenNotifications.tsx
import { DeviceState, NotificationInstance } from "@tokovo/core";

interface LockscreenNotificationsProps {
    device: DeviceState;
    t: number;
}

export const LockscreenNotifications: React.FC<LockscreenNotificationsProps> = ({
    device,
    t,
}) => {
    // Read from shared state
    const allNotifications = device.notificationCenter?.items || [];
    
    // Filter for lockscreen-visible notifications
    const visible = allNotifications.filter(n => 
        n.mode === "lockscreen" || n.mode === "both"
    );
    
    // Group by app
    const grouped = groupByApp(visible);
    
    return (
        <div className="lockscreen-notifications">
            {grouped.map(group => (
                <NotificationGroup key={group.appId} group={group} />
            ))}
        </div>
    );
};
```

### Why This Works

| Package | Reads | Writes |
|---------|-------|--------|
| `device-notifications` | ✅ | ✅ (owns reducer) |
| `device-lockscreen` | ✅ | ❌ |
| `device-dynamic-island` | ✅ | ❌ |
| `apps-whatsapp` | ✅ | ❌ (creates via events) |

**Principle:** Anyone can READ `DeviceState`. Only the owner can WRITE via reducer.

---

## Future Extensibility

### Adding New Notification Surfaces

| Surface | Package | How It Accesses Data |
|---------|---------|----------------------|
| Heads-Up Banner | `device-notifications` | Owns reducer + scheduler |
| Lockscreen List | `device-lockscreen` | Reads `notificationCenter.items` |
| Dynamic Island | `device-dynamic-island` | Reads `notificationCenter.headsUp` |
| Notification Shade | `device-notifications` | Reads `notificationCenter.items` |
| Watch Glance | `device-watch` | Reads `notificationCenter.items` |
| CarPlay Alert | `device-carplay` | Reads `notificationCenter.items` |

### Adding New App Styles

```typescript
// Any app can register its notification view
// apps-instagram/src/plugin.ts
import { NotificationViewRegistry } from "@tokovo/device-notifications";
import { InstagramNotificationView } from "./views/notification";

NotificationViewRegistry.register("app_instagram", InstagramNotificationView);
```

### Adding New Device Styles (Strategies)

```typescript
// device-notifications/src/strategies/PixelNotificationStrategy.tsx
export const PixelNotificationStrategy: React.FC<NotificationStrategyProps> = ({
    notification,
}) => {
    // Pixel-specific styling
    return (
        <div className="pixel-notification">
            {/* Material You design */}
        </div>
    );
};
```

### Adding New Notification Modes

```typescript
// Extend the type
type NotificationMode = 
    | "headsup"      // Show as banner
    | "lockscreen"   // Show on lockscreen only
    | "both"         // Both
    | "silent"       // No visual, badge only
    | "critical"     // NEW: Override DND
    | "ambient"      // NEW: Ambient display
    | "summary";     // NEW: Stacked summary
```

---

## DSL Capabilities vs Episode Reality

### What the DSL Supports (TrackBuilder)

```typescript
noti.at("2s").show({...});           // ✅ Used in episode
noti.at("5s").dismiss("notif_1");    // ✅ Available
noti.at("6s").tap("notif_1");        // ✅ Available
noti.at("7s").openPanel();           // ✅ Available
noti.at("10s").clearAll();           // ✅ Available
noti.at("3s").dynamicIsland({...});  // ✅ Available
```

### What the Episode Actually Uses

```typescript
// notification-demo.episode.ts uses:
noti.at("1s").show({ appId: "app_whatsapp", title: "Alex 👋", body: "Hey!" });
noti.at("4s").show({ appId: "app_whatsapp", title: "Sarah 💕", body: "Check out this photo!" });
noti.at("12s").show({ appId: "app_whatsapp", title: "Alex 👋", body: "Are you there?" });
```

### Gap Analysis

| DSL Method | Reducer Support | View Support | Status |
|------------|-----------------|--------------|--------|
| `.show()` | ✅ | ✅ | Working |
| `.dismiss()` | ✅ | ⚠️ Animation only | Partial |
| `.tap()` | ⚠️ State only | ❌ No visual | Needs work |
| `.swipe()` | ⚠️ State only | ❌ No visual | Needs work |
| `.openPanel()` | ❌ | ❌ | Not implemented |
| `.closePanel()` | ❌ | ❌ | Not implemented |
| `.clearAll()` | ✅ | ⚠️ | Partial |
| `.dynamicIsland()` | ⚠️ | ⚠️ | Partial |

### Priority for This Session

1. ✅ `.show()` - Working
2. 🔜 Move files to proper package
3. 🔜 Activate reducer
4. 🔜 Remove hacks
5. Future: Implement remaining DSL methods

---

## Checklist

### Phase 1: Relocate Files
- [ ] Move `scheduler.ts` to device-notifications
- [ ] Move `HeadsUpNotification.tsx` to device-notifications
- [ ] Move iOS/Android strategies to device-notifications
- [ ] Update imports everywhere

### Phase 2: Activate Reducer
- [ ] Register `notificationReducer` in plugin.ts
- [ ] Remove notification cases from `devices/reducer.ts`
- [ ] Remove/simplify `core/handlers/notification.ts`

### Phase 3: Fix Types
- [ ] Define canonical `NotificationInstance` shape
- [ ] Update reducer to use canonical shape
- [ ] Remove `as any` casts from scheduler

### Phase 4: Clean Up
- [ ] Remove `ir || notification` fallbacks
- [ ] Remove `createdAtFrame ?? at` fallbacks
- [ ] Add missing sound file

### Phase 5: Verify
- [ ] Test notification-demo episode
- [ ] Test other episodes with notifications
- [ ] Verify audio plays
- [ ] Verify positioning on different devices
