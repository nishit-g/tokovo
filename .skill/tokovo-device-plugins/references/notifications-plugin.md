# Notifications Plugin

## Responsibilities
- Notification display and scheduling.
- OS-level notification events.

## Repo Paths
- Notifications plugin: `packages/device-notifications/src`
- Device authoring (recommended): `packages/dsl/src/v2/device-track.ts` (`notificationShow/Tap/Dismiss/...`)

## Heads-Up + Lockscreen
Camera focus targets:
- Heads-up banner: `notification_banner` (device-owned)
- Lockscreen notifications are rendered by `LockscreenView` and not guaranteed to expose a banner anchor.
