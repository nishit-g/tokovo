# @tokovo/devices

> **Enterprise Device Profiles & OS Features for Tokovo**  
> **Version**: 2.0.0  
> **Status**: Production Ready

---

## Overview

The `@tokovo/devices` package provides device profiles, frames, and OS features using the **enterprise plugin pattern** with strategy registries for full extensibility.

### Key Principles

| Principle | Implementation |
|-----------|----------------|
| Strategy Pattern | Extensible StatusBar, Frames via registries |
| Plugin Contract | `DevicesPlugin` exports everything |
| Auto-Registration | Default profiles and strategies registered on import |
| DSL Support | `DeviceTrackBuilder` for OS events |

---

## Package Structure

```
@tokovo/devices
├── src/
│   ├── index.ts                    # Barrel + auto-registration
│   ├── plugin.ts                   # Plugin contract
│   │
│   ├── registries/
│   │   ├── device-registry.ts      # DeviceRegistry
│   │   ├── frame-registry.ts       # FrameRegistry
│   │   └── statusbar-registry.ts   # StatusBarStrategyRegistry
│   │
│   ├── dsl/
│   │   └── track-builder.ts        # DeviceTrackBuilder
│   │
│   ├── ir/
│   │   └── device-event.ts         # Typed IR events
│   │
│   ├── lowering/
│   │   └── handler.ts              # IR → Runtime
│   │
│   ├── reducer.ts                  # Device reducer
│   ├── StatusBar.tsx               # Uses registry
│   │
│   ├── strategies/
│   │   ├── IOSStatusBarStrategy.tsx
│   │   └── AndroidStatusBarStrategy.tsx
│   │
│   └── profiles/
│       ├── iphone16/
│       │   ├── profile.ts          # With sounds
│       │   └── Frame.tsx
│       └── pixel/
│           ├── profile.ts          # With sounds
│           └── Frame.tsx
```

---

## Quick Start

### 1. Import (Auto-Registers)

```typescript
import { DeviceRegistry, DeviceTrackBuilder, StatusBar } from "@tokovo/devices";
```

### 2. Use Device Profile

```typescript
const profile = DeviceRegistry.get("iphone16");
const Frame = FrameRegistry.get("iphone16");
```

### 3. Use DSL for OS Events

```typescript
const device = new DeviceTrackBuilder(30, "phone", getOrder);

device.at("0s").setBattery(100);
device.at("2s").lock();
device.at("5s").unlock();
device.at("10s").openApp("app_whatsapp");
device.at("30s").incomingCall({ callerId: "123", callerName: "Mom" });
device.at("35s").answerCall();
device.at("60s").endCall();
device.at("65s").goHome();
```

---

## Registries

### DeviceRegistry

```typescript
// Register custom profile
DeviceRegistry.register("ghibli-phone", myGhibliProfile);

// Get profile
const profile = DeviceRegistry.get("iphone16");

// Get with fallback
const profile = DeviceRegistry.getOrDefault("unknown", "iphone16");

// List all
const profileIds = DeviceRegistry.list();
// ["iphone16", "pixel", "pixel9"]
```

### FrameRegistry

```typescript
// Register custom frame
FrameRegistry.register("ghibli-phone", GhibliPhoneFrame);

// Get frame
const Frame = FrameRegistry.get("iphone16");

// Get with fallback
const Frame = FrameRegistry.getWithFallback("unknown", "iphone16");
```

### StatusBarStrategyRegistry

```typescript
// Register custom StatusBar theme
StatusBarStrategyRegistry.register("ghibli", GhibliStatusBarStrategy);

// Get strategy
const Strategy = StatusBarStrategyRegistry.get("ghibli");

// Use in StatusBar
<StatusBar variant="ghibli" os={device.os} />
```

---

## DSL Reference

### DeviceTrackBuilder

```typescript
const device = new DeviceTrackBuilder(fps, deviceId, getOrder);
device.at("2s")  // Navigate to 2 seconds
```

### Available Methods

