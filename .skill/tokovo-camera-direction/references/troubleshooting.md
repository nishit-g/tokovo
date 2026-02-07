# Troubleshooting

## Anchor Not Found
- Confirm the anchor ID exists for that moment:
  - Device-owned anchors: `device`, `app`, `keyboard`, `dynamicIsland`, `notification_banner`.
  - App semantic anchors: depends on plugin layout/provider (e.g. `lastMessage`, `tweet_card`).
- If focusing during lockscreen/home: camera resolves against the device provider (`app_device`).
- Check `apps/video-runner` smoke test failures for anchor fallbacks.

## Camera Looks Wrong
- Check scale values and anchor bounds.
- Confirm device dimensions + safe area (device profile) and that your target anchor rect is in viewport pixel-space.

## Jittery Movement
- Use explicit durations and consistent easing.
- Prefer `trackCinematic(..., { smoothing })` for continuous motion.
