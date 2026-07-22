import React, { useMemo } from "react";
import {
  requireAppStateForDevice,
  type PluginViewProps,
} from "@tokovo/core";
import { WhatsAppExperienceProvider } from "../experience/ExperienceContext.js";
import { resolveWhatsAppExperience } from "../experience/resolver.js";
import type { WhatsAppAppearance } from "../experience/contract.js";
import type { WhatsAppThemeId } from "../theme/index.js";
import { renderWhatsAppScreen } from "../presentation/screen-strategy.js";
import { MediaViewerOverlay } from "../components/surfaces/MediaViewerOverlay.js";
import { StatusViewerOverlay } from "../components/surfaces/StatusViewerOverlay.js";
import { getBaseTime } from "../utils/messages.js";

import { WhatsAppState } from "../types/index.js";

export interface WhatsappChatViewProps extends PluginViewProps {
  appearance?: WhatsAppAppearance;
}

export const WhatsappChatView: React.FC<WhatsappChatViewProps> = ({
  world,
  t: _t,
  deviceId,
  platform,
  appearance,
  width,
  height,
  appViewport,
}) => {
  const resolvedDeviceId = deviceId;
  const device = world.devices[resolvedDeviceId];
  if (!device) {
    throw new Error(`WHATSAPP_DEVICE_MISSING: "${resolvedDeviceId}" is not in world state.`);
  }
  const appTheme = device.appTheme;
  const resolvedAppearance = appearance ?? device.appAppearance ?? device.os.appearance;
  const resolvedPlatform = platform;
  const appState = requireAppStateForDevice<WhatsAppState>(
    world,
    "app_whatsapp",
    resolvedDeviceId,
  );
  const locale = appState.locale;
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
  const currentScreen = appState.currentScreen;

  const activeScreenContent = renderWhatsAppScreen(currentScreen, {
    world,
    deviceId: resolvedDeviceId,
    width,
    height,
    contentInsets: appViewport.interactiveInsets,
  });
  const viewer = appState.mediaViewer;
  const statusViewer = appState.statusViewer;
  const viewerConversation = viewer ? appState.conversations?.[viewer.conversationId] : undefined;
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
            statuses={appState.statuses}
            viewer={statusViewer}
            baseTime={getBaseTime(world, resolvedDeviceId)}
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
