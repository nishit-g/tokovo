# Tokovo - Video Generation Monorepo

A scalable video generation platform built with **Remotion**, **Next.js**, and **TurboRepo**.

## 🏗 Architecture

This project uses a **Monorepo** structure to separate core logic, UI components, and the rendering engine.

### Directory Structure

```txt
tokovo/
├── apps/
│   └── remotion-app/       # The main video generation app (Next.js + Remotion)
│       └── src/
│           └── compositions/ # Top-level video compositions (e.g., WhatsappEpisode)
│
└── packages/
    ├── shared-types/       # Shared TypeScript interfaces (Device, App, Episode)
    └── ui-kit/             # Shared UI Component Library
        ├── devices/        # Device frames and OS-level UI (e.g., iOS Status Bar)
        │   └── ios/
        └── apps/           # App-specific screens and components
            └── whatsapp/
                └── ios/    # WhatsApp iOS implementation
```

### Key Concepts

-   **Device -> App Hierarchy**: The system models a real device.
    -   A `Character` owns a `Device`.
    -   A `Device` has an `activeAppId`.
    -   The `DeviceScreen` component (in `ui-kit`) dynamically renders the correct app based on `activeApp.type`.
-   **Extensibility**: To add a new app (e.g., Instagram), create `packages/ui-kit/src/apps/instagram` and register it in `DeviceScreen`.

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   pnpm (`npm install -g pnpm`)

### Installation

```bash
pnpm install
```

### Development

Start the Remotion Studio:

```bash
pnpm dev
```

This runs `turbo run dev`, which starts the Studio at [http://localhost:3000](http://localhost:3000).

### Building

Build all apps and packages:

```bash
pnpm build
```

## 📦 Packages

### `@tokovo/shared-types`
Contains the core data models:
-   `Episode`: The root object describing a video.
-   `Device`: State of the phone (battery, time, wallpaper).
-   `App`: Data for specific apps (e.g., WhatsApp conversation).

### `@tokovo/ui-kit`
The visual layer.
-   **`DeviceScreen`**: The entry point for rendering the phone's screen.
-   **`devices/ios`**: `PhoneFrame`, `StatusBar`.
-   **`apps/whatsapp/ios`**: `ChatScreen`, `MessageBubble`, `TypingIndicator`.

## ✅ Phase 1: Foundation (Completed)
-   [x] Monorepo setup (pnpm + turbo)
-   [x] Basic WhatsApp iOS simulation
-   [x] Realistic iPhone 14 Pro Max frame
-   [x] Dynamic `Device -> App` rendering architecture

## 🔮 Phase 2: Expansion (Next Steps)
-   [ ] **Multiple Apps**: Add support for other apps (e.g., Lock Screen, Home Screen, Instagram).
-   [ ] **Multiple Characters**: Support switching between devices/characters in one episode.
-   [ ] **Advanced Animations**: App open/close transitions, notifications.
-   [ ] **Scripting Engine**: Better tooling to author episodes.
