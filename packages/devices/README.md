# @tokovo/devices

`@tokovo/devices` owns device profiles, device chrome, and canonical OS surfaces.

## Responsibilities

- device profile definitions
- device registry wiring
- deterministic iOS and Android light/dark lockscreen and homescreen projection
- deterministic `en`, `hi`, `ar`, and `ja` system localization with RTL support
- wallpaper, icon, badge, folder, dock, search, status-bar, and gesture presentation
- deterministic Dynamic Island activity and screen-recording lifecycle projection
- semantic system anchors for camera direction
- device-level runtime behavior used across episodes

## Role In Tokovo

This package is the device and OS shell layer between headless runtime state and the
renderer. `SystemSurface` is the only lock/home painter; renderer hosts its projection
but does not recreate OS semantics.

## System Surface Exports

- `projectLockscreen`, `projectHomeScreen`
- `getSystemSurfaceTheme`
- `LockscreenSurface`, `HomeScreenSurface`, `SystemSurface`
- `projectDynamicIsland`, `DynamicIslandSurface`
- system projection, theme, wallpaper, and localization contracts

## Dynamic Island And Screen Recording

The device package owns both the pure frame projection and the canonical UI surface.
The renderer only resolves priority and hosts the projection inside the device frame.

Screen recording follows the current iOS lifecycle: a three-second countdown uses the
leading recording ring and trailing digit, active capture uses a compact leading red
dot, expanded timer/title/stop controls appear only when authored, and stopping capture
briefly presents the Photos save banner. `hidden` models a dismissed compact activity;
it does not stop capture. All morph progress and elapsed labels derive from episode
frames, never wall-clock or CSS animation time.

The screen-recording control uses tighter recording-specific expanded geometry inside
the profile's maximum Live Activity envelope. Generic expanded activities may use the
full profile width; screen recording stays smaller so compact/expanded transitions keep
their visual continuity.

Capture state is independent of the current app, home/lock surface, and island
presentation. It remains active until an explicit stop event; app switches, locking,
expanding, collapsing, or dismissing the indicator never end the capture.

System anchors include `lockscreen.clock`, `lockscreen.controls`,
`homescreen.grid`, `homescreen.dock`, `homescreen.search`, and
`homescreen.icon:<appId>`.
