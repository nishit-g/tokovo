/**
 * Root.tsx - Tokovo Video Runner Entry Point
 *
 * MINIMAL CONFIGURATION:
 * - Only auto-discovery from @tokovo/episodes
 * - All episodes defined through defineEpisode() appear automatically
 * - Organized into folders: Production, Showcases, Tests
 *
 * @see docs-v2/EPISODE-ARCH.md
 */

import React from "react";
import { Composition, Folder } from "remotion";
import { z } from "zod";
import "./runtime";
import {
  episodeRegistry,
  getFormat,
  type EpisodeDefinition,
  type FormatId,
} from "@tokovo/episodes";
import { EpisodeRenderer, calculateEpisodeMetadata } from "./EpisodeRenderer";

// =============================================================================
// EPISODE IMPORTS (side-effect: auto-registers with registry)
// =============================================================================

// Auto-load all production episodes
import "@tokovo/episodes/production";

// Auto-load all showcase episodes
import "@tokovo/episodes/showcases";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const RemotionRoot: React.FC = () => {
  const production = episodeRegistry.filter({ category: "production" });
  const showcases = episodeRegistry.filter({ category: "showcase" });
  const tests = episodeRegistry.filter({ category: "test" });

  console.warn("[Video-Runner] Episodes loaded:", {
    production: production.length,
    showcases: showcases.length,
    tests: tests.length,
  });

  return (
    <>
      {production.length > 0 && (
        <Folder name="Production">{production.map(renderEpisode)}</Folder>
      )}
      {showcases.length > 0 && (
        <Folder name="Showcases">{showcases.map(renderEpisode)}</Folder>
      )}
      {tests.length > 0 && (
        <Folder name="Tests">{tests.map(renderEpisode)}</Folder>
      )}
    </>
  );
};

// =============================================================================
// HELPER
// =============================================================================

function renderEpisode(ep: EpisodeDefinition) {
  const format =
    typeof ep.config.format === "string"
      ? getFormat(ep.config.format as FormatId)
      : ep.config.format;

  return (
    <Composition
      key={ep.meta.id}
      id={ep.meta.id}
      component={EpisodeRenderer}
      durationInFrames={ep.config.durationInFrames}
      fps={format.fps}
      width={format.width}
      height={format.height}
      defaultProps={{ episodeId: ep.meta.id }}
      calculateMetadata={calculateEpisodeMetadata}
      schema={z.object({ episodeId: z.string() })}
    />
  );
}
