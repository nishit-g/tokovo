# Decisions - runtime-fixes

## [2026-01-26T06:05:38Z] Session Started

## Architectural Choices

- Move CameraTransform and DEFAULT_TRANSFORM to core (they're the OUTPUT of camera system, renderer needs them)
- Break runtime cycle by making all core→device-camera imports TYPE-ONLY
- Remove incomplete timeline module (incomplete work from previous session)
