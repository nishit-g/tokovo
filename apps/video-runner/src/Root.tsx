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
import { PluginManager } from "@tokovo/core";
import { registerWhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { registerDevicesPlugin } from "@tokovo/devices";
import { registerNotificationPlugin } from "@tokovo/device-notifications";
import { episodeRegistry, getFormat } from "@tokovo/episodes";
import { EpisodeRenderer } from "./EpisodeRenderer";

// =============================================================================
// INITIALIZATION (explicit registration - no side effects)
// =============================================================================

registerDevicesPlugin();
registerWhatsAppPlugin();
registerNotificationPlugin();

// =============================================================================
// EPISODE IMPORTS (side-effect: auto-registers with registry)
// =============================================================================

import "@tokovo/episodes/production";
import "@tokovo/episodes/showcases";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const RemotionRoot: React.FC = () => {
  const production = episodeRegistry.filter({ category: "production" });
  const showcases = episodeRegistry.filter({ category: "showcase" });
  const tests = episodeRegistry.filter({ category: "test" });

  console.log("[Video-Runner] Episodes loaded:", {
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

function renderEpisode(ep: any) {
  const format =
    typeof ep.config.format === "string"
      ? getFormat(ep.config.format as any)
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
      schema={z.object({ episodeId: z.string() })}
    />
  );
}
