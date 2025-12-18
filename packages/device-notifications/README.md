# @tokovo/device-notifications

> Enterprise-grade notification system for Tokovo.

## Installation

```bash
pnpm add @tokovo/device-notifications
```

## Quick Start

```typescript
import { NotificationTrackBuilder } from "@tokovo/device-notifications";

let order = 0;
const getOrder = () => order++;

const noti = new NotificationTrackBuilder(30, "phone", getOrder);

// Show notification
noti.at("2s").show({
    appId: "app_whatsapp",
    title: "Alex",
    body: "Hey! How are you?",
    mode: "headsup",
});

// Dismiss
noti.at("5s").dismiss("notif_1");

// Tap (opens app)
noti.at("3s").tap("notif_1");

// Dynamic Island
noti.at("0s").dynamicIsland({ mode: "expanded", appId: "app_music" });

// Clear all
noti.at("10s").clearAll();
```

## API

### NotificationTrackBuilder

| Method | Description |
|--------|-------------|
| `at(time)` | Set time for next action |
| `.show(opts)` | Show notification |
| `.dismiss(id)` | Dismiss notification |
| `.tap(id)` | Tap notification |
| `.swipe(id, dir)` | Swipe notification |
| `.dynamicIsland(opts)` | Update Dynamic Island |
| `.openPanel()` | Open notification panel |
| `.clearAll()` | Clear all notifications |

## Architecture

This is a **pure logic package** - no views. Views stay in `@tokovo/renderer`.

See `docs/NOTI_ARCH.md` for full architecture details.
