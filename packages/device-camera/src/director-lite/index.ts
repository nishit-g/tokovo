/**
 * DirectorLite - Automatic Camera System
 * 
 * AI-driven camera that generates shots from event signals.
 * Falls back when manual camera is active.
 * 
 * @module device-camera/director-lite
 */

export { deriveDirectorEffects, type DeriveContext } from "./derive";
export { extractSignals } from "./signals";
export { ViralDramaV1, type DirectorStrategy, type Rule } from "./strategy";
export type {
    DirectorSignal,
    DirectorSignalType,
    DirectorLayoutModel,
    DirectorOutput,
    DerivedCameraEffect,
    DirectorDebug,
    LayoutRect,
} from "./types";
