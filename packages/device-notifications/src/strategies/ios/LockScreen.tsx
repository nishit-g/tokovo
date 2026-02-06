import React from "react";
import type { NotificationLockScreenProps } from "../types";

export const IOSLockScreen: React.FC<NotificationLockScreenProps> = ({
  notifications,
  tokens,
  scale,
}) => {
  const { lockScreen, icon, text, typography } = tokens;
  const maxVisible = lockScreen.maxVisible;

  const visibleNotifications = notifications.slice(0, maxVisible);

  const getTransformForItem = (
    animationState: string,
    animationProgress: number,
  ): string => {
    if (animationState === "entering") {
      const translateY = 30 * (1 - animationProgress);
      return `translateY(${translateY}px)`;
    }
    if (animationState === "exiting") {
      const translateX = -100 * animationProgress;
      return `translateX(${translateX}%)`;
    }
    return "translateY(0)";
  };

  const getOpacityForItem = (
    animationState: string,
    animationProgress: number,
  ): number => {
    if (animationState === "entering") return animationProgress;
    if (animationState === "exiting") return 1 - animationProgress;
    return 1;
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120 * scale,
        left: lockScreen.margin.horizontal * scale,
        right: lockScreen.margin.horizontal * scale,
        display: "flex",
        flexDirection: "column",
        gap: lockScreen.gap * scale,
        fontFamily: typography.fontFamily,
      }}
    >
      {visibleNotifications.map(
        ({ notification, animationState, animationProgress }) => {
          const { ir } = notification;

          return (
            <div
              key={notification.id}
              style={{
                background: lockScreen.background,
                backdropFilter: lockScreen.backgroundBlur,
                WebkitBackdropFilter: lockScreen.backgroundBlur,
                borderRadius: lockScreen.borderRadius * scale,
                border: `${0.5 * scale}px solid ${lockScreen.border}`,
                padding: `${lockScreen.padding.top * scale}px ${lockScreen.padding.horizontal * scale}px ${lockScreen.padding.bottom * scale}px`,
                display: "flex",
                alignItems: "center",
                gap: 12 * scale,
                transform: getTransformForItem(
                  animationState,
                  animationProgress,
                ),
                opacity: getOpacityForItem(animationState, animationProgress),
              }}
            >
              {ir.icon && (
                <div
                  style={{
                    width: icon.size * scale * 0.85,
                    height: icon.size * scale * 0.85,
                    borderRadius: icon.borderRadius * scale * 0.85,
                    backgroundImage: `url(${ir.icon})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: icon.shadow,
                    flexShrink: 0,
                  }}
                />
              )}

              {!ir.icon && (
                <div
                  style={{
                    width: icon.size * scale * 0.85,
                    height: icon.size * scale * 0.85,
                    borderRadius: icon.borderRadius * scale * 0.85,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: icon.shadow,
                    flexShrink: 0,
                    fontSize: 16 * scale,
                    color: "#fff",
                  }}
                >
                  {ir.appId?.charAt(0).toUpperCase() ?? "N"}
                </div>
              )}

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2 * scale,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8 * scale,
                  }}
                >
                  <span
                    style={{
                      fontSize: text.appName.fontSize * scale * 0.9,
                      fontWeight: text.appName.fontWeight,
                      color: text.appName.color,
                      opacity: text.appName.opacity,
                      textTransform: "uppercase",
                      letterSpacing: 0.5 * scale,
                    }}
                  >
                    {ir.appId}
                  </span>
                  <span
                    style={{
                      fontSize: text.timestamp.fontSize * scale,
                      fontWeight: text.timestamp.fontWeight,
                      color: text.timestamp.color,
                      opacity: text.timestamp.opacity,
                    }}
                  >
                    now
                  </span>
                </div>

                <div
                  style={{
                    fontSize: text.title.fontSize * scale * 0.95,
                    fontWeight: text.title.fontWeight,
                    color: text.title.color,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {ir.title}
                </div>

                <div
                  style={{
                    fontSize: text.body.fontSize * scale * 0.95,
                    fontWeight: text.body.fontWeight,
                    color: text.body.color,
                    opacity: text.body.opacity,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {ir.body}
                </div>
              </div>
            </div>
          );
        },
      )}

      {notifications.length > maxVisible && (
        <div
          style={{
            textAlign: "center",
            fontSize: 13 * scale,
            color: text.body.color,
            opacity: 0.6,
            paddingTop: 4 * scale,
          }}
        >
          +{notifications.length - maxVisible} more notifications
        </div>
      )}
    </div>
  );
};

export default IOSLockScreen;
