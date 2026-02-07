import type { EngineRegistries } from "@tokovo/core";
import { overlayFeatureReducer } from "./reducer.js";

const registeredEngines = new WeakSet<EngineRegistries>();

/**
 * Registers the story overlay system.
 *
 * This is a feature reducer (event kind: OVERLAY), not an "app".
 * Creators can author overlays without adding anything to episode.apps.
 */
export function registerOverlayPlugin(registries: EngineRegistries): void {
  if (registeredEngines.has(registries)) return;
  registeredEngines.add(registries);

  registries.reducers.registerFeatureReducer("OVERLAY", overlayFeatureReducer);
}

