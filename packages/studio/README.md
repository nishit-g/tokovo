# Tokovo Studio

Timeline editor and episode preview for Tokovo.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Features

- **Timeline Visualization**: Visual timeline showing all episode events (camera, audio, device, app)
- **Episode Editor**: Remotion Player + Timeline integration with click-to-seek
- **Real-time Preview**: See how episodes render as you scrub through the timeline

## Accessing the Demo

1. Start the dev server: `pnpm dev`
2. Open http://localhost:3000
3. The Camera Showcase episode will load automatically with the timeline editor

## Architecture

- `src/pages/TimelineDemo.tsx` - Main demo page with EpisodeEditor
- `src/EpisodeRenderer.tsx` - Custom renderer for Remotion Player
- Uses `@tokovo/react/timeline` components (EpisodeEditor, Timeline)
- Loads episodes from `@tokovo/episodes` registry
