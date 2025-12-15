/**
 * DSL Types
 * 
 * Types specific to the author DSL layer.
 */

import { MessageRef } from "@tokovo/ir";

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
export type MessageHandle = MessageRef;

/**
 * Track builder for concurrent operations.
 */
export interface TrackBuilder {
    wait(duration: string): TrackBuilder;
    typing(actor: string): TypingBuilder;
    send(actor: string, text: string): MessageHandle;
    receive(actor: string, text: string): MessageHandle;
}

/**
 * Track function for concurrent().
 */
export type TrackFn = (t: TrackBuilder) => void;

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
    flow: any; // Using any for now to avoid circular dependency hell with IR
    schemaVersion: string;
}
