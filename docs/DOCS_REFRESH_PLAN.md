# Docs Refresh Plan

## Goal
Bring Tokovo documentation up to the current product shape so the docs match:

- canonical `storyEpisode(...)` authoring
- `@tokovo/packs` and `@tokovo/creator`
- Creator Studio V1 in `apps/web`
- current WhatsApp and X showcase quality
- current production workflow around `apps/video-runner`

## What changed in the product

Tokovo is no longer just:

- DSL
- compiler
- renderer

It now also includes:

- reusable persona, asset, style, and device packs
- canonical story-kit sidecars for production episodes
- Creator Studio V1 for file-backed editing of packs and story-kit setup
- stronger app-specific showcase coverage in WhatsApp and X

The docs need to reflect that shift clearly.

## Priority order

### 1. Core entry docs
Update these first because they shape first understanding:

- `/Users/nishit.gupta/personal/tokovo/README.md`
- `/Users/nishit.gupta/personal/tokovo/docs/ARCHITECTURE.md`
- `/Users/nishit.gupta/personal/tokovo/docs/STORY_KIT.md`

Required updates:

- explain `@tokovo/packs`
- explain canonical `storyEpisode(...)` flow
- explain the relationship between Studio sidecars and code-first episode files
- explain that Studio is file-backed and not the source of runtime truth
- update package map to include `packs`

### 2. App-facing docs
Update docs that describe visible product capability:

- WhatsApp package docs
- X package docs
- any docs that still describe older status/tab/nav models

Required updates:

- current WhatsApp `Updates` direction
- current anchors and showcase surfaces
- current X capability and known limitations

### 3. Production workflow docs
Update docs around how creators actually ship:

- render flow
- Studio usage
- sidecar editing workflow
- preview and Remotion usage
- batch authoring direction

Required updates:

- “what Studio owns” vs “what stays in code”
- how to edit canonical story-kit episodes
- how to validate and render after Studio changes

### 4. Example-driven docs
Add 3 reference examples that match the real product:

- WhatsApp production example
- X production example
- crossover example

Each example should show:

- story-kit sidecar
- episode file
- which fields belong where
- how `kit.project.*` is used

## Deliverables

### Docs deliverable A: product overview refresh
- refresh root README
- refresh architecture page
- add “Tokovo today” section

### Docs deliverable B: creator workflow docs
- expand `docs/STORY_KIT.md`
- add `docs/CREATOR_STUDIO.md`
- add sidecar editing guidance

### Docs deliverable C: app realism docs
- refresh WhatsApp docs
- refresh X docs
- document current anchor/camera expectations

### Docs deliverable D: example library
- link the canonical showcase episodes
- explain why they are the standard examples

## Acceptance criteria

The docs refresh is done when:

1. A new contributor can understand the current authoring model without reverse-engineering episode files.
2. The docs explain Studio without implying that it is a visual timeline editor.
3. The package map and architecture docs include `@tokovo/packs`.
4. The WhatsApp and X docs reflect current UI and product behavior.
5. Canonical examples match the real code that builds today.

## Suggested execution order

### Wave 1
- README
- ARCHITECTURE
- STORY_KIT

### Wave 2
- CREATOR_STUDIO
- production workflow / rendering docs

### Wave 3
- WhatsApp docs
- X docs
- example index

## Notes

- Docs should describe the current repo, not the aspirational future system.
- Keep the distinction sharp between:
  - reusable setup in Studio
  - creative episode logic in code
- Treat the canonical story-kit episodes as the docs source of truth, not temporary examples.
