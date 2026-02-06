/**
 * Root.tsx - Tokovo Video Runner Entry Point
 *
 * MINIMAL CONFIGURATION:
 * - Episodes are loaded explicitly from @tokovo/episodes catalogs
 * - Organized into folders: Production, Showcases, Tests
 *
 * @see docs-v2/EPISODE-ARCH.md
 */

import React from "react";
import { Composition, Folder } from "remotion";
import { z } from "zod";
import {
  getFormat,
  type EpisodeDefinition,
  type FormatId,
} from "@tokovo/episodes";
import { EpisodeRenderer, calculateEpisodeMetadata } from "./EpisodeRenderer";
import { VideoRunnerRuntimeProvider, useVideoRunnerRuntime } from "./RuntimeContext";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const RemotionRoot: React.FC = () => {
  return (
    <VideoRunnerRuntimeProvider>
      <RemotionRootInner />
    </VideoRunnerRuntimeProvider>
  );
};

const RemotionRootInner: React.FC = () => {
  const { episodeRegistry } = useVideoRunnerRuntime();
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
