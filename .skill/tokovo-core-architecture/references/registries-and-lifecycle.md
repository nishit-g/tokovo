# Registries and Lifecycle

## Plugin Registration Flow
When a plugin registers, the manager wires:
- reducer
- eventKinds
- views
- layouts
- anchors
- assets + audio rules
- notification adapter

## Registries
- Reducer registry
- View registry
- Layout registry
- Anchor registry
- Sound registry

## Repo Paths
- Plugin manager: `packages/core/src/plugin`
- Registries: `packages/core/src/engine/registry.ts` and `packages/core/src/registries`
