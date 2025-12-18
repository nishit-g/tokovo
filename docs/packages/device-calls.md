# @tokovo/device-calls

> **Enterprise Phone Call Simulation for Tokovo**  
> **Version**: 2.0.0  
> **Status**: Production Ready

---

## Overview

The `@tokovo/device-calls` package provides phone call simulation with the **enterprise plugin pattern** - strategy registries, DSL, and full extensibility.

### Key Principles

| Principle | Implementation |
|-----------|----------------|
| Strategy Pattern | Extensible Call UI via `CallUIStrategyRegistry` |
| Plugin Contract | `DeviceCallsPlugin` exports everything |
| Auto-Registration | Reducer and defaults registered on import |
| DSL Support | `CallTrackBuilder` for call events |

---

## Package Structure

```
@tokovo/device-calls
├── src/
│   ├── index.ts                    # Barrel + auto-registration
│   ├── plugin.ts                   # Plugin contract
│   │
│   ├── types/
│   │   ├── index.ts                # CallState, CallEventType
│   │   ├── payloads.ts             # Event payloads
│   │   └── ui.ts                   # UI component props
│   │
│   ├── dsl/
│   │   └── track-builder.ts        # ★ CallTrackBuilder
│   │
│   ├── ir/
│   │   └── call-event.ts           # Typed IR events
│   │
│   ├── lowering/
│   │   └── handler.ts              # IR → Runtime
│   │
│   ├── reducer.ts                  # Call state management
│   ├── scheduler.ts                # UI visibility logic
│   │
│   ├── registries/
│   │   ├── call-ui-registry.ts     # CallUIStrategyRegistry
│   │   └── ringtone-registry.ts    # RingtoneRegistry
│   │
│   └── widgets/
│       ├── DynamicIsland.tsx       # Dynamic Island call UI
│       └── IncomingCallBanner.tsx  # Incoming call banner
```

---

## Quick Start

### 1. Import (Auto-Registers)

```typescript
import { CallTrackBuilder, CallScheduler } from "@tokovo/device-calls";
```

### 2. Use DSL for Call Events

```typescript
const call = new CallTrackBuilder(30, "phone", getOrder);

call.at("0s").incoming({
    callerId: "mom_123",
    callerName: "Mom ❤️",
    callerAvatar: "/avatars/mom.jpg",
});

call.at("3s").answer();
call.at("30s").toggleMute();
call.at("45s").end();

// Export events
return {
    initialWorld: { ... },
    events: [...call._events],
};
```

---

## DSL Reference

### CallTrackBuilder

```typescript
const call = new CallTrackBuilder(fps, deviceId, getOrder);
call.at("2s")  // Navigate to 2 seconds
```

### Available Methods

| Method | Description | Example |
|--------|-------------|---------|
| `.incoming(opts)` | Incoming call | `call.at("2s").incoming({ callerId: "123", callerName: "Mom" })` |
| `.answer()` | Answer call | `call.at("5s").answer()` |
| `.decline()` | Decline call | `call.at("5s").decline()` |
| `.end()` | End call | `call.at("30s").end()` |
| `.toggleMute()` | Toggle mute | `call.at("15s").toggleMute()` |
| `.toggleSpeaker()` | Toggle speaker | `call.at("15s").toggleSpeaker()` |
| `.toggleHold()` | Toggle hold | `call.at("20s").toggleHold()` |
| `.mute()` | Alias for toggleMute | `call.at("15s").mute()` |
| `.speaker()` | Alias for toggleSpeaker | `call.at("15s").speaker()` |
| `.hold()` | Alias for toggleHold | `call.at("20s").hold()` |

### IncomingCallPayload

```typescript
interface IncomingCallPayload {
    callerId: string;      // Required
    callerName: string;    // Required
    callerAvatar?: string;
    isVideo?: boolean;
    callType?: "voice" | "video" | "facetime";
    displayMode?: "fullscreen" | "banner";
    callerMetadata?: Record<string, any>;
}
```

---

## Registries

### CallUIStrategyRegistry

```typescript
import { CallUIStrategyRegistry } from "@tokovo/device-calls";

// Register custom call UI
CallUIStrategyRegistry.register("ghibli", GhibliCallUI);

// Get strategy
const Strategy = CallUIStrategyRegistry.get("ghibli");

// Get with fallback
const Strategy = CallUIStrategyRegistry.getWithFallback("unknown", "ios");
```

### RingtoneRegistry

```typescript
import { RingtoneRegistry } from "@tokovo/device-calls";

// Register custom ringtone
RingtoneRegistry.register("marimba", "/sounds/marimba.mp3");

// Get ringtone path
const path = RingtoneRegistry.get("marimba");
```

---

## Scheduler

```typescript
import { CallScheduler } from "@tokovo/device-calls";

// Check if call UI should show
if (CallScheduler.shouldShowCallUI(device, t)) {
    // Render call UI
}

// Get display mode
const mode = CallScheduler.getDisplayMode(device);
// "fullscreen" | "banner" | "dynamicIsland" | "hidden"

// Check if ringtone should play
if (CallScheduler.shouldPlayRingtone(device, t)) {
    // Play ringtone
}
```

---

## Plugin Contract

```typescript
import { DeviceCallsPlugin } from "@tokovo/device-calls";

// Everything exported via plugin
DeviceCallsPlugin.CallUIStrategyRegistry
DeviceCallsPlugin.RingtoneRegistry
DeviceCallsPlugin.TrackBuilder
DeviceCallsPlugin.scheduler
DeviceCallsPlugin.reducer
DeviceCallsPlugin.v2Lowering
```

---

## Extensibility Examples

### Custom Call UI Theme

```typescript
import { CallUIStrategyRegistry, CallUIStrategyProps } from "@tokovo/device-calls";

const GhibliCallUI: React.FC<CallUIStrategyProps> = ({ call, onAnswer, onDecline }) => {
    // Custom Ghibli-styled call UI
    return (
        <div className="ghibli-call">
            <h1>{call.callerName}</h1>
            {/* ... */}
        </div>
    );
};

CallUIStrategyRegistry.register("ghibli", GhibliCallUI);
```

### Custom Ringtone

```typescript
import { RingtoneRegistry } from "@tokovo/device-calls";

RingtoneRegistry.register("totoro", "/sounds/totoro-theme.mp3");
```

---

## Migration from @tokovo/apps-phone

```diff
- import { phoneReducer, PhoneApp } from "@tokovo/apps-phone";
+ import { callReducer, PhoneApp } from "@tokovo/device-calls";

// Or use the legacy alias:
+ import { phoneReducer } from "@tokovo/device-calls"; // ← still works!
```

---

## Related Documentation

- [device-notifications.md](./device-notifications.md) - Notification system
- [devices.md](./devices.md) - Device profiles
- [core.md](./core.md) - Core engine
