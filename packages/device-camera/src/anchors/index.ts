/**
 * Anchors Module - Semantic camera targeting
 *
 * @module device-camera/anchors
 */

// Types
export type {
  Rect,
  AnchorFraming,
  AnchorSnapshot,
  ResolvedAnchor,
  AnchorProvider,
  SemanticAnchorId,
} from "./types.js";

export { DEFAULT_FRAMING, EMPTY_SNAPSHOT } from "./types.js";

// Resolver
export {
  resolveAnchorWithFallback,
  anchorToOrigin,
  calculateFillScale,
  resolveAnchorFully,
  isAnchorAvailable,
} from "./resolver.js";

export {
  getAnchorDiagnostics,
  resetAnchorDiagnostics,
  type AnchorDiagnosticsSnapshot,
} from "./diagnostics.js";

// Registry
export * from "./registry.js";
