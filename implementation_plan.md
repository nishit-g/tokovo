# Phase 2 Implementation Plan: Professional Engine

## Goal Description
Upgrade Tokovo from an MVP to a "Professional Engine" capable of producing high-quality, dynamic phone simulation videos. This includes polishing the Android experience, upgrading the Layout Engine for smooth scrolling, adding realistic animations (typing, notifications), introducing audio support, and adding the Instagram DM app.

## User Review Required
> [!IMPORTANT]
> **Audio Support**: I will be adding a new `AUDIO` event kind to `TimelineEvent`. This is a breaking change for the schema but necessary for sound effects.

> [!NOTE]
> **Android Assets**: For now, I will stick to the CSS-based Pixel frame but refine it. In the future, we should replace this with high-res PNG assets for better realism.

## Proposed Changes

### 1. Core Engine (`packages/core`)
#### [MODIFY] [types.ts](file:///Users/nishit.gupta/personal/tokovo/packages/core/src/types.ts)
- Add `AUDIO` kind to `TimelineEvent`.
- Add `sound` field to `DeviceState` (optional, for tracking active sounds).

### 2. Devices (`packages/devices`)
#### [MODIFY] [StatusBar.tsx](file:///Users/nishit.gupta/personal/tokovo/packages/devices/src/StatusBar.tsx)
- Accept `variant` prop ("ios" | "android").
- Render appropriate icons and layout for each variant.

#### [MODIFY] [pixel/Frame.tsx](file:///Users/nishit.gupta/personal/tokovo/packages/devices/src/pixel/Frame.tsx)
- Pass `variant="android"` to `StatusBar`.
- Refine CSS to look more like a Pixel UI (Material You vibes).

### 3. Renderer (`packages/renderer`)
#### [MODIFY] [LayoutEngine.ts](file:///Users/nishit.gupta/personal/tokovo/packages/renderer/src/LayoutEngine.ts)
- Implement `calculateScrollOffset` to determine the exact Y position of the chat container based on visible messages.
- Add `smoothScroll` logic (using linear interpolation or spring physics concepts).

#### [MODIFY] [TokovoRenderer.tsx](file:///Users/nishit.gupta/personal/tokovo/packages/renderer/src/TokovoRenderer.tsx)
- Integrate `Audio` component from Remotion to play sounds triggered by events.
- Render `NotificationOverlay` if notifications exist.
- Add `VisualDebugger` overlay (toggleable via prop).

#### [NEW] [VisualDebugger.tsx](file:///Users/nishit.gupta/personal/tokovo/packages/renderer/src/VisualDebugger.tsx)
- A simple overlay showing current `t`, active events, and basic state stats.

### 4. Apps (`packages/apps-whatsapp`)
#### [MODIFY] [ui.tsx](file:///Users/nishit.gupta/personal/tokovo/packages/apps-whatsapp/src/ui.tsx)
- **Typing Indicator**: Replace text with a `TypingBubble` component containing 3 animated dots.
- **Message Bubble**: Improve styling (tail, shadow) to match real WhatsApp more closely.
- **Scroll**: Use the new `scrollY` from Layout Engine.

#### [NEW] [TypingBubble.tsx](file:///Users/nishit.gupta/personal/tokovo/packages/apps-whatsapp/src/TypingBubble.tsx)
- A new component for the typing animation.

### 5. New App: Instagram DM (`packages/apps-instagram`)
#### [NEW] [index.ts](file:///Users/nishit.gupta/personal/tokovo/packages/apps-instagram/src/index.ts)
- Export runtime and UI.

#### [NEW] [runtime.ts](file:///Users/nishit.gupta/personal/tokovo/packages/apps-instagram/src/runtime.ts)
- Reducer for Instagram-specific events (likes, seen).

#### [NEW] [ui.tsx](file:///Users/nishit.gupta/personal/tokovo/packages/apps-instagram/src/ui.tsx)
- React components for Instagram DM UI (dark mode default).

### 6. Notifications (New Feature)
#### [NEW] [NotificationOverlay.tsx](file:///Users/nishit.gupta/personal/tokovo/packages/renderer/src/NotificationOverlay.tsx)
- A component to render notifications sliding in from the top.
- Supports iOS and Android styles.

## Verification Plan

### Automated Tests
- Run `turbo dev --filter=video-runner` to preview changes.

### Manual Verification
1.  **Android Test**: Render `android-test.json` and verify the Pixel frame, status bar, and notification appearance.
2.  **WhatsApp Test**: Render `whatsapp-breakup-01.json` and verify:
    -   Typing indicator animation.
    -   Smooth scrolling when new messages appear.
    -   Audio effects (if added).
3.  **Instagram Test**: Create `instagram-test.json` and verify the new app renders correctly.
