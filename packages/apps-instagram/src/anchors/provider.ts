import type {
  AnchorProvider,
  AnchorProviderContext,
  AnchorSnapshot,
  LayoutRect,
  LayoutState,
  SemanticLayoutState,
  WorldState,
} from "@tokovo/core";
import type { InstagramState } from "../runtime/state.js";
import { instagramAnchors } from "../runtime/adapters/anchors.js";

function extractSemantic(layout: unknown): SemanticLayoutState | null {
  if (!layout || typeof layout !== "object") return null;
  return (layout as LayoutState).semantic ?? null;
}

function getViewport(
  device: WorldState["devices"][string] | undefined,
  context?: AnchorProviderContext,
): { width: number; height: number } {
  const profile = context?.getDeviceProfile?.(device?.profileId);
  if (profile) {
    return {
      width: profile.dimensions.width,
      height: profile.dimensions.height,
    };
  }
  return { width: 430, height: 932 };
}

function addFallbackAnchors(
  anchors: Record<string, LayoutRect>,
  screen: NonNullable<Partial<InstagramState>["currentScreen"]>,
  width: number,
  height: number,
): void {
  anchors.bottom_nav ??= { x: 0, y: height * 0.92, width, height: height * 0.08 };
  if (screen === "home") {
    anchors.home_header ??= { x: 0, y: 0, width, height: height * 0.1 };
    anchors.stories_tray ??= { x: 0, y: height * 0.1, width, height: height * 0.11 };
    anchors.feed_list ??= { x: 0, y: height * 0.21, width, height: height * 0.71 };
    anchors.feed_post_0 ??= { x: 0, y: height * 0.24, width, height: height * 0.5 };
    anchors.feed_post_0_media ??= { x: 0, y: height * 0.3, width, height: height * 0.36 };
  } else if (screen === "story") {
    anchors.story_viewer ??= { x: 0, y: 0, width, height };
    anchors.story_progress ??= { x: 16, y: 14, width: width - 32, height: 8 };
    anchors.story_reply_bar ??= { x: 16, y: height - 78, width: width - 32, height: 44 };
  } else if (screen === "notifications") {
    anchors.notifications_list ??= { x: 0, y: height * 0.1, width, height: height * 0.82 };
    anchors.notifications_row_0 ??= { x: width * 0.04, y: height * 0.14, width: width * 0.92, height: height * 0.08 };
  } else if (screen === "inbox") {
    anchors.inbox_list ??= { x: 0, y: height * 0.17, width, height: height * 0.75 };
    anchors.dm_row_0 ??= { x: width * 0.04, y: height * 0.22, width: width * 0.92, height: height * 0.08 };
  } else if (screen === "thread") {
    anchors.thread_header ??= { x: 0, y: 0, width, height: height * 0.1 };
    anchors.dm_thread ??= { x: 0, y: height * 0.1, width, height: height * 0.72 };
    anchors.dm_message_latest ??= { x: width * 0.08, y: height * 0.7, width: width * 0.84, height: height * 0.08 };
    anchors.reply_input ??= { x: width * 0.04, y: height * 0.86, width: width * 0.7, height: height * 0.05 };
    anchors.reply_send_button ??= { x: width * 0.78, y: height * 0.86, width: width * 0.14, height: height * 0.05 };
  } else if (screen === "profile") {
    anchors.profile_header ??= { x: 0, y: 0, width, height: height * 0.34 };
    anchors.profile_grid ??= { x: 0, y: height * 0.38, width, height: height * 0.54 };
    anchors.profile_grid_0 ??= { x: 0, y: height * 0.4, width: width / 3, height: width / 3 };
  } else if (screen === "composer") {
    anchors.composer_surface ??= { x: 0, y: 0, width, height };
    anchors.composer_media ??= { x: 16, y: height * 0.12, width: width - 32, height: width - 32 };
    anchors.composer_caption_input ??= { x: 16, y: height * 0.78, width: width - 32, height: height * 0.1 };
  }
}

export const InstagramAnchorProvider: AnchorProvider = {
  appId: "app_instagram",
  framing: instagramAnchors.framing ?? {},
  getAnchors(world, layout, deviceId, context): AnchorSnapshot {
    const device = world.devices[deviceId];
    const { width, height } = getViewport(device, context);
    const state = (world.appState?.app_instagram ?? {}) as Partial<InstagramState>;
    const screen = state.currentScreen ?? "home";
    const anchors: Record<string, LayoutRect> = {
      device: { x: 0, y: 0, width, height },
      app: { x: 0, y: 0, width, height },
    };
    const semantic = extractSemantic(layout);
    if (semantic?.regions) {
      for (const region of Object.values(semantic.regions) as Array<{
        id: string;
        rect: LayoutRect;
      }>) {
        anchors[region.id] = region.rect;
      }
    }
    addFallbackAnchors(anchors, screen, width, height);
    return {
      anchors,
      deviceId,
      appId: "app_instagram",
    };
  },
};
