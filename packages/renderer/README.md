# Tokovo Layout System — Unified Spec (All UI Types)

## 0. Concept

The **Tokovo Layout System** is the layer that turns:

* `WorldState` (devices, conversations, notifications, camera, etc.)
* episode timeline (via `replay(...)`)
* current frame/time `t`
* active device + app + view type

into **view-specific layouts** for:

* Chat views
* Feed views
* Story views
* Lockscreen views
* Transitional/cinematic scenes

Each layout is:

* deterministic
* frame-driven
* Remotion-safe (no DOM measurement / no CSS transitions)

---

## 1. Core Types

### 1.1 ViewKind

```ts
export type ViewKind =
  | "CHAT"
  | "FEED"
  | "STORY"
  | "LOCKSCREEN"
  | "TRANSITION";
```

### 1.2 LayoutContext (global)

```ts
export interface LayoutContext {
  world: WorldState;
  t: number; // current frame
  activeDeviceId: string;
  activeAppId: string;
  viewKind: ViewKind;

  // View-specific selectors
  activeConversationId?: string;   // CHAT
  activeFeedId?: string;           // FEED (e.g. timeline id)
  activeStoryId?: string;          // STORY (e.g. story reel id)

  viewportWidth: number;
  viewportHeight: number;

  // Optional configuration overrides
  config?: Partial<LayoutConfig>;
}
```

> **Note:** different view kinds will care about different selectors (e.g., `activeConversationId` only matters for `"CHAT"`).

---

## 2. LayoutConfig (global + per-view strategy)

```ts
export interface LayoutConfig {
  // Global-ish things
  cinematicMode: "NONE" | "FOLLOW_LAST_MESSAGE" | "FOCUS_ON_RANGE";

  // Chat-specific
  chat: ChatLayoutConfig;

  // Feed-specific
  feed: FeedLayoutConfig;

  // Story-specific
  story: StoryLayoutConfig;

  // Lock screen
  lockscreen: LockscreenLayoutConfig;

  // Transitions
  transition: TransitionLayoutConfig;
}
```

You’ll define **per-view configs**:

### 2.1 ChatLayoutConfig (what we already designed)

```ts
export interface ChatLayoutConfig {
  bubbleWidth: number;
  baseBubbleHeight: number;
  charsPerLine: number;
  lineHeight: number;
  verticalGap: number;
  topPadding: number;
  bottomPadding: number;

  messageAppearDuration: number;
  messageAppearOffset: number;
  scrollEasingDuration: number;
  maxScrollCatchupSpeed: number;

  lockToBottom: boolean;
}
```

### 2.2 FeedLayoutConfig (for Instagram / X / TikTok feeds)

```ts
export interface FeedLayoutConfig {
  cardWidth: number;
  baseCardHeight: number;
  verticalGap: number;
  topPadding: number;
  bottomPadding: number;

  // For variable-height posts, same trick as chat:
  charsPerLine: number;
  lineHeight: number;

  scrollEasingDuration: number;
  maxScrollCatchupSpeed: number;

  startAtTop: boolean;      // typical feed behaviour
  autoScroll?: boolean;     // for cinematic auto-scroll episodes
}
```

### 2.3 StoryLayoutConfig (Instagram Stories / Snap)

```ts
export interface StoryLayoutConfig {
  // Each story = full-screen page
  defaultStoryDuration: number; // in frames
  progressBarHeight: number;
  storyGap: number;             // for 3D-ish page stack if needed

  // Animation
  storyTransitionDuration: number; // frames between stories
}
```

### 2.4 LockscreenLayoutConfig

```ts
export interface LockscreenLayoutConfig {
  topPadding: number;
  notificationGap: number;
  notificationWidth: number;
  baseNotificationHeight: number;
  charsPerLine: number;
  lineHeight: number;

  stackMaxNotifications: number; // older ones collapsed/hidden
  appearDuration: number;
}
```

### 2.5 TransitionLayoutConfig

```ts
export interface TransitionLayoutConfig {
  // Device position in composition
  defaultScale: number;
  zoomedScale: number;
  panDuration: number;
  zoomDuration: number;

  // Optionally, per-transition presets (open app, unlock, etc.)
}
```

---

## 3. LayoutState — Tagged Union (all view kinds)

Single function, **multi-view outputs**:

```ts
export type LayoutState =
  | ChatLayoutState
  | FeedLayoutState
  | StoryLayoutState
  | LockscreenLayoutState
  | TransitionLayoutState;
```

Each state has a `kind` field:

```ts
export interface BaseLayoutState {
  kind: ViewKind;
}
```

---

### 3.1 ChatLayoutState

```ts
export interface ChatLayoutState extends BaseLayoutState {
  kind: "CHAT";
  scrollY: number;
  contentHeight: number;
  isAtBottom: boolean;
  messageLayouts: Record<string, ChatMessageLayout>;
  typingLayout?: TypingLayout | null;
  meta: ChatLayoutMeta;
}
```

Where `ChatMessageLayout`, `TypingLayout`, `ChatLayoutMeta` are what we already specced (id, y, height, opacity, translateY, etc.).

---

