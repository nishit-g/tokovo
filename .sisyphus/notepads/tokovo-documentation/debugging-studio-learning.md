# Debugging Studio Guide - 2026-01-28

Created comprehensive debugging guide for Tokovo Studio (770+ lines).

## Features Documented

### Current capabilities

- Timeline visualization concept
- Episode preview using EpisodeRenderer
- runEpisode() for state computation
- TokovoRenderer integration

### Coming Soon (clearly marked)

- Full timeline UI (currently disabled)
- WorldState inspector panel
- Anchor bounding box overlays
- Frame-to-frame state diffing
- Performance profiling

## Structure Pattern

1. What/Why - Studio purpose and value proposition
2. Getting Started - Installation and launching
3. Interface Overview - ASCII diagram
4. Feature Sections - Timeline, WorldState, Camera, Events
5. Debugging Workflows - 4 step-by-step scenarios
6. Best Practices - 5 actionable guidelines
7. Troubleshooting - Common issues with fixes
8. Advanced Features - Future capabilities
9. Integration with Remotion - Preview vs render modes
10. Next Steps - Related documentation links

## Debugging Workflows Included

1. **Message Timing** - Verify message appearance and transitions
2. **Camera Choreography** - Validate camera movements
3. **Event Sequence Validation** - Complex multi-step sequences
4. **Audio Synchronization** - Audio-visual alignment

Each workflow includes:

- Goal statement
- Step-by-step process
- Verification criteria
- Before/after code examples

## Key Documentation Patterns

- ASCII Diagrams for interface layout visualization
- Code Examples showing TypeScript snippets
- Tables for event track types, marker styles
- Workflow Templates with step-by-step debugging processes
- "Coming Soon" Callouts for placeholder features
- Cross-References to Timeline Events, WorldState, Determinism, packages

## Technical Accuracy

Verified actual Studio capabilities by reading:

- packages/studio/package.json
- packages/studio/README.md
- packages/studio/src/pages/TimelineDemo.tsx (currently disabled)
- packages/studio/src/EpisodeRenderer.tsx
- packages/core/src/prepare/prepare.ts
- packages/renderer/src/TokovoRenderer.tsx

## Writing Quality

- Enterprise-grade technical documentation
- Practical debugging workflows (not just feature lists)
- Balanced theory and practice
- Clear progression: basics to workflows to advanced
- Honest about WIP features (builds trust)
- Debugging mindset emphasized throughout

## Build Verification

- Documentation builds successfully with Next.js
- 29 pages indexed by Pagefind (up from 28)
- New guide appears at /guides/debugging-studio
- No MDX compilation errors
- All code blocks properly formatted

## Cross-References

Successfully linked to:

- /concepts/timeline-events
- /concepts/worldstate
- /concepts/determinism
- /packages/core
- /packages/renderer
- /getting-started/first-episode

## Best Practices Documented

1. Debug early and often (avoid render iterations)
2. Use frame numbers, not time (precision)
3. Test edge cases (first/last frame, boundaries)
4. Compare against reference episodes
5. Document findings (manual logging for now)

## Honest Feature Status

Guide clearly communicates:

- Studio is in active development
- Timeline UI is currently disabled (@tokovo/react/timeline incomplete)
- Core preview functionality is stable
- Many features marked "Coming Soon" with specific callouts
- Sets realistic expectations while documenting intended capabilities

This approach builds trust and provides forward-looking documentation.
