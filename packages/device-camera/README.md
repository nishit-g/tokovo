# @tokovo/device-camera

Enterprise-grade cinematic camera system for Tokovo video generation.

## Features

- **Manual Camera Control** - Exact control over scale, position, rotation
- **Semantic Anchors** - Focus on "lastMessage", "inputArea", etc.
- **Effect Processors** - Extensible registry for camera effects
- **Remotion Compatible** - Frame-based, deterministic animation

## Installation

```bash
pnpm add @tokovo/device-camera
```

## Usage

### Manual Camera Control

```typescript
import { CameraTrackBuilder } from "@tokovo/device-camera";

.camera(cam => {
    cam.at("1s").animate({ scale: 1.2, duration: "0.5s" });
    cam.at("3s").focus("lastMessage", { scale: 1.15 });
    cam.at("5s").shake({ intensity: 5, duration: "0.4s" });
    cam.at("10s").reset({ duration: "1s" });
})
```

## Architecture

See [camera_arch.md](/docs/packages/camera_arch.md) for full documentation.
