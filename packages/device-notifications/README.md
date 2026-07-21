# @tokovo/device-notifications

`@tokovo/device-notifications` is Tokovo's deterministic notification capability.

## Responsibilities

- compile-time validation and preparation of notification intents and interactions
- random-access evaluation of delivery, dismissal, expiry, grouping, and center state
- privacy, preview, foreground, DND, interruption, and delivery-condition policy
- typed notification actions that lower to normal navigation and app events
- localized iOS and Android light/dark projections
- one canonical painter for banners, lockscreen cards, and notification center
- deterministic notification audio and media rendering

Apps own content adapters and action targets. This package owns device policy and
presentation. Core does not store a second notification state, and renderer does not
select notification behavior.

Communication notifications can provide `content.avatar`; app adapters preserve it as
a sender image while the app icon remains visible as a badge.

## Main Exports

- `prepareNotificationProgram`
- `evaluateNotificationProgram`
- `projectNotifications`
- `projectNotificationAudioCues`
- `getNotificationTheme`
- `NotificationSurface`
