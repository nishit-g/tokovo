# Anchors and Framing (Tokovo v1)

## Anchor Systems (Two Tiers)

### 1) Preferred: `AnchorProvider` (pixel-space, layout-aware)
- Providers implement `AnchorProvider.getAnchors(world, layout, deviceId)` and return:
  - `AnchorSnapshot.anchors: Record<string, Rect>` where `Rect` is **pixel-space** in the device viewport.
- Anchor IDs are **plain strings** (no `appId:` prefix).
- Framing is per-anchor via `AnchorProvider.framing[anchorId]`:
  - `anchorPoint` (0-1 in rect space)
  - `paddingPx`
  - `targetFill`

Repo paths:
- Types: `packages/core/src/types/anchor.ts`
- Registry merge behavior (device-owned anchors): `packages/core/src/anchors/registry.ts`

### 2) Legacy: `PluginAnchorRegistry` (normalized 0–1, default provider)
- Old plugins may define `plugin.anchors.providers[...]` returning normalized (0–1) bounds.
- This is supported, but not “best in class” for new work.

Repo path:
- Legacy contract types: `packages/core/src/types/plugin-contract.ts`

## Device-Owned Anchors (OS-level, official)
Always available (merged into every snapshot):
- `device`, `app`, `keyboard`, `dynamicIsland`, `notification_banner`

Repo path:
- Provider: `packages/core/src/anchors/device-provider.ts`

## Framing Guidance (Practical Defaults)
- `device`, `app`: center framing, no padding, `targetFill ~ 1.0`
- `keyboard`: anchorPoint y ~ 0.85, modest padding
- `notification_banner` / heads-up: anchorPoint y ~ 0.10, enough padding for bounce/slide