### 3.2 FeedLayoutState

```ts
export interface FeedLayoutState extends BaseLayoutState {
  kind: "FEED";
  scrollY: number;
  contentHeight: number;
  isAtBottom: boolean;
  itemLayouts: Record<string, FeedItemLayout>;
  meta: FeedLayoutMeta;
}
```

```ts
export interface FeedItemLayout {
  id: string;
  y: number;
  height: number;
  opacity: number;
  translateY: number;
  scale: number;   // for subtle parallax / entry
}
```

`FeedLayoutMeta` can include:

```ts
export interface FeedLayoutMeta {
  firstVisibleItemId?: string;
  lastVisibleItemId?: string;
  focusedItemId?: string; // for cinematic highlight
}
```

The **geometry model** is similar to chat: stack cards with a deterministic height function (based on text length, optional media flags, etc.).

---

### 3.3 StoryLayoutState

```ts
export interface StoryLayoutState extends BaseLayoutState {
  kind: "STORY";
  activeStoryIndex: number;
  storyCount: number;
  storyProgress: number; // 0..1 within current story
  storyLayouts: StoryItemLayout[];
}
```

```ts
export interface StoryItemLayout {
  id: string;
  index: number;
  // For 3D card stack / page-motion effects:
  translateX: number;
  translateY: number;
  scale: number;
  opacity: number;
}
```

Behaviour:

* Given timeline of stories (either from episode or world state),
* Given `t`, compute which story index is active and the progress inside that story:

  ```ts
  const storyIndex = floor((t - startT) / storyDuration);
  const localProgress = ((t - startT) % storyDuration) / storyDuration;
  ```
* Use `storyTransitionDuration` to add slide/fade between storyIndex and storyIndex+1.

---

### 3.4 LockscreenLayoutState

```ts
export interface LockscreenLayoutState extends BaseLayoutState {
  kind: "LOCKSCREEN";
  notificationLayouts: NotificationLayout[];
  meta: LockscreenLayoutMeta;
}
```

```ts
export interface NotificationLayout {
  id: string;
  y: number;
  height: number;
  opacity: number;
  translateY: number;
}
```

The inputs come from `device.notifications` in `WorldState`. 

Geometry is again deterministic: approximate height from title/body length and stack them with gap & padding. Animation: when a notification appears at `event.at`, fade/slide it in similar to messages.

---

### 3.5 TransitionLayoutState

```ts
export interface TransitionLayoutState extends BaseLayoutState {
  kind: "TRANSITION";
  // These values are for the outer DeviceFrame / TokovoRenderer
  deviceTranslateX: number;
  deviceTranslateY: number;
  deviceScale: number;
  deviceRotation: number;
  overlayOpacity: number;
  meta: TransitionLayoutMeta;
}
```

This layer treats the **device as an actor** in the composition:

* Unlock animation: fade in, scale up from center.
* Open app: slight bump-in, tilt, zoom.
* Cutscenes: pan device left/right, etc.

The inputs can be:

* Derived from `world.camera` (if you extend it with more camera modes) 
* Derived from timeline CAMERA events (already defined in your `TimelineEvent` union). 

---

## 4. The Core Function

Single entry point:

```ts
export function computeLayout(ctx: LayoutContext): LayoutState {
  switch (ctx.viewKind) {
    case "CHAT":
      return computeChatLayout(ctx);
    case "FEED":
      return computeFeedLayout(ctx);
    case "STORY":
      return computeStoryLayout(ctx);
    case "LOCKSCREEN":
      return computeLockscreenLayout(ctx);
    case "TRANSITION":
      return computeTransitionLayout(ctx);
  }
}
```

Each `computeXLayout` is:

* pure
* deterministic
* uses only `world`, `t`, `config` and known IDs.

---

## 5. Determinism & Remotion Rules (still apply for ALL)

For **every** viewKind:

* ❌ No DOM measurement / `getBoundingClientRect()`

* ❌ No CSS transitions / `transition: ...`

* ❌ No `setTimeout`, `requestAnimationFrame` inside animation logic

* ❌ No randomness (or if used, seed-based deterministic)

* ✅ All animation values: pure math from `(t, world, config)`

* ✅ `useCurrentFrame()` and `useVideoConfig()` only used to get `t` and fps

* ✅ Styling is done in React via inline styles using the LayoutState

This is consistent with Remotion’s SSR + frame-based rendering model and your current `TokovoRenderer` usage. 

---

## 6. Integration in TokovoRenderer

Your `TokovoRenderer` can now:

1. **Decide which viewKind** to use:

   * If device is locked → `LOCKSCREEN`
   * If app is WhatsApp/IG DM → `CHAT`
   * If app is Instagram feed → `FEED`
   * If app is stories → `STORY`
   * If you insert explicit camera transition scenes → `TRANSITION`

2. Call:

```ts
const layout = computeLayout({
  world,
  t,
  activeDeviceId,
  activeAppId,
  viewKind,
  activeConversationId,
  viewportWidth: deviceWidth,
  viewportHeight: deviceHeight,
});
```

3. Pass `layout` down to the specific App View, which will branch based on `layout.kind` and render accordingly.
