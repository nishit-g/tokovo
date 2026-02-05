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
} from "./types";

export { DEFAULT_FRAMING, EMPTY_SNAPSHOT } from "./types";

// Resolver
export {
  resolveAnchorWithFallback,
  anchorToOrigin,
  calculateFillScale,
  resolveAnchorFully,
  isAnchorAvailable,
} from "./resolver";

export {
  getAnchorDiagnostics,
  resetAnchorDiagnostics,
  type AnchorDiagnosticsSnapshot,
} from "./diagnostics";

// Registry
export * from "./registry";
