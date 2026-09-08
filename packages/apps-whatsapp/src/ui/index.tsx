import React, { useContext, useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { TokovoContext } from "@tokovo/react";
import { computeChatLayout, computeFeedLayout } from "../layout/index.js";
import { WHATSAPP_INTERACTION_TOKENS as tokens } from "../theme/index.js";
import { requireAppStateForDevice, type PluginViewProps } from "@tokovo/core";
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
    throw new Error(
      `WHATSAPP_DEVICE_MISSING: "${resolvedDeviceId}" is not in world state.`,
    );
  }
  const appTheme = device.appTheme;
  const resolvedAppearance =
    appearance ?? device.appAppearance ?? device.os.appearance;
  const resolvedPlatform = platform;
  const appState = requireAppStateForDevice<WhatsAppState>(
    world,
    "app_whatsapp",
    resolvedDeviceId,
  );
  const locale = appState.locale;
  const context = useContext(TokovoContext);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
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
  const closingViewer = appState.closingMediaViewer;
  const viewer =
    appState.mediaViewer ??
    (closingViewer &&
    frame < closingViewer.closedAt + tokens.viewerSeconds * fps
      ? closingViewer
      : null);
  const navigation = appState.navigation;
  const progress = navigation
    ? Math.max(
        0,
        Math.min(1, (frame - navigation.at) / (tokens.navigationSeconds * fps)),
      )
    : 1;
  const eased = 1 - (1 - progress) ** 3;
  const previous = useMemo(() => {
    if (!navigation || progress >= 1 || !context) return null;
    const previousState = {
      ...appState,
      currentScreen: navigation.fromScreen,
      conversationId: navigation.fromConversationId,
      activeGesture: null,
      mediaViewer: null,
      statusViewer: null,
    };
    const previousWorld = {
      ...world,
      appInstances: {
        ...world.appInstances,
        [`${resolvedDeviceId}:app_whatsapp`]: previousState,
      },
    };
    const layoutContext = {
      world: previousWorld,
      t: frame,
      activeDeviceId: resolvedDeviceId,
      activeAppId: "app_whatsapp",
      platform: resolvedPlatform,
      viewKind:
        navigation.fromScreen === "chat"
          ? ("CHAT" as const)
          : ("FEED" as const),
      activeConversationId: navigation.fromConversationId,
      viewportWidth: width,
      viewportHeight: height,
      appViewport,
    };
    const layout =
      navigation.fromScreen === "chat"
        ? computeChatLayout(layoutContext)
        : computeFeedLayout(layoutContext);
    return (
      <TokovoContext.Provider
        value={{ ...context, world: previousWorld, layout }}
      >
        {renderWhatsAppScreen(navigation.fromScreen, {
          world: previousWorld,
          deviceId: resolvedDeviceId,
          width,
          height,
          contentInsets: appViewport.interactiveInsets,
        })}
      </TokovoContext.Provider>
    );
  }, [
    navigation,
    progress,
    context,
    appState,
    world,
    resolvedDeviceId,
    frame,
    resolvedPlatform,
    width,
    height,
    appViewport,
  ]);
  const sign = experience.direction === "rtl" ? -1 : 1;
  const pop = navigation?.direction === "pop";
  const tab = navigation?.direction === "tab";
  const statusViewer = appState.statusViewer;
  const viewerConversation = viewer
    ? appState.conversations?.[viewer.conversationId]
    : undefined;
  const viewerMessage = viewer
    ? viewerConversation?.messages.find(
        (message) => message.id === viewer.messageId,
      )
    : undefined;
  if (viewer && !viewerMessage) {
    throw new Error(
      `WhatsApp media viewer references missing message "${viewer.messageId}"`,
    );
  }

  return (
    <WhatsAppExperienceProvider experience={experience}>
      <div
        role="application"
        aria-label={experience.t("app.name")}
        lang={experience.locale}
        dir={experience.direction}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          backgroundColor: experience.theme.colors.background,
        }}
      >
        {previous && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: pop ? 2 : 0,
              transform: `translateX(${tab ? 0 : sign * width * (pop ? eased : -0.25 * eased)}px)`,
              opacity: tab ? 1 - eased : 1,
            }}
          >
            {previous}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateX(${tab ? 0 : sign * width * (pop ? -0.25 : 1) * (1 - eased)}px)`,
            opacity: tab ? eased : 1,
          }}
        >
          {activeScreenContent}
        </div>
        {viewerMessage && viewer && (
          <MediaViewerOverlay
            message={viewerMessage}
            openedAt={viewer.openedAt}
            closedAt={
              appState.mediaViewer ? undefined : closingViewer?.closedAt
            }
            contentInsets={appViewport.interactiveInsets}
          />
        )}
        {statusViewer && (
          <StatusViewerOverlay
            statuses={appState.statuses}
            viewer={statusViewer}
            baseTime={getBaseTime(world, resolvedDeviceId)}
            contentInsets={appViewport.interactiveInsets}
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
