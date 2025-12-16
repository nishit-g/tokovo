# 🔔 Notification Architecture: The "True OS" Model

## The Goal
To simulate ANY notification system (iOS 16 Dynamic Island, Android 14 Shade, iOS 10 Banner) without hardcoding logic in the Renderer.

## The Problem
Notifications are complex interaction points involving two players:
1.  **The OS (Container):** Controls *where* it appears (HeadsUp, LockScreen, Island), stacking, blurring, physics.
2.  **The App (Content):** Controls *what* is inside (Text, Images, Buttons, Custom UI).

Current architecture mixes these. `HeadsUpNotification.tsx` assumes an iOS-like blur pill.

## 🏗️ Proposed Architecture

### 1. The Container Layer (OS Driven)
The **Device Profile** should dictate the Notification Strategy.

```typescript
// @tokovo/devices/src/types.ts
interface NotificationStrategy {
    // How to render the HeadsUp container?
    headsUpComponent: React.ComponentType<ContainerProps>;
    
    // How to render the LockScreen stack?
    lockScreenLayout: (notifications: Notification[]) => LayoutResult;
    
    // How to render the Shade (Pulldown)?
    shadeComponent: React.ComponentType<ShadeProps>;
}
```
**Examples:**
- `iPhone16Strategy`: Uses Dynamic Island for active, Glassmorphism pills for others. Bottom-stacked LockScreen.
- `PixelStrategy`: Uses Material You colors, flat cards. Center-stacked LockScreen.
- `OldIOSStrategy`: Uses non-dynamic banners, simple list.

### 2. The Content Layer (App Driven)
Apps register a **Notification Renderer** for their specific content types.
Most apps use the **Standard Adapter**, but complex apps need control.

```typescript
// @tokovo/core/src/notification-registry.ts
interface NativeNotificationContent {
    title: string;
    body: string;
    icon: string;
    buttons?: Button[];
}

interface NotificationRenderer {
    // Standard view
    renderContent: (n: Notification) => React.ReactNode;
    
    // Dynamic Island specific (if supported)
    renderDynamicIsland?: (n: Notification, mode: "compact" | "expanded") => React.ReactNode;
}
```

---

## 💻 3. App Registration & DSL Interface

How do apps actually participate in this system?

### A. Automatic Registration (The "One-Liner")
Apps must register their identity so the OS knows their color/icon.

```typescript
// packages/apps-whatsapp/src/index.ts
import { AppRegistry } from "@tokovo/core";

AppRegistry.registerMetadata("app_whatsapp", {
    displayName: "WhatsApp",
    themeColor: "#25D366",
    icon: "W", // or require("./assets/icon.png")
    // Definition of notification channels (Optional)
    channels: {
        "messages": { importance: "high", sound: "whatsapp_received" },
        "groups": { importance: "default" }
    }
});
```

### B. Triggering via DSL
Authors have two ways to create notifications.

#### Method 1: Implicit (Behavioral)
The generic `messages.send` DSL automatically creates a notification because the OS observes the "Message Received" event.
```typescript
// Implicitly creates a notification based on App Metadata
dsl.messages.send(0, "app_whatsapp", "Hello!"); 
```

#### Method 2: Explicit (Generic)
For non-chat events (Likes, System alerts, Uber rides).
```typescript
// New DSL Namespace
dsl.notification.schedule(frame, {
    appId: "app_instagram",
    title: "zuck liked your photo",
    body: "12m ago",
    icon: "heart_icon", // Resolved by App Bundle
    // Optional: Dynamic content
    payload: { type: "like", postId: "123" }
});
```

### C. DSL Type Safety
Using Module Augmentation, we valid `appId` in the DSL.
```typescript
dsl.notification.schedule(0, {
    appId: "app_whatsapp", // ✅ Autocomplete works
    ...
})
```

---

## 🧩 The Flow

1.  **Event:** DSL triggers `dsl.messages.send(...)` -> Notification Created.
2.  **Engine:** Updates `DeviceState.notifications`.
3.  **Renderer (DeviceFrame):**
    - Checks `DeviceProfile.notificationStrategy`.
    - Renders `<Strategy.HeadsUpContainer>`.
4.  **Container:**
    - Resolves App ID to get `NotificationRenderer`.
    - Renders `<AppRenderer.renderContent />` inside the glass/material card.
    
---

## 📱 Scenario Breakdown

### Scenario A: Dynamic Island (iOS 16+)
- **Container:** `DynamicIsland.tsx` (part of iPhone16Profile).
- **Strategy:** If `notification.priority === 'high'`, expand island.
- **Content:** Calls `App.renderDynamicIsland("expanded")`.
- **Result:** Seamless animation from pill to large card.

