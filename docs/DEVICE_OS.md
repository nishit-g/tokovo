# Device OS Layer

> **Location**: `@tokovo/core` (types), `@tokovo/devices` (StatusBar), `@tokovo/dsl` (events)

The Device OS layer simulates operating system behaviors that make videos indistinguishable from real screen recordings.

---

## Overview

The Device OS layer manages:
- **Clock** - Status bar time display
- **Battery** - Battery percentage and charging state
- **Network** - WiFi, 5G, LTE, cellular signal strength
- **DND** - Do Not Disturb mode (moon icon)
- **Airplane Mode** - Disables all radios
- **Low Power Mode** - Yellow battery indicator

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FullRealityShowcase                     │
│  initialWorld.devices.phone.os = { clock, battery, ... }   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    dsl.os.setTime(30, ...)                  │
│                    dsl.os.setBattery(100, 85)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Engine (replay)                        │
│              processOSEvent() updates device.os             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     TokovoRenderer                          │
│         <DeviceFrame device={device}>                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       StatusBar                             │
│           <StatusBar os={device.os} />                      │
│  ┌─────────┬─────────┬─────────┬─────────┐                 │
│  │  Time   │ Network │  WiFi   │ Battery │                 │
│  │  14:45  │   5G    │   |||   │   87%   │                 │
│  └─────────┴─────────┴─────────┴─────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## DeviceOSState Interface

```typescript
interface DeviceOSState {
    // Time
    clock: number;           // Unix timestamp (ms)
    
    // Power
    battery: number;         // 0-100
    charging: boolean;
    lowPowerMode: boolean;
    
    // Network
    network: NetworkType;    // "wifi" | "5G" | "4G" | "LTE" | "3G" | "no-service"
    wifiStrength: number;    // 0-3
    cellStrength: number;    // 0-4
    airplaneMode: boolean;
    
    // Status
    dnd: boolean;            // Do Not Disturb
}

type NetworkType = "wifi" | "5G" | "4G" | "LTE" | "3G" | "no-service";
```

---

## Initial State

Set device OS state in your episode's `initialWorld`:

```typescript
const initialWorld: WorldState = {
    devices: {
        phone: {
            id: "phone",
            profileId: "iphone16",
            foregroundAppId: "app_whatsapp",
            notifications: [],
            
            // Device OS state
            os: {
                clock: new Date().setHours(14, 45, 0, 0),
                battery: 87,
                charging: false,
                network: "wifi",
                wifiStrength: 3,
                cellStrength: 4,
                dnd: false,
                lowPowerMode: false,
                airplaneMode: false,
            },
        },
    },
    // ... rest of world state
};
```

---

## DSL Events

### Set Time

```typescript
const startTime = new Date();
startTime.setHours(14, 45, 0, 0);

// Set initial time
dsl.os.setTime(0, startTime.getTime())

// Time advances during conversation
dsl.os.setTime(300, startTime.getTime() + 10000)  // +10 seconds
```

### Set Battery

```typescript
// Initial battery
dsl.os.setBattery(0, 87)

// Battery drains during usage
dsl.os.setBattery(200, 86)
dsl.os.setBattery(400, 85)

// Charging
dsl.os.setBattery(500, 86, true)  // Shows charging bolt
```

### Set Network

```typescript
// WiFi with full signal
dsl.os.setNetwork(0, "wifi", 3)

// Switch to cellular
dsl.os.setNetwork(100, "5G", 4)

// Lose signal
dsl.os.setNetwork(200, "no-service")
```

### Toggle DND

```typescript
// Enable Do Not Disturb (shows moon icon)
dsl.os.setDND(0, true)

// Disable
dsl.os.setDND(100, false)
```

### Toggle Airplane Mode

```typescript
// Enable (disables all network)
dsl.os.setAirplane(0, true)

// Disable
dsl.os.setAirplane(100, false)
```

---

## StatusBar Component

