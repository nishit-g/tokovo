/**
 * Tests - Test episodes for quality assurance
 *
 * Import this file in Root.tsx to load all test episodes:
 *   import "@tokovo/episodes/tests";
 *
 * To add a new test episode:
 *   1. Create: tests/my-test.episode.ts
 *   2. Add import below
 */

import type { EpisodeDefinition } from "../types/episode-definition.js";

import testEpisode from "./test.episode";
import keyboardPluginDemo from "./keyboard-plugin-demo.episode";
import typingPluginDemo from "./typing-plugin-demo.episode";
import newDxTest from "../test/new-dx-test.episode";
// plop:episode-import

export const testEpisodes: EpisodeDefinition[] = [
  testEpisode,
  keyboardPluginDemo,
  typingPluginDemo,
  newDxTest,
  // plop:episode-entry
];

export default testEpisodes;

export { testEpisode, keyboardPluginDemo, typingPluginDemo, newDxTest };