### Scenario B: Android Shade
- **Container:** `AndroidShade.tsx` (part of PixelProfile).
- **Strategy:** Full screen overlay. Group by "Conversation" vs "Silent".
- **Content:** Render standard content views.
- **Result:** Material Design list with "Clear All" button.

### Scenario C: Lock Screen Stacks
- **Container:** `LockScreenStack.tsx`.
- **Strategy:** f(scroll). iOS = stack at bottom, fan out on scroll. Android = linear list.
- **Content:** Standard views.
- **Result:** Unique feel per device.

## 🚀 Implementation Roadmap

1.  **Decouple Branding:** `AppMetadataRegistry` (Essential first step).
2.  **Generic Notification DSL:** Implement `dsl.notification.schedule`.
3.  **Abstract Container:** Move `HeadsUpNotification` logic to `devices/src/ios/NotificationContainer.tsx`.

---


---

## 🛠️ 3. The Core Types (Refined)

We split the "Request" (IR) from the "State" (Instance).

### A. The Immutable Request (IR)
What the app sends. Stable, serializable, and device-agnostic.
```typescript
interface NotificationIR {
    // Identity
    id: string;
    appId: string;
    channelId?: string; // e.g. "messages", "promotions"
    
    // Content
    title: string;
    body: string;
    icon?: string;      // Asset Ref
    payload?: any;      // Custom data for custom renderers
    
    // Semantics
    category?: "message" | "call" | "system" | "reminder";
    threadKey?: string; // "chat_alice"
    groupKey?: string;  // "whatsapp_messages"
    peopleIds?: string[]; // ["alice"] - for focus modes
    
    // Actions
    actions?: Array<{ id: string; label: string; icon?: string }>;
}
```

### B. The Mutable State (Instance)
What the Engine tracks. Includes lifecycle, timestamps, and OS state.
```typescript
interface NotificationInstance {
    // Reference
    id: string;
    ir: NotificationIR;
    
    // Lifecycle
    state: "queued" | "headsUp" | "inShade" | "onLockscreen" | "dismissed";
    
    // Timestamps (Frame numbers)
    createdAtFrame: number;
    deliveredAtFrame?: number;
    shownAtFrame?: number;
    dismissedAtFrame?: number;
    expiresAtFrame?: number;
    
    // Computed Priority
    importance: "low" | "default" | "high" | "critical";
}
```

---

## 🏗️ 4. The Rendering Pipeline

We use a Factory pattern to keep the Renderer/Container purely visual.

### Step 1: Layout & Modes
The OS Strategy requests a specific **Presentation Mode**.

```typescript
type NotificationPresentation =
  | { surface: "headsUp"; mode?: "compact"|"expanded" }
  | { surface: "lockscreen"; mode?: "stacked"|"list" }
  | { surface: "shade"; mode?: "grouped"|"list" }
  | { surface: "dynamicIsland"; mode: "pill"|"expanded" }
```

### Step 2: The View Factory
The Container asks the factory: *"Give me a React Node for this Notification in this Mode."*

```typescript
// Renderer/src/NotificationViewFactory.ts
function createNotificationView(
    notification: NotificationInstance, 
    presentation: NotificationPresentation
): React.ReactNode {
    // 1. Resolve App Plugin
    const plugin = AppRegistry.getPlugin(notification.ir.appId);
    
    // 2. Ask Plugin to render (or use default)
    return plugin.renderNotification(notification.ir, presentation);
}
```
**Benefit:** The `HeadsUpContainer` doesn't know about `AppRegistry`. It just calls `createNotificationView`.

### Step 3: Layout Snapshots (Crucial for Camera)
Every container (Lockscreen, HeadsUp, etc.) must expose standardized layout rects. This allows the Semantic Camera to say "Focus on Notification X".

```typescript
interface NotificationLayoutSnapshot {
  surface: "headsUp" | "lockscreen" | "shade";
  byNotificationId: Record<string, LayoutRect>; // { x, y, width, height }
}
// This Snapshot is fed into AnchorRegistry automatically.
```

---

## 🧠 5. The Policy Engine (Double Filter)

Who decides if it buzzes? A Two-Layer Policy.

**Layer 1: Engine Policy (The Rules)**
Executes automatically when `MESSAGE_RECEIVED` occurs.
*   Maps event -> `NotificationIR`.
*   Checks **OS Rules** (DND, Sleep Mode, Low Power).
*   *Result:* Creates `NotificationInstance` (or drops it).

