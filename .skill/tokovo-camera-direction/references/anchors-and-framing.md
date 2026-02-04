# Anchors and Framing

## Rules
- Anchor providers return normalized bounds (0–1).
- Registry namespaces anchors by `appId:anchor`.
- Return `null` for default framing.

## Repo Paths
- Anchor providers: `packages/*/src/runtime/adapters/anchors.ts`
- Anchor registry types: `packages/core/src/types/plugin-contract.ts`
