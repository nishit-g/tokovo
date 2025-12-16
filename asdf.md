# 🏗️ Architectural Audit: The Good, The Bad, & The Coupled

This document outlines the current state of architectural decoupling in the Tokovo engine.

## 🔴 Critical Coupling (Must Fix)

These items prevent the system from being a true "Universal Engine". They require editing `@tokovo/core` or `@tokovo/renderer` to add new apps/devices.

### 1. Notification Branding 🎨
**Source:** `packages/renderer/src/NotificationOverlay.tsx`
**Issue:** Hardcoded map of app IDs to colors/icons/names.
```typescript
const APP_BRANDING = {
    app_whatsapp: { color: "#25D366", ... },
    // ...
}
```
**Impact:** New apps appear as generic/broken notifications.
**Solution:** `AppMetadataRegistry` in Core where apps register their own branding.

### 2. Device Frame Rendering 📱
**Source:** `packages/renderer/src/DeviceFrame.tsx`
**Issue:** Renderer manually imports and switches on device types.
```typescript
import { iPhone16Frame, PixelFrame } from "@tokovo/devices";
const FrameComponent = profileId === "iphone16" ? iPhone16Frame : ...
```
**Impact:** Adding a new device requires editing the Renderer.
**Solution:** `DeviceRegistry` should return the `FrameComponent` (React Component) directly, or `DeviceFrame` should load it dynamically.

### 3. StatusBar Logic 🔋
**Source:** `packages/devices/src/StatusBar.tsx`
**Issue:** Monolithic component containing both iOS and Android logic.
**Impact:** Adding a new OS style (e.g. customized Samsung or HyperOS) requires modifying this complex file.
**Solution:** Break into `IOSStatusBar`, `AndroidStatusBar` and let `DeviceProfile` specify which one to use.

---

## 🟡 Soft Coupling (Improvement Needed)

These items are annoying but don't strictly break new app development.

### 4. DSL Event Factories 🏭
**Source:** `packages/dsl/src/events/*.ts`
**Issue:** Helpers like `dsl.call.incoming()` often take specific enums as arguments (Fixed mostly, but some might remain).
**Impact:** Users might get type errors when using custom strings unless they use `as const` or casts.
**Solution:** Ensure all DSL factories use generic string types.

### 5. Sound Assets Physical Location 📂
**Source:** `apps/video-runner/public/sounds/`
**Issue:** While we fixed the *Code* coupling (Registry), the *Assets* must still physically live in the Renderer's public folder due to Remotion's `staticFile()` limitation.
**Impact:** An "App Package" is not self-contained; it requires manual asset copying.
**Solution:** Migrate to Webpack-based asset imports (`import sound from "./assets/sound.mp3"`) so apps can bundle their own MP3s.

---

## 🟢 Well Architected (Good Patterns)

These systems follow the **Plugin Architecture** correctly.

### 1. App View Registry ✅
**State:** `AppRegistry` allows apps to push their own React components. The Renderer is agnostic.
**File:** `packages/core/src/app-registry.ts`

### 2. Widget Registry ✅
**State:** `WidgetRegistry` allows apps to inject Dynamic Island and Status Bar content dynamically.
**File:** `packages/core/src/widget-registry.ts`

### 3. Sound Registry ✅
**State:** `SoundRegistry` allows apps to map semantic IDs ("message_in") to file paths. Code is decoupled.
**File:** `packages/core/src/sound-registry.ts`

### 4. Open Types ✅
**State:** `CallType` and `Screen` are now `string & {}`, allowing infinite extensibility without Core edits.
**File:** `packages/core/src/types.ts`
