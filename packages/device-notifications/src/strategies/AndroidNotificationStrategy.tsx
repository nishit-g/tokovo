import React from "react";
import { AppMetadataRegistry, NotificationViewRegistry } from "@tokovo/core";
import type { NotificationInstance } from "../types";

interface NotificationStrategyProps {
  notification: NotificationInstance;
}

export const AndroidNotificationStrategy: React.FC<
  NotificationStrategyProps
> = ({ notification }) => {
  // Use flat notification structure - no more ir fallback
  const appMeta = AppMetadataRegistry.get(notification.appId);

  // Check registry for custom view (App Content)
  const CustomView = NotificationViewRegistry.get(notification.appId);

  return (
    <div
      style={{
        backgroundColor: "rgba(30, 30, 30, 0.95)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderRadius: 28,
        padding: "20px 24px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        color: "white",
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      {/* STANDARD ANDROID HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        {/* App Icon */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 99,
            background: appMeta.themeColor,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 18,
            color: "white",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {appMeta.icon}
        </div>

        <span
          style={{
            fontSize: 24,
            fontWeight: 500,
            opacity: 0.8,
          }}
        >
          {appMeta.displayName || "APP"}
        </span>

        <span style={{ marginLeft: "auto", fontSize: 24, opacity: 0.6 }}>
          • now
        </span>
      </div>

      {/* APP CONTENT LAYER */}
      <div style={{ width: "100%" }}>
        {CustomView ? (
          <CustomView notification={notification} isExpanded={true} />
        ) : (
          // SMART CONTENT RENDERER
          (() => {
            const hasCustomIcon = !!notification.icon;
            const isEmoji =
              hasCustomIcon && /^\p{Emoji}/u.test(notification.icon || "");

            if (hasCustomIcon) {
              return (
                <div
                  style={{
                    display: "flex",
                    gap: 15,
                    alignItems: "center",
                    width: "100%",
                    marginTop: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontSize: 32, fontWeight: 600 }}>
                      {notification.title}
                    </div>
                    <div style={{ fontSize: 30, opacity: 0.9 }}>
                      {notification.body}
                    </div>
                  </div>

                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: "#444",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      overflow: "hidden",
                    }}
                  >
                    {isEmoji ? (
                      notification.icon
                    ) : (
                      <span
                        style={{ color: "#ccc", fontSize: 20, fontWeight: 600 }}
                      >
                        {notification.title.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Standard Layout
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ fontSize: 32, fontWeight: 600 }}>
                  {notification.title}
                </div>
                <div style={{ fontSize: 30, opacity: 0.9 }}>
                  {notification.body}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};
