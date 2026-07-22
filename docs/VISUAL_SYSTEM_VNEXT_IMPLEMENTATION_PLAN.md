# Visual System VNext Implementation Record

Status: hard cut implemented and release verified

## Scope

This record covers the global visual environment, device geometry, keyboard, notifications,
lock/home surfaces, Dynamic Island and screen recording, app viewport migration, editorial
composition, backdrops, quality gates, and flagship proof.

## Completed Work

- [x] Create `@tokovo/visual-system` with versioned platform, material, geometry, composition, and backdrop contracts.
- [x] Register iOS Liquid Glass and Android Material 3 profiles with distinct typography metrics.
- [x] Bundle Inter, Roboto, Noto Sans, Arabic, Devanagari, and Japanese variable fonts.
- [x] Correct iPhone/Pixel physical display profiles and preserve a real frame-to-display inset.
- [x] Replace `pixelDensity` with the explicit physical `pointScale` contract.
- [x] Replace app safe-area inputs with one required `AppViewportFrame`.
- [x] Delete app-owned top/bottom inset defaults from WhatsApp and iMessage.
- [x] Migrate every app layout and app shell to the viewport contract.
- [x] Replace keyboard theme duplication with platform-profile projection.
- [x] Add separate iOS/Android Devanagari InScript row geometry.
- [x] Replace the empty keyboard suggestion strip with a deterministic toolbar.
- [x] Replace notification theme duplication with structured platform materials.
- [x] Rebuild notification grouping, card spacing, center depth, and material hierarchy.
- [x] Move lock screen and home screen theme/layout resolution onto the global profile.
- [x] Remove emoji-based home and WhatsApp empty-state placeholders.
- [x] Project Dynamic Island typography/materials from the global profile.
- [x] Keep recording compact unless authored expansion is active; reduce expanded recording scale.
- [x] Preserve authored stop semantics and deterministic completion feedback.
- [x] Rename camera output protection to `editorialInsets`.
- [x] Require a composition profile on every camera output.
- [x] Add deterministic negative-space overlay/PIP placement.
- [x] Replace the broad background preset catalog with four governed backdrop profiles.
- [x] Remove generic renderer layouts and device/status/frame substitution paths.
- [x] Update the flagship camera and backdrop to prove the new contracts.

## Quality Matrix

| Surface          | Required proof                                                                       |
| ---------------- | ------------------------------------------------------------------------------------ |
| iOS keyboard     | light/dark, Latin, Hindi, Arabic, Japanese composition, focused WhatsApp composer    |
| Android keyboard | light/dark, Latin, Hindi, Arabic, Japanese composition, gesture-region spacing       |
| Notifications    | banner, lock screen, grouped stack, center, privacy, action, critical/time-sensitive |
| Dynamic Island   | idle, countdown, compact recording, explicit expansion, stop, completion, activity   |
| Lock/home        | iOS/Android, light/dark, LTR/RTL, deterministic app icons and folders                |
| App viewport     | all app layout packages compile with no local inset defaults                         |
| Camera           | wide, detail, keyboard, notification, duo, PIP, dolly, four lens models, filters     |
| Backdrop         | quiet and expressive profiles remain orientation-safe and signage-free               |

## Release Gates

- [x] focused package typechecks and unit tests pass;
- [x] solution typecheck passes;
- [x] workspace episode validation passes;
- [x] camera and OS-surface flagship renders complete;
- [x] inspected frames show correct display inset, keyboard attachment, notification depth, compact recording, and PIP negative space;
- [x] release verification passes;
- [x] repository scan finds no old visual safe-area, pixel-density, theme-ID, or generic-layout compatibility path;
- [x] changes are committed as one intentional hard-cut changeset.

## Success Criteria

1. The same prepared episode and frame produce identical visual signatures and pixels.
2. Adding an app requires no device-specific inset or OS-theme code.
3. Adding a platform revision is a new registered profile, not edits scattered across painters.
4. Missing profiles, layouts, frames, assets, and required app entities fail before producing a misleading render.
5. Keyboard content never collides with the gesture region and remains attached to the app composer.
6. Notifications have legible hierarchy against light, dark, and visually active app content.
7. Screen recording remains compact by default and only stops or expands when episode data says so.
8. Wide shots stay inside profile fill guidance; close shots retain the framing guard.
9. PIP occupies designed negative space and never blindly obscures the hero device.
10. Golden images supplement structural assertions; they never define correctness alone.
