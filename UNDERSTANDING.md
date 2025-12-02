# Tokovo Codebase Understanding

## 1. Project Overview

Tokovo is a **programmable phone-simulation engine** designed to generate high-fidelity phone UI videos from structured data (JSON/TS episodes). It leverages **React** and **Remotion** to render these videos deterministically.

The project is structured as a **PNPM monorepo** using **Turbo** for build orchestration. It separates the core logic (state management, event replay) from the presentation layer (device frames, app UIs) and the content layer (episodes).

### Core Value Proposition
- **Deterministic Rendering**: The entire video is a function of `initialWorld` + `events[]` over time.
- **Modularity**: Devices and Apps are pluggable modules.
- **AI-Ready**: The "Episode as Code" (JSON) approach makes it ideal for LLM-generated content.

---

## 2. Architecture Analysis

The architecture follows a clean **layered approach**:

### Layer 1: Core Engine (`packages/core`)
- **Responsibility**: Pure logic and state management. No UI dependencies.
- **Key Concepts**:
    - `TimelineEvent`: A discriminated union of all possible actions (DEVICE, APP, CAMERA).
    - `WorldState`: The complete state of the simulation at any given time `t`.
    - `replay(initial, events, t)`: A pure function that computes the `WorldState` by applying events up to time `t`.
- **Tech Stack**: TypeScript, Immer (for immutable state updates).

### Layer 2: Presentation Layer (`packages/devices`, `packages/apps-*`, `packages/renderer`)
- **Responsibility**: Visualizing the `WorldState`.
- **Components**:
    - **Devices**: `packages/devices` exports `DeviceProfile` (assets, dimensions, safe areas) and `deviceReducer`.
    - **Apps**: `packages/apps-whatsapp` (and others) export runtime reducers and React UI components.
    - **Renderer**: `packages/renderer` orchestrates the rendering. It uses a **Layout Engine** to compute derived layout properties (e.g., scroll positions) before passing them to the **Render Engine** (React components).
- **Registry**: A central `AppRegistry` maps `appId` to its corresponding runtime and view.

### Layer 3: Content Layer (`packages/episodes`)
- **Responsibility**: Defining the stories.
- **Format**: JSON files (or TS objects) containing `initialWorld` and an array of `events`.
- **Validation**: Uses **Zod** schemas to ensure episode validity before rendering.

### Layer 4: Execution Layer (`apps/video-runner`)
- **Responsibility**: The actual Remotion application that loads episodes and renders the video.
- **Entry Point**: `pnpm render` or `turbo dev`.

---

## 3. Current Implementation Status (Phase 1 MVP)

Based on the codebase exploration, the following features are implemented:

- **Monorepo Structure**: Functional with PNPM and Turbo.
- **Core Types**: `TimelineEvent`, `WorldState`, `DeviceState`, `ConversationState` are defined in `packages/core/src/types.ts`.
- **Episode Structure**: JSON example (`whatsapp-breakup-01.json`) exists and follows the schema.
- **Basic Event Types**:
    - `DEVICE`: LOCK, UNLOCK, OPEN_APP, CLOSE_APP, SHOW_NOTIFICATION.
    - `APP`: MESSAGE_RECEIVED, TYPING_START, TYPING_END.
    - `CAMERA`: SET_VIEW.
- **WhatsApp App**: Basic structure for `apps-whatsapp` exists.
- **Device Profile**: `iphone16` profile structure is in place.

---

## 4. Phase 2 & Future Roadmap

The following is a proposed roadmap for Phase 2 and beyond, focusing on "Professional Engine" capabilities and "Content Factory" scale.

### Phase 2: Professional Engine (Refinement & Polish)

**Goal**: Make the engine capable of producing broadcast-quality video with rich interactions.

1.  **Enhanced Layout Engine**:
    -   Implement smooth scrolling algorithms (spring-based or linear interpolation) in the Layout Engine.
    -   Handle dynamic content sizing (e.g., text wrapping, image aspect ratios) more robustly.

2.  **Advanced Animations**:
    -   **Notifications**: Implement a robust notification system with stacking, dismissal animations, and "dynamic island" integration (for iPhone 14+).
    -   **Typing Indicators**: Add realistic, non-linear typing animations (variable speed, pauses).
    -   **Transitions**: Smooth app open/close transitions (zoom in/out from icon).

3.  **Audio Orchestration**:
    -   Add an audio layer to the `TimelineEvent` or a separate `AudioTrack`.
    -   Support sound effects (lock/unlock, typing clicks, message sent/received) synchronized with events.

4.  **New Apps & Devices**:
    -   **Android Support**: Add a generic Android device profile (e.g., Pixel 8) and Material Design system.
    -   **Instagram DM**: Implement `apps-instagram` with support for likes, media messages, and stories.

5.  **Developer Experience (DX)**:
    -   **Hot Reloading for Episodes**: Ensure changing a JSON file instantly updates the Remotion preview without full reload.
    -   **Visual Debugger**: A simple overlay in the video showing the current `t`, active events, and state diffs.

### Phase 3: Content Factory (Scale & Automation)

**Goal**: Enable mass production of content via AI and tooling.

1.  **AI Generation Pipeline**:
    -   Create a "Script-to-Episode" compiler. Input: A screenplay or chat log. Output: Valid `Episode` JSON.
    -   Use LLMs to infer timing (e.g., longer pause for longer messages).

2.  **Episode Editor GUI**:
    -   A web-based (or VS Code extension) timeline editor to visually place events instead of writing JSON.

3.  **Performance Optimization**:
    -   **Snapshotting**: For long episodes, cache `WorldState` at keyframes (e.g., every 10 seconds) to avoid replaying from `t=0` every frame.
    -   **Asset Preloading**: robust `staticFile` handling and preloading strategies for images/videos within chats.

---

## 5. Key Observations & Recommendations

- **Strict Schema Validation**: The use of Zod is excellent. Keep this strict. As the schema grows, consider generating TypeScript types directly from Zod schemas to ensure single source of truth.
- **Immer Usage**: Using Immer for reducers is the right choice for complex nested state like `WorldState`. Ensure that the `replay` function remains pure and highly optimized, as it runs *every frame*.
- **Asset Management**: As noted in `REMOTION_DOCS.md`, handling assets (images, fonts) correctly is crucial. Ensure `packages/devices` and `packages/apps-*` expose their assets in a way that `apps/video-runner` can consume (e.g., via a shared public folder or build step copy).
- **Testing**:
    -   **Unit Tests**: Add tests for `replay()` logic in `packages/core`. It's pure logic, so it's easy to test.
    -   **Visual Regression**: Set up a pipeline to render a reference frame and compare it to ensure no visual regressions when updating the renderer.

## 6. Immediate Next Steps (Actionable)

1.  **Verify `replay` Logic**: Ensure the `replay` function in `packages/core/src/engine.ts` correctly handles all defined event types.
2.  **Complete WhatsApp UI**: Finish the `WhatsappChatView` component to support all message types defined in the JSON.
3.  **Connect the Dots**: Ensure `apps/video-runner` is correctly importing the engine, loading the JSON, and passing it to `TokovoRenderer`.
