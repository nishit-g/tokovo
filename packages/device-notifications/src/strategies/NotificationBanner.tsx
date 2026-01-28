import React, { useMemo } from "react";
import { spring, interpolate } from "remotion";
import type { NotificationBannerProps } from "./types";
import { useNotificationAnimation } from "../hooks/useNotificationAnimation";

const STACK_SHIFT_DURATION = 8;

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  animationState,
  animationProgress,
  tokens,
  scale,
  currentFrame,
  fps = 30,
  stackIndex = 0,
  stackOffset = 0,
  stackIndexChangedAtFrame,
  previousStackOffset,
  renderIcon,
  renderActions,
  renderCustomContent,
  onTap,
  onSwipe,
  onDismiss,
}) => {
  const { ir } = notification;
  const { banner, icon, text, typography, animation, platform } = tokens;

  const baseTop = banner.margin.top * scale;

  const animationValues = useNotificationAnimation(
    animationState,
    animationProgress,
    tokens,
    { stackIndex, stackOffset },
  );

  const animatedStackOffset = useMemo(() => {
    if (
      previousStackOffset === undefined ||
      stackIndexChangedAtFrame === undefined ||
      previousStackOffset === stackOffset
    ) {
      return stackOffset;
    }

    const framesSinceChange = currentFrame - stackIndexChangedAtFrame;
    if (framesSinceChange >= STACK_SHIFT_DURATION) {
      return stackOffset;
    }

    const shiftProgress = spring({
      frame: framesSinceChange,
      fps,
      config: { damping: 20, stiffness: 300 },
      durationInFrames: STACK_SHIFT_DURATION,
    });

    return interpolate(
      shiftProgress,
      [0, 1],
      [previousStackOffset, stackOffset],
    );
  }, [
    currentFrame,
    fps,
    stackOffset,
    previousStackOffset,
    stackIndexChangedAtFrame,
  ]);

  const containerStyle = useMemo((): React.CSSProperties => {
    const totalTranslateY =
      animationValues.translateY + animatedStackOffset * scale;

    return {
      position: "absolute",
      top: baseTop,
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
      alignItems: platform === "ios" ? "center" : "flex-start",
      gap: banner.gap * scale,
      transform: `translate3d(0, ${totalTranslateY}px, 0) scale(${animationValues.scale})`,
      opacity: animationValues.opacity,
      willChange: "transform, opacity",
      zIndex: 9999 - stackIndex,
      fontFamily: typography.fontFamily,
      overflow: "hidden",
      cursor: onTap ? "pointer" : "default",
    };
  }, [
    animationValues.translateY,
    animationValues.scale,
    animationValues.opacity,
    animatedStackOffset,
    stackIndex,
    scale,
    baseTop,
    banner,
    platform,
    typography.fontFamily,
    onTap,
  ]);

  const defaultGradient =
    platform === "ios"
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "linear-gradient(135deg, #4285f4 0%, #34a853 100%)";

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
        background: defaultGradient,
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

  const contentGap = platform === "ios" ? 2 : 4;

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-label={`Notification from ${ir.appId || "Notification"}: ${ir.title || ""}`}
      onClick={() => onTap?.(notification)}
      style={containerStyle}
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
            gap: contentGap * scale,
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

export default NotificationBanner;
