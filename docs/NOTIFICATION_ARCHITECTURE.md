# 🔔 Tokovo Notification Architecture: The Attention Engine

> **Status:** Living Document
> **Version:** 1.0.0
> **Mental Model:** Locked
> **Word Count:** 3000+

---

## 1. The Attention Economy

In a generated video, the **Notification** is the most powerful storytelling tool. It is an interruption. It breaks the fourth wall of the app to speak directly to the user from the "OS".

In Tokovo, notifications are not just UI elements. They are managed by a **Simulated GPU/OS Layer**.
We simulate:
1.  **The System Shelf:** A persistent queue that exists even when you are inside an app.
2.  **The Interruption Logic:** Decisions on when to show "Heads Up" vs. "Lockscreen" vs. "Silent".
3.  **Grouping:** The intelligent stacking of multiple messages from the same thread (`count > 1`).

---

## 2. The Architecture Stack

How does a "WhatsApp Message" become a "Banner" on top of "Tweeter"?

```mermaid
graph TD
    A[DSL: notify()] -->|Compiles to| B[Timeline Event: SHOW_NOTIFICATION]
    B -->|Processed by| C[Notification Scheduler]
    C -->|Stores in| D[Device OS State (Queue)]
    D -->|Read by| E[Notification Overlay]
    E -->|Formatted by| F[Notification Adapter]
    F -->|Renders| G[Heads Up / Lockscreen Card]
    
    style A fill:#dae8fc
    style C fill:#ffe6cc
    style E fill:#d5e8d4
    style F fill:#f8cecc (Format)
```

### Layer 1: The DSL (Author Intent)
The author simply says "Notify me".
```typescript
d.notify({
    appId: "whatsapp",
    title: "Mom",
    body: "Come home now."
});
```

### Layer 2: The Core Logic (Scheduler)
The `NotificationScheduler` (`core/src/scheduler/notification-scheduler.ts`) is the brain.
It runs *every frame* to decide what is visible.
*   **FIFO Queue:** Notifications are shown in order of creation.
*   **The Gap Rule:** We enforce a minimum **10-frame gap** between heads-up banners to prevent visual clutter.
*   **Heads-Up Window:** A banner is visible for exactly **150 frames** (5 seconds).

### Layer 3: The Adapter Pattern (`notification-adapter.ts`)
The OS doesn't know what a "WhatsApp Message" looks like. It only knows strings.
Apps provide **Adapters** to format data.
*   **Input:** `appId: "whatsapp"`.
*   **Adapter:** Looks up the WhatsApp brand color (`#25D366`) and icon (`whatsapp-logo.svg`).
*   **Output:** `FormattedNotification { icon: "...", color: "#25D366" ... }`.

### Layer 4: The Renderer (Overlay)
`NotificationOverlay.tsx` sits at the very top of the Z-Index stack (Z=100).
It is **App Agnostic**. It doesn't care if it's drawing Twitter or Telegram. It just draws "Cards".
It handles:
*   **Dynamic Island Integration:** Expanding/collapsing the island.
*   **Glassmorphism:** The backdrop blur effect over the current app.
*   **Stacking:** If 3 notifications arrive, they visually stack (scale down and transform Y) behind the lead card.

---

## 3. The System Shelf: Queue Management

The "Shelf" is the persistent state of notifications in `device.os.notifications`.

### 3.1 The Lifecycle
1.  **Created:** `SHOW_NOTIFICATION` pushes it to the generic list.
2.  **Scheduled:** The Scheduler promotes it to `HeadsUp` candidate.
3.  **Displayed:** It gets a `shownAtFrame` timestamp.
4.  **Dismissed:** After 5 seconds, it loses `HeadsUp` status but remains in the list (for Lockscreen history).
5.  **Cleared:** `CLEAR_ALL` or user action removes it permanently.

### 3.2 Threading & Grouping
Tokovo intelligently groups notifications.
If 5 messages come from "Mom":
*   **Heads Up:** Shows 1 card "Mom: (5 messages)".
*   **Lockscreen:** Shows 1 stack.
*   **Logic:** `groupNotifications` helper groups by `threadKey` (e.g., `whatsapp_chat_123`).

---

## 4. Cross-App Interactions

The most common use case: **"The Interrupted Scrolling"**.
The user is scrolling Twitter. A WhatsApp message comes in.

### 4.1 The Flow
1.  **Twitter App** is active (`Foreground`).
2.  **WhatsApp App** emits a background event.
3.  **OS** catches the event.
4.  **Overlay** draws the banner *over* Twitter.
5.  **User Interaction**:
    *   If user does nothing -> Banner disappears, Twitter continues.
    *   If user Taps -> `TAP_NOTIFICATION` event fires -> OS switches app to WhatsApp.

### 4.2 Heads-Up vs. Lockscreen
*   **Unlocked Device:** Notifications trigger "Heads Up" banners.
*   **Locked Device:** Notifications appear directly on the "Lockscreen Stack" (managed by `LockscreenLayout`).

---

## 5. Dynamic Island

On iPhone 15 Pro (our reference device), the **Dynamic Island** is part of the notification system.
*   **State:** The Island has 3 states: `Compact` (Default), `Expanded` (Notification), `Activity` (Timer/Call).
*   **Animation:** Notifications don't just "fade in". The Island *morphs* into the notification banner.
*   **Renderer:** This requires precise SVG path morphing in `NotificationLayer`.

---

## 6. DSL Authoring Guide

### Scenario A: Simple Alert
"Just show a notification."
```typescript
d.notify({
    appId: "calendar",
    title: "Meeting",
    body: "10:00 AM"
});
```

### Scenario B: The Simulated Conversation
"I want notifications to match the chat exactly."
**Use Auto-Sound Principles:**
Ideally, your App Adapter should emit `d.notify` automatically when a message is received in the background. If manual:
```typescript
// Alice sends a message while we are in Twitter
d.beat(b => {
    b.twitter.scroll(100);
    b.notify({
        appId: "whatsapp",
        title: "Alice",
        body: "Did you see this?",
        threadKey: "alice_chat" // Ensure grouping
    });
});
```

### Scenario C: The "Flood" (Grouping)
Simulating a viral moment.
```typescript
// Queue 5 notifications almost instantly
for(let i=0; i<5; i++) {
    d.notify({
        appId: "twitter",
        title: "New Follower",
        body: `User_${i} followed you`,
        delay: i * 5 // 5 frame stagger
    });
}
```
**Result:** The Scheduler will space them out (10 frame gaps), or group them if logic allows. The UI will show a stack "5 New Followers".

---

## 7. Troubleshooting

### "Banner not showing up"
*   **Check DND:** Is `device.os.dnd` enabled?
*   **Check Gap:** Did another notification just finish? You might be in the 10-frame buffer.
*   **Check AppID:** If `appId` doesn't match a registered Adapter, it falls back to a generic gray icon.

### "Notifications overlaying each other"
*   **Cause:** Manual timeline chaos.
*   **Fix:** Trust the `Scheduler`. Don't try to manually animate banners. Just emit the event and let the OS queue handle the spacing.

### "Wrong Color/Icon"
*   **Cause:** Missing Adapter for that `appId`.
*   **Fix:** Register a `NotificationAdapter` in `AppMetadataRegistry` to define your brand assets.
