import { describe, expect, it } from "vitest";
import { prepareTrackEpisode } from "@tokovo/compiler";
import { WhatsAppPlugin } from "@tokovo/apps-whatsapp/plugin";
import { TypewriterPlugin } from "@tokovo/apps-typewriter/plugin";
import whatsappStoryV2 from "./stories/whatsapp-story-v2.episode.js";
import typewriterFlagshipV2 from "./showcases/apps/typewriter-flagship-v2.episode.js";
import type { EpisodeDefinition } from "./types/episode-definition.js";
import {
  EpisodeRegistry,
  EpisodeRegistryDuplicateError,
  EpisodeRegistryValidationError,
} from "./registry/episode-registry.js";

function normalizeEventsForDeterminism(events: unknown[]): unknown[] {
  return events.map((event) => {
    const typed = event as {
      kind?: string;
      type?: string;
      soundId?: string;
      volume?: number;
    };
    if (
      typed.kind === "AUDIO" &&
      typed.type === "PLAY_SOUND" &&
      typeof typed.soundId === "string" &&
      typed.soundId.startsWith("app_typewriter.")
    ) {
      const { volume: _volume, ...rest } = typed;
      return rest;
    }
    return event;
  });
}

describe("episodes integration and registry guarantees", () => {
  it("rejects duplicate episode ids", () => {
    const registry = new EpisodeRegistry();
    registry.register(whatsappStoryV2);
    expect(() => registry.register(whatsappStoryV2)).toThrow(
      EpisodeRegistryDuplicateError,
    );
  });

  it("rejects invalid episode definitions with explicit error", () => {
    const registry = new EpisodeRegistry();
    const invalid = {
      meta: {
        id: "Bad ID",
        title: "Bad",
        category: "production" as const,
        catalogType: "story" as const,
      },
      config: {
        format: "1080x1920",
        durationInFrames: 120,
        apps: ["app_whatsapp"],
      },
      build: () => whatsappStoryV2.build(),
    };

    expect(() => registry.register(invalid as EpisodeDefinition)).toThrow(
      EpisodeRegistryValidationError,
    );
  });

  it("compiles representative episodes deterministically", () => {
    const plugins = [
      WhatsAppPlugin,
      TypewriterPlugin,
    ] as Parameters<typeof prepareTrackEpisode>[1];

    const smallA = prepareTrackEpisode(whatsappStoryV2.build(), plugins, {
      log: false,
      validate: true,
    });
    const smallB = prepareTrackEpisode(whatsappStoryV2.build(), plugins, {
      log: false,
      validate: true,
    });
    expect(smallA.eventSignature).toBe(smallB.eventSignature);
    expect(smallA.events).toEqual(smallB.events);

    const complexA = prepareTrackEpisode(typewriterFlagshipV2.build(), plugins, {
      log: false,
      validate: true,
    });
    const complexB = prepareTrackEpisode(typewriterFlagshipV2.build(), plugins, {
      log: false,
      validate: true,
    });
    expect(normalizeEventsForDeterminism(complexA.events)).toEqual(
      normalizeEventsForDeterminism(complexB.events),
    );
  });
});
