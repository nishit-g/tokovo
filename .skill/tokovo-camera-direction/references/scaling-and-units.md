# Scaling and Units

## Camera Scale
- Camera scale is not device pixel density.
- Keep camera scale adjustments small to avoid UI distortion.

## Layout Units
- Layout is in logical units; avoid mixing with pixel density.

## Device Pixel Density
- Device pixel density affects rendering resolution, not logical layout.

## Renderer Scale
- Renderer output scaling should be applied at app runtime level.
