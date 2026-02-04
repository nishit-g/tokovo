# Episode Structure

## Key Concepts
- `defineEpisode` with `meta` and `config` is required.
- `config` should include format, duration, and app list.
- `build` returns the DSL build pipeline.

## Typical Skeleton
- Meta: id, title, category
- Config: duration, fps, format, apps
- Build: devices + tracks + camera

## Repo Paths
- Episodes: `packages/episodes/src`
- DSL entry: `packages/dsl/src/v2/episode.ts`