| Method | Description | Example |
|--------|-------------|---------|
| `.lock()` | Lock device | `device.at("2s").lock()` |
| `.unlock()` | Unlock device | `device.at("5s").unlock()` |
| `.openApp(appId)` | Open an app | `device.at("10s").openApp("app_whatsapp")` |
| `.closeApp()` | Close current app | `device.at("15s").closeApp()` |
| `.goHome()` | Go to home screen | `device.at("20s").goHome()` |
| `.setBadge(appId, count)` | Set app badge | `device.at("5s").setBadge("app_mail", 5)` |
| `.setBattery(%, charging?)` | Set battery | `device.at("0s").setBattery(80, true)` |
| `.setNetwork(type, strength?)` | Set network | `device.at("0s").setNetwork("5g", 4)` |
| `.setDND(enabled)` | Do Not Disturb | `device.at("0s").setDND(true)` |
| `.incomingCall(opts)` | Incoming call | `device.at("30s").incomingCall({ callerId: "123", callerName: "Mom" })` |
| `.answerCall()` | Answer call | `device.at("35s").answerCall()` |
| `.endCall()` | End call | `device.at("60s").endCall()` |
| `.startBackgroundApp(opts)` | Start background | `device.at("5s").startBackgroundApp({ appId: "music", indicator: "music" })` |
| `.stopBackgroundApp(appId)` | Stop background | `device.at("10s").stopBackgroundApp("music")` |

---

## Device Profiles

### iPhone 16

```typescript
import { iPhone16Profile, iPhone16Frame } from "@tokovo/devices";

// Profile includes:
// - Screen dimensions: 1290 x 2796
// - Dynamic Island configuration
// - Camera behavior
// - Device sounds
```

### Pixel

```typescript
import { PixelProfile, PixelFrame } from "@tokovo/devices";

// Profile includes:
// - Screen dimensions: 1080 x 2400
// - Status bar widget area
// - Camera behavior
// - Device sounds
```

### Adding Custom Profiles

```typescript
const myProfile: DeviceProfile = {
    id: "my-device",
    name: "My Device",
    type: "phone",
    dimensions: { width: 1080, height: 2400 },
    screen: { width: 1080, height: 2400, ppi: 400, cornerRadius: 24 },
    pixelDensity: 3,
    sounds: {
        "device.notification": "sounds/my-device/notification.wav",
    },
};

DeviceRegistry.register("my-device", myProfile);
```

---

## Views

### StatusBar

```tsx
import { StatusBar } from "@tokovo/devices";

<StatusBar
    variant="ios"           // Uses StatusBarStrategyRegistry
    os={device.os}          // DeviceOSState
    theme="light"           // "light" | "dark"
    notificationIcons={[]}  // Android only
/>
```

### Convenience Components

```tsx
// Pre-themed variants
<DarkStatusBar os={device.os} />
<LightStatusBar os={device.os} />
```

---

## Plugin Contract

```typescript
import { DevicesPlugin } from "@tokovo/devices";

// Everything exported via plugin
DevicesPlugin.DeviceRegistry
DevicesPlugin.FrameRegistry
DevicesPlugin.StatusBarStrategyRegistry
DevicesPlugin.TrackBuilder
DevicesPlugin.StatusBar
DevicesPlugin.reducer
DevicesPlugin.v2Lowering
```

---

## Extensibility Examples

### Add Ghibli Theme

```typescript
import { StatusBarStrategyRegistry, FrameRegistry, DeviceRegistry } from "@tokovo/devices";

// Register Ghibli StatusBar
StatusBarStrategyRegistry.register("ghibli", GhibliStatusBarStrategy);

// Register Ghibli Frame
FrameRegistry.register("ghibli", GhibliPhoneFrame);

// Register Ghibli Profile
DeviceRegistry.register("ghibli", ghibliProfile);
```

### Use in Episode

```typescript
// Use Ghibli theme
<StatusBar variant="ghibli" os={device.os} />
const Frame = FrameRegistry.get("ghibli");
```

---

## Related Documentation

- [device-notifications.md](./device-notifications.md) - Notification system
- [core.md](./core.md) - Core engine
- [dsl.md](./dsl.md) - DSL patterns
