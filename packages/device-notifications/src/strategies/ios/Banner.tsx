import React from "react";
import type { NotificationBannerProps } from "../types";
import { useNotificationAnimation } from "../../hooks/useNotificationAnimation";

export const IOSBanner: React.FC<NotificationBannerProps> = ({
  notification,
  animationState,
  animationProgress,
  tokens,
  scale,
  fps = 30,
  stackIndex = 0,
  stackOffset = 0,
  renderIcon,
  renderActions,
  renderCustomContent,
  onTap,
  onSwipe: _onSwipe,
  onDismiss: _onDismiss,
}) => {
  const { ir } = notification;
  const { banner, icon, text, typography, animation } = tokens;

  const durationSeconds = animation.enterDuration / fps;

  const baseTop = banner.margin.top * scale;
  const stackedTop = baseTop + stackOffset * scale;

  const animationValues = useNotificationAnimation(
    animationState,
    animationProgress,
    tokens,
    { stackIndex, stackOffset },
  );

  const getTransform = (): string => {
    const translateY = animationValues.translateY;
    return `translateY(${translateY}px) scale(${animationValues.scale})`;
  };

  const defaultIconRender = ir.icon ? (
    <div
      style={{
        width: icon.size * scale,
        height: icon.size * scale,
        borderRadius: icon.borderRadius * scale,
        backgroundImage: `url(${ir.icon})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: icon.shadow,
        flexShrink: 0,
      }}
    />
  ) : (
    <div
      style={{
        width: icon.size * scale,
        height: icon.size * scale,
        borderRadius: icon.borderRadius * scale,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: icon.shadow,
        flexShrink: 0,
        fontSize: 20 * scale,
        color: "#fff",
      }}
    >
      {ir.appId?.charAt(0).toUpperCase() ?? "N"}
    </div>
  );

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-label={`Notification from ${ir.appId || "Notification"}: ${ir.title || ""}`}
      onClick={() => onTap?.(notification)}
      style={{
        position: "absolute",
        top: stackedTop,
        left: banner.margin.horizontal * scale,
        right: banner.margin.horizontal * scale,
        height: banner.height * scale,
        background: banner.background,
        backdropFilter: banner.backgroundBlur,
        WebkitBackdropFilter: banner.backgroundBlur,
        borderRadius: banner.borderRadius * scale,
        border: `${0.5 * scale}px solid ${banner.border}`,
        boxShadow: banner.shadow,
        padding: `${banner.padding.top * scale}px ${banner.padding.horizontal * scale}px ${banner.padding.bottom * scale}px`,
        display: "flex",
        alignItems: "center",
        gap: banner.gap * scale,
        transform: getTransform(),
        opacity: animationValues.opacity,
        transition: `transform ${durationSeconds}s ${animation.curve}, opacity ${durationSeconds}s ${animation.curve}`,
        zIndex: 9999 - stackIndex,
        fontFamily: typography.fontFamily,
        overflow: "hidden",
        cursor: onTap ? "pointer" : "default",
      }}
    >
      {renderIcon ? renderIcon(notification, tokens) : defaultIconRender}

      {renderCustomContent ? (
        renderCustomContent(notification, tokens)
      ) : (
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
              display: "-webkit-box",
              WebkitLineClamp: text.body.maxLines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
            }}
          >
            {ir.body}
          </div>
        </div>
      )}

      {renderActions && renderActions(notification, tokens)}
    </div>
  );
};

export default IOSBanner;
