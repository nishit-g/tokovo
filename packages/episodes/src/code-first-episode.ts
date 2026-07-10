import {
  createIMessageTrackBuilder,
  type IMessageTrackBuilder,
} from "@tokovo/apps-imessage";
import {
  createInstagramTrackBuilder,
  type InstagramTrackBuilder,
} from "@tokovo/apps-instagram";
import { LinkedInTrackBuilder } from "@tokovo/apps-linkedin";
import {
  createSnapchatTrackBuilder,
  type SnapchatTrackBuilder,
} from "@tokovo/apps-snapchat";
import { createTeamsTrackBuilder, TeamsTrackBuilder } from "@tokovo/apps-teams";
import {
  createWhatsAppTrackBuilder,
  type WhatsAppTrackBuilder,
} from "@tokovo/apps-whatsapp";
import { XTrackBuilder } from "@tokovo/apps-x";
import { TypewriterTrackBuilder } from "@tokovo/apps-typewriter";
import {
  episode as baseEpisode,
  type EpisodeBuilder,
  type TrackFn,
} from "@tokovo/dsl";
import type { TrackEpisodeConfig } from "@tokovo/ir";
import {
  createScene,
  type SceneBuilder,
  type SceneOptions,
} from "./creator-language.js";

export {
  actor,
  cast,
  SceneBuilder,
  SceneConversation,
  SceneSocial,
} from "./creator-language.js";
export type {
  ActorIdentity,
  ActorProfile,
  ActorRef,
  BuiltInApp,
  CommentHandle,
  ConversationMessageOptions,
  ConversationOptions,
  MessageHandle,
  PostHandle,
  SceneOptions,
  SocialCommentOptions,
  SocialOptions,
  SocialPostOptions,
  StoryHandle,
  StoryHandleKind,
} from "./creator-language.js";

type TeamsTrackBuilderInstance = InstanceType<typeof TeamsTrackBuilder>;
type TypewriterTrackOptions = NonNullable<
  ConstructorParameters<typeof TypewriterTrackBuilder>[3]
>;

export type CodeFirstEpisodeBuilder = EpisodeBuilder & {
  scene: (
    id: string,
    options: SceneOptions,
    fn: (scene: SceneBuilder) => void,
  ) => CodeFirstEpisodeBuilder;
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
  instagram: (
    deviceId: string,
    fn: TrackFn<InstagramTrackBuilder>,
  ) => CodeFirstEpisodeBuilder;
  linkedin: (
    deviceId: string,
    fn: TrackFn<LinkedInTrackBuilder>,
  ) => CodeFirstEpisodeBuilder;
  teams: (
    deviceId: string,
    fn: TrackFn<TeamsTrackBuilderInstance>,
  ) => CodeFirstEpisodeBuilder;
  x: (deviceId: string, fn: TrackFn<XTrackBuilder>) => CodeFirstEpisodeBuilder;
  typewriter: (
    deviceId: string,
    fn: TrackFn<TypewriterTrackBuilder>,
    options?: TypewriterTrackOptions,
  ) => CodeFirstEpisodeBuilder;
};

export function episode(
  id: string,
  config: TrackEpisodeConfig,
): CodeFirstEpisodeBuilder {
  const ep = baseEpisode(id, config) as CodeFirstEpisodeBuilder;
  const sceneIds = new Set<string>();

  ep.scene = (sceneId, options, fn) => {
    if (sceneIds.has(sceneId)) {
      throw new Error(
        `Scene id "${sceneId}" is already used in episode "${id}"`,
      );
    }
    createScene(ep, sceneId, options, config.fps, fn);
    sceneIds.add(sceneId);
    return ep;
  };

  ep.whatsapp = (deviceId, conversationId, fn) =>
    ep.track(
      "app_whatsapp",
      (getOrder) =>
        createWhatsAppTrackBuilder(
          config.fps,
          deviceId,
          conversationId,
          getOrder,
        ),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.imessage = (deviceId, conversationId, fn) =>
    ep.track(
      "app_imessage",
      (getOrder) =>
        createIMessageTrackBuilder(
          config.fps,
          deviceId,
          conversationId,
          getOrder,
        ),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.snapchat = (deviceId, conversationId, fn) =>
    ep.track(
      "app_snapchat",
      (getOrder) =>
        createSnapchatTrackBuilder(
          config.fps,
          deviceId,
          conversationId,
          getOrder,
        ),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.instagram = (deviceId, fn) =>
    ep.track(
      "app_instagram",
      (getOrder) => createInstagramTrackBuilder(config.fps, deviceId, getOrder),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.linkedin = (deviceId, fn) =>
    ep.track(
      "app_linkedin",
      (getOrder) => new LinkedInTrackBuilder(config.fps, deviceId, getOrder),
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

  ep.typewriter = (deviceId, fn, options) =>
    ep.track(
      "app_typewriter",
      (getOrder) =>
        new TypewriterTrackBuilder(config.fps, deviceId, getOrder, options),
      fn,
    ) as CodeFirstEpisodeBuilder;

  return ep;
}
