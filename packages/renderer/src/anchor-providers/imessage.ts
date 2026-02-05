import type { AnchorProvider, AnchorProviderContext, AnchorSnapshot, LayoutRect, WorldState } from "@tokovo/core";

const APP_ID = "app_imessage";

function getViewportDimensions(
  device: WorldState["devices"][string] | undefined,
  context?: AnchorProviderContext,
): { width: number; height: number } {
  const profileId = device?.profileId;
  const profile = context?.getDeviceProfile?.(profileId);
  if (profile) {
    return {
      width: profile.dimensions.width,
      height: profile.dimensions.height,
    };
  }
  if (device?.screenDimensions) {
    return {
      width: device.screenDimensions.width,
      height: device.screenDimensions.height,
    };
  }
  return { width: 430, height: 932 };
}

export const IMessageAnchorProvider: AnchorProvider = {
  appId: APP_ID,
  framing: {
    imessage_list_header: { anchorPoint: { x: 0.5, y: 0.12 }, paddingPx: 12, targetFill: 0.9 },
    imessage_list: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 16, targetFill: 0.86 },
    imessage_thread: { anchorPoint: { x: 0.5, y: 0.55 }, paddingPx: 16, targetFill: 0.88 },
    imessage_composer: { anchorPoint: { x: 0.5, y: 0.9 }, paddingPx: 10, targetFill: 0.6 },
    imessage_info: { anchorPoint: { x: 0.5, y: 0.45 }, paddingPx: 16, targetFill: 0.88 },
    imessage_media: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 16, targetFill: 0.9 },
    device: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 0, targetFill: 1.0 },
  },
  getAnchors(
    world: WorldState,
    _layout: unknown,
    deviceId: string,
    context?: AnchorProviderContext,
  ): AnchorSnapshot {
    const device = world.devices[deviceId];
    const { width, height } = getViewportDimensions(device, context);
    const state = (world.appState?.[APP_ID] ?? {}) as { currentScreen?: string };
    const screen = state.currentScreen ?? "list";

    const anchors: Record<string, LayoutRect> = {
      device: { x: 0, y: 0, width, height },
      app: { x: 0, y: 0, width, height },
    };

    if (screen === "list") {
      anchors.imessage_list_header = { x: 0, y: 0, width, height: height * 0.15 };
      anchors.imessage_list = { x: 0, y: height * 0.15, width, height: height * 0.85 };
    }

    if (screen === "chat") {
      anchors.imessage_list_header = { x: 0, y: 0, width, height: height * 0.12 };
      anchors.imessage_thread = { x: 0, y: height * 0.12, width, height: height * 0.73 };
      anchors.imessage_composer = { x: 0, y: height * 0.85, width, height: height * 0.15 };
    }

    if (screen === "info") {
      anchors.imessage_info = { x: width * 0.04, y: height * 0.12, width: width * 0.92, height: height * 0.78 };
    }

    if (screen === "media") {
      anchors.imessage_media = { x: 0, y: height * 0.12, width, height: height * 0.78 };
    }

    return { anchors, deviceId, appId: APP_ID };
  },
};

