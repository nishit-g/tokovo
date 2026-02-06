import type { TrackEpisodeConfig } from "@tokovo/ir";
import {
  episode as baseEpisode,
  EpisodeBuilder,
  type TrackFn,
} from "@tokovo/dsl";
import {
  createWhatsAppTrackBuilder,
  type WhatsAppTrackBuilder,
} from "@tokovo/apps-whatsapp";
import {
  createIMessageTrackBuilder,
  type IMessageTrackBuilder,
} from "@tokovo/apps-imessage";
import { XTrackBuilder } from "@tokovo/apps-x";

export type CreatorEpisodeBuilder = EpisodeBuilder & {
  whatsapp: (
    deviceId: string,
    conversationId: string,
    fn: TrackFn<WhatsAppTrackBuilder>,
  ) => CreatorEpisodeBuilder;
  imessage: (
    deviceId: string,
    conversationId: string,
    fn: TrackFn<IMessageTrackBuilder>,
  ) => CreatorEpisodeBuilder;
  x: (deviceId: string, fn: TrackFn<XTrackBuilder>) => CreatorEpisodeBuilder;
};

/**
 * Creator-first episode factory.
 *
 * DX goals:
 * - no `getOrder` ceremony
 * - no track factory boilerplate
 * - still exposes the underlying `.track()` escape hatch for extensibility
 *
 * Note: This extends the returned instance (no globals, no prototype patching).
 */
export function episode(id: string, config: TrackEpisodeConfig): CreatorEpisodeBuilder {
  const ep = baseEpisode(id, config) as CreatorEpisodeBuilder;

  ep.whatsapp = (deviceId, conversationId, fn) => {
    return ep.track(
      "app_whatsapp",
      (getOrder) =>
        createWhatsAppTrackBuilder(config.fps, deviceId, conversationId, getOrder),
      fn,
    ) as CreatorEpisodeBuilder;
  };

  ep.imessage = (deviceId, conversationId, fn) => {
    return ep.track(
      "app_imessage",
      (getOrder) =>
        createIMessageTrackBuilder(config.fps, deviceId, conversationId, getOrder),
      fn,
    ) as CreatorEpisodeBuilder;
  };

  ep.x = (deviceId, fn) => {
    return ep.track(
      "app_x",
      (getOrder) => new XTrackBuilder(config.fps, deviceId, getOrder),
      fn,
    ) as CreatorEpisodeBuilder;
  };

  return ep;
}

// Re-export base DSL for convenience (single import for creators).
export * from "@tokovo/dsl";
