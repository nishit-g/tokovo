export {
  registerOverlayPlugin,
  overlayRuntimeEntry,
  tokovoRuntimeManifest,
} from "./plugin.js";
export {
  OVERLAY_STATE_KEY,
  createInitialOverlayState,
  getDefaultDurationFrames,
} from "./state.js";
export type {
  OverlayState,
  OverlayItem,
  OverlayVariant,
  OverlayPlacementPreset,
} from "./state.js";
