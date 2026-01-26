# Decisions: Camera V2 Cleanup

## Session Start: 2026-01-25T09:11:11.148Z

### Architectural Decisions

**V1 vs V2 Camera System**:

- V1: `activeEffects: CameraEffect[]` in CameraState (legacy)
- V2: `scheduledEffects: ScheduledCameraEffect[]` in CameraBrainState (current)
- V2 CameraBrain is pure function, ignores initialWorld.camera

---

## Implementation Choices

(To be populated as work progresses)
