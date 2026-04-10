import type { EpisodeDefinition } from "../../types/episode-definition.js";
import instagramShowcaseEpisodes from "./instagram.js";
import imessageShowcaseEpisodes from "./imessage.js";
import linkedinShowcaseEpisodes from "./linkedin.js";
import snapchatShowcaseEpisodes from "./snapchat.js";
import teamsShowcaseEpisodes from "./teams.js";
import typewriterShowcaseEpisodes from "./typewriter.js";
import whatsappShowcaseEpisodes from "./whatsapp.js";
import xShowcaseEpisodes from "./x.js";

/**
 * App package showcases.
 *
 * Curated app showcase catalog for the enterprise storybook.
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