The StatusBar reads from `device.os` and displays:

| Property | Display |
|----------|---------|
| `os.clock` | Formatted time (e.g., "14:45") |
| `os.battery` | Battery icon with fill level |
| `os.charging` | Lightning bolt on battery |
| `os.network` | Network type label (5G, LTE) |
| `os.wifiStrength` | WiFi signal arcs |
| `os.cellStrength` | Cell signal bars |
| `os.dnd` | Moon icon |

### Signal Strength Icons

**WiFi** (3 bars): Arcs opacity based on `wifiStrength` (0-3)
**Cellular** (4 bars): Bar opacity based on `cellStrength` (0-4)

---

## Engine Processing

Events are processed by `processOSEvent()` in the engine:

```typescript
function processOSEvent(draft: WorldState, event: OSEvent): void {
    const device = draft.devices[event.deviceId];
    
    switch (event.type) {
        case "SET_TIME":
            device.os.clock = event.time;
            break;
            
        case "SET_BATTERY":
            device.os.battery = event.level;
            device.os.charging = event.charging ?? false;
            break;
            
        case "SET_NETWORK":
            device.os.network = event.network;
            break;
            
        case "SET_DND":
            device.os.dnd = event.enabled;
            break;
            
        case "SET_AIRPLANE":
            device.os.airplaneMode = event.enabled;
            if (event.enabled) {
                device.os.network = "no-service";
            }
            break;
    }
}
```

---

## Realism Tips

### Time Progression
```typescript
// Natural time flow during a 40-second video
dsl.os.setTime(0, TIME.getTime())
dsl.os.setTime(300, TIME.getTime() + 10000)   // +10s
dsl.os.setTime(600, TIME.getTime() + 20000)   // +20s
dsl.os.setTime(900, TIME.getTime() + 33000)   // +33s
```

### Battery Drain
```typescript
// Realistic drain during phone usage
// ~1% every 30 seconds of active use
dsl.os.setBattery(0, 87)
dsl.os.setBattery(300, 86)
dsl.os.setBattery(600, 85)
dsl.os.setBattery(900, 84)
```

### Network Transitions
```typescript
// Walk into subway (lose signal)
dsl.os.setNetwork(0, "wifi", 3)
dsl.os.setNetwork(200, "wifi", 2)
dsl.os.setNetwork(400, "wifi", 1)
dsl.os.setNetwork(500, "no-service")

// Exit subway
dsl.os.setNetwork(700, "4G", 2)
dsl.os.setNetwork(800, "4G", 4)
```

---

## Complete Example

```typescript
const START_TIME = new Date();
START_TIME.setHours(14, 45, 0, 0);

const events = [
    // === SCENE START ===
    // Full battery, WiFi, 2:45 PM
    
    // 5 seconds in: time advances
    dsl.os.setTime(150, START_TIME.getTime() + 5000),
    
    // 10 seconds: battery drains
    dsl.os.setBattery(300, 86),
    dsl.os.setTime(300, START_TIME.getTime() + 10000),
    
    // 20 seconds: switch to data
    dsl.os.setNetwork(600, "5G", 4),
    dsl.os.setTime(600, START_TIME.getTime() + 20000),
    
    // 30 seconds: DND enabled
    dsl.os.setDND(900, true),
    dsl.os.setBattery(900, 85),
    dsl.os.setTime(900, START_TIME.getTime() + 33000),
    
    // === SCENE END ===
];
```

---

## File Locations

| Purpose | Location |
|---------|----------|
| Types | `packages/core/src/types.ts` - DeviceOSState, NetworkType |
| Engine | `packages/core/src/engine.ts` - processOSEvent() |
| DSL | `packages/dsl/src/events/os.ts` - Event factories |
| Component | `packages/devices/src/StatusBar.tsx` - UI rendering |
| Wiring | `packages/renderer/src/DeviceFrame.tsx` - Passes device to StatusBar |
