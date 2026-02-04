# Device Profiles and Scaling

## Device Profiles
- Define screen dimensions and pixel density.
- Scaling should respect logical units vs pixel density.

## Repo Paths
- Profiles: `packages/devices/src`
- Pixel density: `packages/devices/src/types.ts`

## Scaling Rules
- Camera scale ≠ device pixel density.
- Layout sizes should be in logical units.
- Renderer output scaling is handled in app runtime.
