import {
  createIMessageTrackBuilder,
  type IMessageTrackBuilder,
} from "@tokovo/apps-imessage";
import {
  createSnapchatTrackBuilder,
  type SnapchatTrackBuilder,
} from "@tokovo/apps-snapchat";
import {
  createTeamsTrackBuilder,
  TeamsTrackBuilder,
} from "@tokovo/apps-teams";
import {
  createWhatsAppTrackBuilder,
  type WhatsAppTrackBuilder,
} from "@tokovo/apps-whatsapp";
import { XTrackBuilder } from "@tokovo/apps-x";
import { episode as baseEpisode, type EpisodeBuilder, type TrackFn } from "@tokovo/dsl";
import type { TrackEpisodeConfig } from "@tokovo/ir";

type TeamsTrackBuilderInstance = InstanceType<typeof TeamsTrackBuilder>;

export type CodeFirstEpisodeBuilder = EpisodeBuilder & {
  whatsapp: (
    deviceId: string,
    conversationId: string,
    fn: TrackFn<WhatsAppTrackBuilder>,
  ) => CodeFirstEpisodeBuilder;
  imessage: (
    deviceId: string,
    conversationId: string,
    fn: TrackFn<IMessageTrackBuilder>,
  ) => CodeFirstEpisodeBuilder;
  snapchat: (
    deviceId: string,
    conversationId: string,
    fn: TrackFn<SnapchatTrackBuilder>,
  ) => CodeFirstEpisodeBuilder;
  teams: (
    deviceId: string,
    fn: TrackFn<TeamsTrackBuilderInstance>,
  ) => CodeFirstEpisodeBuilder;
  x: (
    deviceId: string,
    fn: TrackFn<XTrackBuilder>,
  ) => CodeFirstEpisodeBuilder;
};

export function episode(
  id: string,
  config: TrackEpisodeConfig,
): CodeFirstEpisodeBuilder {
  const ep = baseEpisode(id, config) as CodeFirstEpisodeBuilder;

  ep.whatsapp = (deviceId, conversationId, fn) =>
    ep.track(
      "app_whatsapp",
      (getOrder) =>
        createWhatsAppTrackBuilder(config.fps, deviceId, conversationId, getOrder),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.imessage = (deviceId, conversationId, fn) =>
    ep.track(
      "app_imessage",
      (getOrder) =>
        createIMessageTrackBuilder(config.fps, deviceId, conversationId, getOrder),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.snapchat = (deviceId, conversationId, fn) =>
    ep.track(
      "app_snapchat",
      (getOrder) =>
        createSnapchatTrackBuilder(config.fps, deviceId, conversationId, getOrder),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.teams = (deviceId, fn) =>
    ep.track(
      "app_teams",
      (getOrder) => createTeamsTrackBuilder(config.fps, deviceId, getOrder),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.x = (deviceId, fn) =>
    ep.track(
      "app_x",
      (getOrder) => new XTrackBuilder(config.fps, deviceId, getOrder),
      fn,
    ) as CodeFirstEpisodeBuilder;

  return ep;
}
