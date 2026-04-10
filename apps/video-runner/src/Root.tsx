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
import { EpisodeRenderer } from "./EpisodeRenderer";
import { calculateEpisodeMetadata } from "./episode-metadata";
import { VideoRunnerRuntimeProvider } from "./RuntimeContext";
import { useVideoRunnerRuntime } from "./RuntimeSharedContext";

export const RELEASE_COMPOSITION_ID = "episode-render";
const INCLUDE_EPISODE_CATALOG = process.env.TOKOVO_STUDIO_CATALOG !== "0";
const episodeRendererSchema = z.object({
  episodeId: z.string(),
  renderDataKey: z.string().optional(),
  renderData: z.unknown().optional(),
});

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
  const fallbackEpisodeId =
    production[0]?.meta.id ?? showcases[0]?.meta.id ?? tests[0]?.meta.id ?? "v2-device-baseline";

  return (
    <>
      <Folder name="System">
        <Composition
          id={RELEASE_COMPOSITION_ID}
          component={EpisodeRenderer}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ episodeId: fallbackEpisodeId }}
          calculateMetadata={calculateEpisodeMetadata}
          schema={episodeRendererSchema as any}
        />
      </Folder>
      {INCLUDE_EPISODE_CATALOG && production.length > 0 && (
        <Folder name="Production">{production.map(renderEpisode)}</Folder>
      )}
      {INCLUDE_EPISODE_CATALOG && showcases.length > 0 && (
        <Folder name="Showcases">{showcases.map(renderEpisode)}</Folder>
      )}
      {INCLUDE_EPISODE_CATALOG && tests.length > 0 && (
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
      lazyComponent={() => import("./EpisodeRenderer")}
      durationInFrames={ep.config.durationInFrames}
      fps={format.fps}
      width={format.width}
      height={format.height}
      defaultProps={{ episodeId: ep.meta.id }}
      calculateMetadata={calculateEpisodeMetadata}
      schema={episodeRendererSchema as any}
    />
  );
}