**Layer 2: App Policy (Contextual)**
Apps can intercept creation if "In-Context".
*   *Scenario:* User is in WhatsApp chat with Alice.
*   *Check:* `AppReducer` sees active screen matches thread.
*   *Result:* App flags `NotificationIR` as `silent` or suppresses it.

**Flow:**
`Event (Msg)` -> `App Context Check` -> `OS DND Check` -> `Notification Instance` -> `Renderer`

---

---

## 🎨 The Architectural Flow (Visualized)

Here is how a single line of DSL code transforms into a pixel-perfect, device-specific UI element.

```text
       AUTHOR (You)
             │
             │ writes: dsl.notification.schedule(0, { appId: "whatsapp", title: "Hi" })
             ▼
      +--------------+
      |  DSL / IR    |  <-- Generic Data: { title: "Hi", icon: "W" }
      +--------------+      (No mention of "Blur" or "Material")
             │
             ▼
      +--------------+
      |    ENGINE    |  <-- Updates DeviceState.notifications
      +--------------+
             │
             ▼
      +--------------+
      |   RENDERER   |  <-- "I need to draw a notification. What device is this?"
      +--------------+
             │
      SWAP DEVICE (iPhone <--> Pixel)
             │
    +-------------------------+-------------------------+
    ▼                         ▼                         ▼
+----------------+    +----------------+    +----------------+
| iPhone 16      |    | Pixel 9        |    | iPhone 8       |
| Strategy       |    | Strategy       |    | Strategy       |
+----------------+    +----------------+    +----------------+
    │ Uses:               │ Uses:               │ Uses:
    │ DynamicIsland       │ MaterialCard        │ GlassBanner
    │                     │                     │
    ▼                     ▼                     ▼
+----------------+    +----------------+    +----------------+
|  CONTAINER UI  |    |  CONTAINER UI  |    |  CONTAINER UI  |
| (Black Pill)   |    | (Opaque Card)  |    | (Blurry Rect)  |
+----------------+    +----------------+    +----------------+
        │                     │                     │
        └─────────► SAME CONTENT ◄─────────┘
              (WhatsApp Icon + "Hi")
```

## 🏆 Is this "The Best"?

**Yes.** This architecture mimics real operating systems.

1.  **Universal Extensibility:**
    *   **Apps** don't need to know about the device. WhatsApp doesn't code a "Dynamic Island View". It just provides data. The OS handles the Island.
    *   **Devices** don't need to know about apps. The OS draws the container, then asks the App Registry for the icon/content.


2.  **Automatic Device Switching:**
    *   Because the **IR** (Intermediate Representation) is generic (`title`, `body`, `icon`), changing the `deviceProfile` from `iphone16` to `pixel` changes the **Container Strategy**.
    *   **Result:** You change *one word* in your script, and the entire notification system morphs from iOS Dynamic Island to Android Material Shade, instantly.

3.  **Future Proof:**
    *   When iOS 19 comes out with a new notification style, you add `iPhone19Strategy`. All existing apps (WhatsApp, Twitter) work immediately on the new device without updates.

---

## 🤯 The Final Frontier: LockScreen as an App

You asked: *"What about coupling with Lockscreen? Can it be a plugin?"*

**YES.** In the ultimate version of this architecture:

**LockScreen is just a System App.** 
**HomeScreen is just a System App (Launcher).**

1.  **Registry:**
    ```typescript
    AppRegistry.register("sys_lockscreen_ios18", IOS18LockScreen);
    AppRegistry.register("sys_launcher_ios", IOSLauncher);
    ```

2.  **Device Profile:**
    ```typescript
    const iPhone16Profile = {
        lockAppId: "sys_lockscreen_ios18",
        launcherAppId: "sys_launcher_ios",
        // ...
    }
    ```

3.  **Renderer (The "Simple" Loop):**
    ```typescript
    if (device.isLocked) {
        return <AppRenderer appId={deviceProfile.lockAppId} />;
    } else if (device.activeApp) {
        return <AppRenderer appId={device.activeApp} />;
    } else {
        return <AppRenderer appId={deviceProfile.launcherAppId} />;
    }
    ```

**Result:** The Renderer becomes **10 lines of code**. It knows *nothing*.
It just renders whatever "App" is active. Whether that's WhatsApp, the LockScreen, or the Home Screen.

**Validation:**
*   Notifications on LockScreen? The `IOSLockScreen` app imports logic from `NotificationCore` to show them.
*   Notifications on Launcher? The `IOSLauncher` app imports logic to show Badges.

This is the **Holy Grail** of decoupling. We should aim for this.
