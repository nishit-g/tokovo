import type {
  AnchorProvider,
  AnchorProviderContext,
  AnchorSnapshot,
  LayoutRect,
  LayoutState,
  SemanticLayoutState,
  WorldState,
} from "@tokovo/core";

import type { XState } from "../runtime/state.js";
import { xAnchors } from "../runtime/adapters/anchors.js";

const APP_ID = "app_x";

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

function extractSemantic(layout: unknown): SemanticLayoutState | null {
  if (!layout || typeof layout !== "object") return null;
  return (layout as LayoutState).semantic ?? null;
}

function addSemanticAnchors(
  anchors: Record<string, LayoutRect>,
  semantic: SemanticLayoutState | null,
) {
  if (!semantic?.regions) return;
  for (const region of Object.values(semantic.regions)) {
    anchors[region.id] = region.rect;
  }
}

function aliasAnchor(anchors: Record<string, LayoutRect>, alias: string, source: string): void {
  if (!anchors[alias] && anchors[source]) {
    anchors[alias] = anchors[source];
  }
}

function addFallbackAnchors(
  anchors: Record<string, LayoutRect>,
  screen: NonNullable<Partial<XState>["currentScreen"]>,
  width: number,
  height: number,
) {
  anchors.nav_bar ??= { x: 0, y: height * 0.9, width, height: height * 0.1 };

  if (screen === "timeline") {
    anchors.timeline_header ??= { x: 0, y: 0, width, height: height * 0.12 };
    anchors.timeline_tabs ??= { x: 0, y: height * 0.11, width, height: height * 0.05 };
    anchors.timeline_feed ??= { x: 0, y: height * 0.16, width, height: height * 0.74 };
    anchors.tweet_card ??= {
      x: width * 0.04,
      y: height * 0.18,
      width: width * 0.92,
      height: height * 0.28,
    };
    anchors.timeline_primary_row ??= anchors.tweet_card;
    anchors.timeline_primary_avatar ??= {
      x: width * 0.04,
      y: height * 0.19,
      width: width * 0.1,
      height: width * 0.1,
    };
    anchors.timeline_primary_content ??= {
      x: width * 0.17,
      y: height * 0.19,
      width: width * 0.75,
      height: height * 0.2,
    };
    anchors.timeline_primary_media ??= {
      x: width * 0.17,
      y: height * 0.29,
      width: width * 0.75,
      height: height * 0.12,
    };
    anchors.metrics_row ??= {
      x: width * 0.17,
      y: height * 0.41,
      width: width * 0.75,
      height: height * 0.06,
    };
    anchors.timeline_primary_actions ??= anchors.metrics_row;
    anchors.compose_fab ??= {
      x: width * 0.77,
      y: height * 0.79,
      width: width * 0.15,
      height: width * 0.15,
    };
    return;
  }

  if (screen === "tweet") {
    anchors.timeline_header ??= { x: 0, y: 0, width, height: height * 0.12 };
    anchors.tweet_card ??= {
      x: width * 0.04,
      y: height * 0.15,
      width: width * 0.92,
      height: height * 0.42,
    };
    anchors.tweet_detail_header ??= {
      x: width * 0.04,
      y: height * 0.17,
      width: width * 0.92,
      height: height * 0.06,
    };
    anchors.tweet_detail_body ??= {
      x: width * 0.04,
      y: height * 0.24,
      width: width * 0.92,
      height: height * 0.12,
    };
    anchors.tweet_detail_media ??= {
      x: width * 0.04,
      y: height * 0.34,
      width: width * 0.92,
      height: height * 0.14,
    };
    anchors.tweet_detail_quote ??= {
      x: width * 0.04,
      y: height * 0.48,
      width: width * 0.92,
      height: height * 0.1,
    };
    anchors.metrics_row ??= {
      x: width * 0.04,
      y: height * 0.56,
      width: width * 0.92,
      height: height * 0.06,
    };
    anchors.reply_composer ??= { x: 0, y: height * 0.78, width, height: height * 0.12 };
    return;
  }

  if (screen === "messages") {
    anchors.timeline_header ??= { x: 0, y: 0, width, height: height * 0.12 };
    anchors.message_search ??= {
      x: width * 0.04,
      y: height * 0.15,
      width: width * 0.92,
      height: height * 0.05,
    };
    anchors.message_requests ??= {
      x: width * 0.04,
      y: height * 0.21,
      width: width * 0.92,
      height: height * 0.07,
    };
    anchors.dm_thread ??= { x: 0, y: height * 0.29, width, height: height * 0.61 };
    anchors.dm_row_0 ??= {
      x: width * 0.04,
      y: height * 0.31,
      width: width * 0.92,
      height: height * 0.09,
    };
    anchors.dm_row_0_avatar ??= {
      x: width * 0.04,
      y: height * 0.33,
      width: width * 0.12,
      height: width * 0.12,
    };
    anchors.dm_row_0_content ??= {
      x: width * 0.19,
      y: height * 0.33,
      width: width * 0.73,
      height: height * 0.06,
    };
    anchors.compose_fab ??= {
      x: width * 0.77,
      y: height * 0.79,
      width: width * 0.15,
      height: width * 0.15,
    };
    return;
  }

  if (screen === "notifications") {
    anchors.timeline_header ??= { x: 0, y: 0, width, height: height * 0.12 };
    anchors.timeline_tabs ??= { x: 0, y: height * 0.11, width, height: height * 0.05 };
    anchors.notifications_list ??= { x: 0, y: height * 0.16, width, height: height * 0.74 };
    anchors.notifications_row_0 ??= {
      x: width * 0.04,
      y: height * 0.18,
      width: width * 0.92,
      height: height * 0.1,
    };
    anchors.notifications_row_0_avatar ??= {
      x: width * 0.14,
      y: height * 0.2,
      width: width * 0.09,
      height: width * 0.09,
    };
    anchors.notifications_row_0_content ??= {
      x: width * 0.25,
      y: height * 0.2,
      width: width * 0.67,
      height: height * 0.06,
    };
    return;
  }

  if (screen === "profile") {
    anchors.profile_header ??= { x: 0, y: 0, width, height: height * 0.12 };
    anchors.profile_banner ??= { x: 0, y: height * 0.12, width, height: height * 0.16 };
    anchors.profile_avatar ??= {
      x: width * 0.04,
      y: height * 0.25,
      width: width * 0.2,
      height: width * 0.2,
    };
    anchors.profile_tabs ??= { x: 0, y: height * 0.46, width, height: height * 0.06 };
    anchors.timeline_feed ??= { x: 0, y: height * 0.52, width, height: height * 0.38 };
    return;
  }

  if (screen === "compose") {
    anchors.compose_header ??= { x: 0, y: 0, width, height: height * 0.12 };
    anchors.reply_composer ??= { x: 0, y: height * 0.12, width, height: height * 0.78 };
    anchors.compose_editor ??= {
      x: width * 0.04,
      y: height * 0.16,
      width: width * 0.92,
      height: height * 0.6,
    };
    anchors.compose_footer ??= {
      x: width * 0.04,
      y: height * 0.8,
      width: width * 0.92,
      height: height * 0.07,
    };
    return;
  }

  if (screen === "thread") {
    anchors.thread_header ??= { x: 0, y: 0, width, height: height * 0.12 };
    anchors.dm_thread ??= { x: 0, y: height * 0.12, width, height: height * 0.72 };
    anchors.dm_message_latest ??= {
      x: width * 0.08,
      y: height * 0.72,
      width: width * 0.84,
      height: height * 0.08,
    };
    anchors.reply_composer ??= { x: 0, y: height * 0.84, width, height: height * 0.1 };
    anchors.reply_input ??= {
      x: width * 0.05,
      y: height * 0.86,
      width: width * 0.72,
      height: height * 0.05,
    };
    anchors.reply_send_button ??= {
      x: width * 0.8,
      y: height * 0.86,
      width: width * 0.15,
      height: height * 0.05,
    };
  }
}

export const XAnchorProvider: AnchorProvider = {
  appId: APP_ID,
  framing: xAnchors.framing ?? {},

  getAnchors(
    world: WorldState,
    layout: unknown,
    deviceId: string,
    context?: AnchorProviderContext,
  ): AnchorSnapshot {
    const device = world.devices[deviceId];
    const { width, height } = getViewportDimensions(device, context);
    const state = (world.appState?.[APP_ID] ?? {}) as Partial<XState>;
    const screen = state.currentScreen ?? "timeline";

    const anchors: Record<string, LayoutRect> = {
      device: { x: 0, y: 0, width, height },
      app: { x: 0, y: 0, width, height },
    };

    // Preferred: layout-driven semantic anchors (deterministic + tokenized).
    const semantic = extractSemantic(layout);
    addSemanticAnchors(anchors, semantic);

    addFallbackAnchors(anchors, screen, width, height);
    aliasAnchor(anchors, "timeline", "timeline_feed");
    aliasAnchor(anchors, "notification_card", "notifications_row_0");
    aliasAnchor(anchors, "composer", "reply_composer");

    return { anchors, deviceId, appId: APP_ID };
  },
};
