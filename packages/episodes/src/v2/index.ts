/**
 * V2 Baselines - Canonical episodes for future authoring
 *
 * Import this catalog in runtimes to expose baseline episodes:
 *   import v2Episodes from "@tokovo/episodes/v2";
 */

import type { EpisodeDefinition } from "../types/episode-definition.js";

import deviceBaseline from "./device-baseline.episode.js";
import creatorSeriesShowcase from "./creator-series-showcase.episode.js";
import creatorFriendsChatNoOverlay from "./creator-friends-chat-no-overlay.episode.js";
import creatorGroupChatMultiapp from "./creator-group-chat-multiapp.episode.js";
import localFriendsChatNoOverlay from "./local-friends-chat-no-overlay.episode.js";
import overlayBaseline from "./overlay-baseline.episode.js";
import whatsappGroupRepliesBaseline from "./whatsapp-group-replies-baseline.episode.js";
import xReplyThreadBaseline from "./x-reply-thread-baseline.episode.js";

export const v2Episodes: EpisodeDefinition[] = [
  deviceBaseline,
  creatorSeriesShowcase,
  creatorFriendsChatNoOverlay,
  creatorGroupChatMultiapp,
  localFriendsChatNoOverlay,
  overlayBaseline,
  whatsappGroupRepliesBaseline,
  xReplyThreadBaseline,
];

export default v2Episodes;

export {
  deviceBaseline,
  creatorSeriesShowcase,
  creatorFriendsChatNoOverlay,
  creatorGroupChatMultiapp,
  localFriendsChatNoOverlay,
  overlayBaseline,
  whatsappGroupRepliesBaseline,
  xReplyThreadBaseline,
};
