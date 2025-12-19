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

export {
    DEFAULT_FRAMING,
    EMPTY_SNAPSHOT,
} from "./types";

// Registry
export {
    registerAnchorProvider,
    getAnchorProvider,
    hasAnchorProvider,
    getAnchorsForApp,
    getAnchorFraming,
    getRegisteredAppIds,
    clearAnchorProviders,
    getProviderCount,
} from "./registry";

// Resolver
export {
    resolveAnchorWithFallback,
    anchorToOrigin,
    calculateFillScale,
    resolveAnchorFully,
} from "./resolver";
