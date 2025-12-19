/**
 * Handlers Index - Re-exports all handlers
 * 
 * @description Central export for all event handlers.
 */

// Types
export * from "./types";

// Handlers
export { processCameraEvent } from "./camera";
export { processAudioEvent, handleAutoSounds } from "./audio";
export { processOSEvent } from "./os";
export { processNotificationEvent } from "./notification";
export { processCallEvent } from "./call";
export { processTouchEvent } from "./touch";
