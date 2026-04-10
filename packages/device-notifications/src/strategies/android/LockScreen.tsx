import React from "react";
import { Img } from "remotion";
import type { NotificationLockScreenProps } from "../types.js";

export const AndroidLockScreen: React.FC<NotificationLockScreenProps> = ({
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
      const translateY = 20 * (1 - animationProgress);
      return `translateY(${translateY}px)`;
    }
    if (animationState === "exiting") {
      const scale = 1 - 0.1 * animationProgress;
      return `scale(${scale})`;
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
        top: 200 * scale,
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
                borderRadius: lockScreen.borderRadius * scale,
                boxShadow:
                  "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
                padding: `${lockScreen.padding.top * scale}px ${lockScreen.padding.horizontal * scale}px ${lockScreen.padding.bottom * scale}px`,
                display: "flex",
                alignItems: "center",
                gap: 14 * scale,
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
                    position: "relative",
                    width: icon.size * scale * 0.75,
                    height: icon.size * scale * 0.75,
                    borderRadius: icon.borderRadius * scale,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <Img
                    src={ir.icon}
                    alt=""
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              {!ir.icon && (
                <div
                  style={{
                    width: icon.size * scale * 0.75,
                    height: icon.size * scale * 0.75,
                    borderRadius: icon.borderRadius * scale,
                    background:
                      "linear-gradient(135deg, #4285f4 0%, #34a853 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 14 * scale,
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
                      fontSize: text.appName.fontSize * scale,
                      fontWeight: text.appName.fontWeight,
                      color: text.appName.color,
                      opacity: text.appName.opacity,
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
                    fontSize: text.title.fontSize * scale,
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
                    fontSize: text.body.fontSize * scale,
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
            fontSize: 12 * scale,
            color: text.body.color,
            opacity: 0.6,
            paddingTop: 4 * scale,
          }}
        >
          +{notifications.length - maxVisible} more
        </div>
      )}
    </div>
  );
};

export default AndroidLockScreen;
