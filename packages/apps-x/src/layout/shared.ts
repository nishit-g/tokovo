import type { LayoutContext, LayoutRect, SemanticRegion } from "@tokovo/core";
import { resolveXExperience } from "../experience/resolver.js";
import { requireXState } from "../runtime/selectors.js";

export function rect(x: number, y: number, width: number, height: number): LayoutRect {
  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.max(0, width),
    height: Math.max(0, height),
  };
}

export function region(
  regions: Record<string, SemanticRegion>,
  id: string,
  rectangle: LayoutRect,
  tags: string[],
  metadata?: Record<string, unknown>,
): void {
  regions[id] = { id, rect: rectangle, tags, metadata };
}

export function semantic(
  regions: Record<string, SemanticRegion>,
  groups: Record<string, string[]> = {},
) {
  return { regions, groups };
}

export function resolveXLayoutEnvironment(ctx: LayoutContext) {
  const device = ctx.world.devices[ctx.activeDeviceId];
  if (!device) throw new Error(`X_LAYOUT_DEVICE_MISSING: "${ctx.activeDeviceId}" is not in world state`);
  const state = requireXState(ctx.world, ctx.activeDeviceId);
  const experience = resolveXExperience({
    platform: ctx.platform,
    appearance: device.appAppearance ?? device.os.appearance,
    themeId: device.appTheme,
    locale: state.locale,
    reducedMotion: device.os.motion === "reduced",
    increasedContrast: device.os.contrast === "increased",
    textScale: device.os.textScale,
  });
  return { device, state, experience };
}
