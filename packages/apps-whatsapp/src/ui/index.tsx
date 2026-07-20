import React, { useMemo } from "react";
import { getAppStateForDevice, projectWorldForDevice, WorldState } from "@tokovo/core";
import { WhatsAppExperienceProvider } from "../experience/ExperienceContext.js";
import { resolveWhatsAppExperience } from "../experience/resolver.js";
import type { WhatsAppAppearance } from "../experience/contract.js";
import type { WhatsAppThemeId } from "../theme/index.js";
import { renderWhatsAppScreen } from "../presentation/screen-strategy.js";
import { MediaViewerOverlay } from "../components/surfaces/MediaViewerOverlay.js";
import { StatusViewerOverlay } from "../components/surfaces/StatusViewerOverlay.js";
import { getBaseTime } from "../utils/messages.js";

import { WhatsAppState } from "../types/index.js";

export interface WhatsappChatViewProps {
  world: WorldState;
  t?: number;
  deviceId?: string;
  platform?: "ios" | "android";
  appearance?: WhatsAppAppearance;
  width?: number;
  height?: number;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const WhatsappChatView: React.FC<WhatsappChatViewProps> = ({
  world,
  t: _t,
  deviceId,
  platform,
  appearance,
  width,
  height,
  safeAreaInsets,
}) => {
  const resolvedDeviceId = deviceId ?? Object.keys(world.devices || {})[0];
  const appTheme =
    resolvedDeviceId && world.devices?.[resolvedDeviceId]?.appTheme
      ? world.devices[resolvedDeviceId]?.appTheme
      : undefined;
  const resolvedAppearance =
    appearance ??
    (resolvedDeviceId ? world.devices?.[resolvedDeviceId]?.appAppearance : undefined) ??
    "light";
  const resolvedPlatform =
    platform ??
    (world.devices?.[resolvedDeviceId ?? ""]?.profileId?.toLowerCase().includes("pixel")
      ? "android"
      : "ios");
  const appState = getAppStateForDevice<WhatsAppState>(world, "app_whatsapp", resolvedDeviceId);
  const locale = appState?.locale ?? "en-US";
  const experience = useMemo(
    () =>
      resolveWhatsAppExperience({
        platform: resolvedPlatform,
        appearance: resolvedAppearance,
        themeId: appTheme as WhatsAppThemeId | undefined,
        locale,
      }),
    [appTheme, locale, resolvedAppearance, resolvedPlatform],
  );

  // 1. Resolve App State & Screen
  const currentScreen = appState?.currentScreen || "chats";
  const renderWorld = useMemo(
    () => projectWorldForDevice(world, resolvedDeviceId),
    [world, resolvedDeviceId],
  );

  // 2. Resolve Dimensions (Resolution Independence)
  // Receive logical dimensions from parent (TokovoRenderer's AppSurface)
  // If undefined, assume standard logical width (393)
  const activeWidth = width || 393;
  const activeHeight = height || 852;

  const activeScreenContent = renderWhatsAppScreen(currentScreen, {
    world: renderWorld,
    deviceId: resolvedDeviceId,
    width: activeWidth,
    height: activeHeight,
    safeAreaInsets,
  });
  const viewer = appState?.mediaViewer;
  const statusViewer = appState?.statusViewer;
  const viewerConversation = viewer ? appState?.conversations?.[viewer.conversationId] : undefined;
  const viewerMessage = viewer
    ? viewerConversation?.messages.find((message) => message.id === viewer.messageId)
    : undefined;
  if (viewer && !viewerMessage) {
    throw new Error(`WhatsApp media viewer references missing message "${viewer.messageId}"`);
  }

  return (
    <WhatsAppExperienceProvider experience={experience}>
      <div
        role="application"
        aria-label={experience.t("app.name")}
        lang={experience.locale}
        dir={experience.direction}
        style={{ width: "100%", height: "100%" }}
      >
        {activeScreenContent}
        {viewerMessage && viewer && (
          <MediaViewerOverlay message={viewerMessage} openedAt={viewer.openedAt} />
        )}
        {statusViewer && (
          <StatusViewerOverlay
            statuses={appState?.statuses ?? []}
            viewer={statusViewer}
            baseTime={getBaseTime(renderWorld, resolvedDeviceId)}
          />
        )}
      </div>
    </WhatsAppExperienceProvider>
  );
};

// Main Entry
export const ui = {
  WhatsappChatView,
};
