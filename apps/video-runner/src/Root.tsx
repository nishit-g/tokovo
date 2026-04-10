/**
 * Root.tsx - Tokovo Video Runner Entry Point
 *
 * MINIMAL CONFIGURATION:
 * - Episodes are loaded explicitly from @tokovo/episodes catalogs
 * - Organized into folders: Apps, System, Stories, Legacy, Tests
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
  const stories = episodeRegistry.filter({ catalogType: "story", legacy: false });
  const appShowcases = episodeRegistry.filter({
    catalogType: [
      "app_showcase_flagship",
      "app_showcase_exhaustive",
      "app_showcase_theme",
    ],
    legacy: false,
  });
  const systemShowcases = episodeRegistry.filter({
    catalogType: "system_showcase",
    legacy: false,
  });
  const legacyEpisodes = episodeRegistry.filter({ catalogType: "legacy" });
  const tests = episodeRegistry.filter({ category: "test" });
  const fallbackEpisodeId =
    stories[0]?.meta.id ??
    appShowcases[0]?.meta.id ??
    systemShowcases[0]?.meta.id ??
    legacyEpisodes[0]?.meta.id ??
    tests[0]?.meta.id ??
    "v2-device-baseline";

  const appFolders = groupByApp(appShowcases);
  const legacyProduction = legacyEpisodes.filter(
    (episode) => episode.meta.category === "production",
  );
  const legacyShowcases = legacyEpisodes.filter(
    (episode) => episode.meta.category === "showcase",
  );
  const legacyTests = legacyEpisodes.filter(
    (episode) => episode.meta.category === "test",
  );

  return (
    <>
      <Folder name="Runtime">
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
      {INCLUDE_EPISODE_CATALOG && appShowcases.length > 0 && (
        <Folder name="Apps">
          {Array.from(appFolders.entries()).map(([label, episodes]) => (
            <Folder key={label} name={label}>
              {episodes.map(renderEpisode)}
            </Folder>
          ))}
        </Folder>
      )}
      {INCLUDE_EPISODE_CATALOG && systemShowcases.length > 0 && (
        <Folder name="System">{systemShowcases.map(renderEpisode)}</Folder>
      )}
      {INCLUDE_EPISODE_CATALOG && stories.length > 0 && (
        <Folder name="Stories">{stories.map(renderEpisode)}</Folder>
      )}
      {INCLUDE_EPISODE_CATALOG && legacyEpisodes.length > 0 && (
        <Folder name="Legacy">
          {legacyProduction.length > 0 && (
            <Folder name="Production">{legacyProduction.map(renderEpisode)}</Folder>
          )}
          {legacyShowcases.length > 0 && (
            <Folder name="Showcases">{legacyShowcases.map(renderEpisode)}</Folder>
          )}
          {legacyTests.length > 0 && (
            <Folder name="Tests">{legacyTests.map(renderEpisode)}</Folder>
          )}
        </Folder>
      )}
      {INCLUDE_EPISODE_CATALOG && tests.length > 0 && (
        <Folder name="Tests">{tests.map(renderEpisode)}</Folder>
      )}
    </>
  );
};

function groupByApp(
  episodes: EpisodeDefinition[],
): Map<string, EpisodeDefinition[]> {
  const groups = new Map<string, EpisodeDefinition[]>();

  for (const episode of episodes) {
    const label = getAppLabel(episode.meta.appId);
    const current = groups.get(label) ?? [];
    current.push(episode);
    groups.set(label, current);
  }

  return new Map(
    Array.from(groups.entries()).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
}

function getAppLabel(appId: string | undefined): string {
  switch (appId) {
    case "app_whatsapp":
      return "WhatsApp";
    case "app_x":
      return "X";
    case "app_linkedin":
      return "LinkedIn";
    case "app_instagram":
      return "Instagram";
    case "app_teams":
      return "Teams";
    case "app_snapchat":
      return "Snapchat";
    case "app_imessage":
      return "iMessage";
    case "app_typewriter":
      return "Typewriter";
    default:
      return "Other";
  }
}

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
