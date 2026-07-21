# @tokovo/devices

`@tokovo/devices` owns device profiles, device chrome, and canonical OS surfaces.

## Responsibilities

- device profile definitions
- device registry wiring
- deterministic iOS and Android light/dark lockscreen and homescreen projection
- deterministic `en`, `hi`, `ar`, and `ja` system localization with RTL support
- wallpaper, icon, badge, folder, dock, search, status-bar, and gesture presentation
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
- system projection, theme, wallpaper, and localization contracts

System anchors include `lockscreen.clock`, `lockscreen.controls`,
`homescreen.grid`, `homescreen.dock`, `homescreen.search`, and
`homescreen.icon:<appId>`.
