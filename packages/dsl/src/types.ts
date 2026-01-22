/**
 * DSL Types
 *
 * Types specific to the author DSL layer.
 */

import { TrackMessageRef } from "@tokovo/ir";

/**
 * Typing builder for fluent API.
 * Allows: typing("Bob").for("2s")
 */
export interface TypingBuilder {
  /**
   * Set duration for typing indicator.
   * Compiler expands to: TypingStart + Wait + TypingEnd
   */
  for(duration: string): void;
}

/**
 * Message handle returned by send/receive.
 * Can be passed to read() or delete().
 */
export type MessageHandle = TrackMessageRef;

/**
 * Episode configuration.
 */
export interface EpisodeConfig {
  fps?: number;
  title?: string;
}

/**
 * Episode Definition
 */
export interface EpisodeDefinition {
  id: string;
  flow: any;
  schemaVersion: string;
}
