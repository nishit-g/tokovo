# Tokovo Web UI Plan: Characters, Devices, Apps, Audio, and Episode Building

Goal: Make Tokovo usable by creators who do not want to write TypeScript, while preserving "escape hatches" for power users. This plan covers the current needs (v1 creator workflows) and the future high-leverage workflows (templates, scale rendering, reuse across episodes).

---

## Design Principles (Non-Negotiable)

1. **Single Source of Truth = deterministic export**
   - The UI must compile to the same V2 IR that the DSL produces.
   - If UI actions cannot be expressed as V2 IR, they do not ship.

2. **No irreversible lock-in**
   - Every UI-authored episode must be exportable as a TypeScript DSL file.
   - Every DSL episode should be importable (best-effort) into the UI.

3. **Opinionated defaults, explicit overrides**
   - Most users want “it just works”: auto keyboard, auto SFX, camera presets.
   - Power users need the ability to override any part (timing, sfx, camera, assets).

4. **Asset provenance and portability**
   - Characters, devices, and episodes must reference assets via stable IDs.
   - Rendering workers must be able to resolve assets without depending on the UI runtime.

---

## Current Creator Workflows (Must Nail)

### A) Author an episode quickly (the “viral format” workflow)

Inputs:
- Choose base “format” (1080x1920)
- Pick 1-2 devices
- Pick apps (WhatsApp/X/iMessage)
- Pick characters
- Build a short story with:
  - messages
  - typed sends (auto keyboard)
  - notification banner bait
  - app switches
  - camera focus regions
  - SFX (auto rules + overrides)

Output:
- V2 IR (source of truth)
- DSL export (single file)
- render job (mp4 output)

### B) Reuse characters and device setups across episodes

Users should not re-enter:
- avatars
- handles
- group participant lists
- device home screen layout

We need: **Libraries** (Characters Library, Devices Library, App Presets Library).

### C) Render lots of variations (batch generation)

Given:
- same episode template
- 20 different character sets / scripts

Need:
- variable binding (template inputs)
- batch render queue

---

## UI Modules (V1 Scope)

### 1) Characters

**Entity**: `Character`
- `id` (stable)
- `displayName`
- `avatarAssetId` (points to uploaded image)
- `xHandle?`
- `whatsappName?`
- optional metadata (language, vibe tags)

UI:
- Create/edit character
- Upload avatar (normalize/crop, store variants)
- Search/filter

Runtime integration:
- Episode compilation uses character IDs to populate app seeds (WhatsApp participants, X users).

### 2) Devices

**Entity**: `DevicePreset`
- `id`
- `profileId` (iphone16, pixel)
- `installedApps[]`
- `homeScreen` layout (dock/pages)
- initial state:
  - locked
  - screenRecording
  - time/battery/network

UI:
- Select profile
- Drag/drop home screen icons
- Toggle locked / recording

### 3) App Presets

**Entity**: `AppPreset`
- `id`
- `appId` (`app_whatsapp`, `app_x`, `app_imessage`)
- default conversation seed strategies
- default anchor/camera targets for common screens
- audio behavior defaults (auto rules on/off)

Why:
- prevents “every episode starts from scratch”
- guarantees consistent behavior and fewer bugs

### 4) Episode Builder (Timeline + Tracks)

Core concept: A **track-based timeline** that maps 1:1 to V2 IR tracks.

Tracks (v1):
- Device track (lock/unlock, openApp, notifications, keyboard)
- App tracks:
  - WhatsApp track
  - X track
  - iMessage track
- Camera track
- Audio track
- Overlay track (optional; but keep it off by default if you don’t want it)

UI interactions:
- Add event at time
- Drag event to change time
- Edit event payload in inspector
- "Smart add" buttons for common patterns:
  - “Send typed message” (sets typed: true)
  - “Banner bait” (notification heads-up + camera focus)
  - “Switch app with transition”

Preview:
- Built-in player for scrubbing + play
- Camera debug toggle
- Anchor visualization toggle

### 5) Templates + Variables (V1.5 scope, but design now)

Add the concept of:
- `EpisodeTemplate` with typed inputs:
  - strings, enums, asset refs
- a compiler step that binds inputs -> IR

Use cases:
- multilingual versions
- different names/handles
- different punchline text

---

## Data Model and Storage

Phase 1 (local-first, simplest):
- store JSON in repo or in `apps/video-runner/public/data/` (or a dedicated `apps/webui/data/`)
- assets in `public/avatars/`, `public/backgrounds/`, etc.

Phase 2 (team-scale):
- Postgres for entities + S3 for assets
- a render worker pool reads from S3 + bundle url

---

## Integration Contract (UI -> Tokovo)

Hard rule: UI outputs V2 IR.

Implementation options:
1. UI calls `@tokovo/compiler` in-browser for preview (maybe heavy)
2. UI sends IR to a local server that returns frames / preview

Recommended:
- Local dev: UI runs in the same Next app with SSR endpoints that prepare episodes.
- Production: UI stores IR and triggers worker jobs.

---

## Future Use Cases (Design For Now)

1. **Cross-app timelines / multi-device**
   - Add multiple devices with split/PIP layouts
   - Camera switching between devices should be a first-class UI action

2. **Multilingual**
   - Character libraries are language-aware
   - Templates allow per-language text substitutions
   - Voice/bgm can be swapped per locale (even if you avoid BGM)

3. **Comment roast thread / receipts / hook + captions**
   - Overlay track becomes a first-class UI module
   - “Hook” at 0s, “caption” at 3s, “cliffhanger” at end

4. **Batch generation**
   - template + CSV upload to produce 100 episodes and render them

---

## Milestones (Concrete)

### Milestone 1: Library + Episode Builder MVP
- Character CRUD + asset upload
- Device preset editor
- Episode builder: deviceTrack + WhatsApp track + camera
- Export DSL file + render mp4 locally

### Milestone 2: Multi-app + Notifications + Keyboard polish
- X + iMessage tracks
- Notification banner tooling
- Typed send actions everywhere
- “Auto SFX” toggles + overrides

### Milestone 3: Team-scale + batch + render queue
- DB storage + asset store
- Render worker daemon (reuse chrome, no rebundle)
- Batch jobs and job dashboard

