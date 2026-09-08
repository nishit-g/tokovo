import type { EpisodeDefinition } from "../../types/episode-definition.js";
import instagramShowcaseEpisodes from "./instagram.js";
import imessageShowcaseEpisodes from "./imessage.js";
import linkedinShowcaseEpisodes from "./linkedin.js";
import snapchatShowcaseEpisodes from "./snapchat.js";
import teamsShowcaseEpisodes from "./teams.js";
import typewriterShowcaseEpisodes from "./typewriter.js";
import whatsappShowcaseEpisodes from "./whatsapp.js";
import xShowcaseEpisodes from "./x.js";
import { chatMotionProofEpisodes } from "./chat-motion-proof.episode.js";

/**
 * App package showcases.
 *
 * Curated app showcase catalog for preview and validation.
 */
export const appShowcaseEpisodes: EpisodeDefinition[] = [
  ...whatsappShowcaseEpisodes,
  ...xShowcaseEpisodes,
  ...linkedinShowcaseEpisodes,
  ...instagramShowcaseEpisodes,
  ...teamsShowcaseEpisodes,
  ...snapchatShowcaseEpisodes,
  ...imessageShowcaseEpisodes,
  ...typewriterShowcaseEpisodes,
  ...chatMotionProofEpisodes,
];

export default appShowcaseEpisodes;

export {
  whatsappShowcaseEpisodes,
  xShowcaseEpisodes,
  linkedinShowcaseEpisodes,
  instagramShowcaseEpisodes,
  teamsShowcaseEpisodes,
  snapchatShowcaseEpisodes,
  imessageShowcaseEpisodes,
  typewriterShowcaseEpisodes,
};
