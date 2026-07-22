import type { ReactNode } from "react";
import { useWhatsAppExperience } from "../../experience/ExperienceContext.js";
import type { WhatsAppTabId } from "../../presentation/strategy.js";
import { TabNavigation } from "../TabNavigation.js";

export interface AppScaffoldProps {
  title: string;
  activeTab?: WhatsAppTabId;
  safeAreaTop: number;
  safeAreaBottom: number;
  actions?: ReactNode;
  leading?: ReactNode;
  children: ReactNode;
  showTabs?: boolean;
  unreadChatsCount?: number;
  missedCallsCount?: number;
}

export function AppScaffold({
  title,
  activeTab,
  safeAreaTop,
  safeAreaBottom,
  actions,
  leading,
  children,
  showTabs = true,
  unreadChatsCount,
  missedCallsCount,
}: AppScaffoldProps) {
  const { theme, platform, direction } = useWhatsAppExperience();
  const { uiSpacing: spacing, uiTypography: typography } = theme;
  const isAndroid = platform === "android";
  const headerText = isAndroid
    ? theme.colors.headerText
    : theme.colors.receivedBubbleText;

  return (
    <div
      role="region"
      aria-label={title}
      dir={direction}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: theme.colors.receivedBubbleText,
        backgroundColor: theme.colors.background,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        role="banner"
        data-cinematic-subject={`${activeTab ?? "screen"}_header`}
        style={{
          boxSizing: "border-box",
          height: safeAreaTop + spacing.navBarHeight,
          paddingTop: safeAreaTop,
          paddingInlineStart: spacing.pagePaddingWide,
          paddingInlineEnd: spacing.pagePaddingX,
          display: leading ? "grid" : "flex",
          gridTemplateColumns: leading ? "1fr auto 1fr" : undefined,
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          borderBottom: `0.5px solid ${theme.colors.divider}`,
          color: headerText,
          backgroundColor: theme.colors.headerBackground,
        }}
      >
        {leading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifySelf: "start",
              color: isAndroid ? headerText : theme.colors.accent,
            }}
          >
            {leading}
          </div>
        )}
        <h1
          style={{
            ...(isAndroid ? typography.headline : typography.title),
            color: headerText,
            fontFamily: theme.typography.fontFamily,
            justifySelf: leading ? "center" : undefined,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {actions && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.headerActionGap,
              color: isAndroid ? headerText : theme.colors.accent,
              justifySelf: leading ? "end" : undefined,
            }}
          >
            {actions}
          </div>
        )}
      </div>

      <div
        role="main"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          paddingBottom: showTabs
            ? spacing.tabBarHeight + safeAreaBottom
            : safeAreaBottom,
          backgroundColor: theme.colors.background,
        }}
      >
        {children}
      </div>

      {showTabs && activeTab && (
        <TabNavigation
          activeTab={activeTab}
          safeAreaBottom={safeAreaBottom}
          unreadChatsCount={unreadChatsCount}
          missedCallsCount={missedCallsCount}
        />
      )}
    </div>
  );
}
