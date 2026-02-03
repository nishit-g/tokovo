import React, { useState } from "react";

export interface MediaViewerProps {
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  senderName?: string;
  timestamp?: string;
  onClose?: () => void;
  width?: number;
  height?: number;
}

const VIEWER_COLORS = {
  background: "#000000",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  iconColor: "#FFFFFF",
  controlsBg: "rgba(0, 0, 0, 0.4)",
};

export const MediaViewer: React.FC<MediaViewerProps> = ({
  mediaUrl,
  mediaType,
  caption,
  senderName,
  timestamp,
  onClose,
  width: _width = 393,
  height: _height = 852,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleToggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: VIEWER_COLORS.background,
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
      }}
      onClick={handleToggleControls}
    >
      {showControls && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "60px 16px 16px",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                padding: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={VIEWER_COLORS.iconColor}
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>

            <div>
              {senderName && (
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: "500",
                    color: VIEWER_COLORS.textPrimary,
                    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {senderName}
                </div>
              )}
              {timestamp && (
                <div
                  style={{
                    fontSize: 13,
                    color: VIEWER_COLORS.textSecondary,
                    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {timestamp}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              style={{
                background: "none",
                border: "none",
                padding: 8,
                cursor: "pointer",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={VIEWER_COLORS.iconColor}
              >
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
              </svg>
            </button>

            <button
              style={{
                background: "none",
                border: "none",
                padding: 8,
                cursor: "pointer",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={VIEWER_COLORS.iconColor}
              >
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {mediaType === "image" ? (
          <img
            src={mediaUrl}
            alt=""
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <video
              src={mediaUrl}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
              playsInline
              autoPlay={isPlaying}
            />

            {!isPlaying && showControls && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
                style={{
                  position: "absolute",
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: VIEWER_COLORS.controlsBg,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill={VIEWER_COLORS.iconColor}
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {showControls && caption && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "40px 16px 40px",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              fontSize: 15,
              color: VIEWER_COLORS.textPrimary,
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              lineHeight: 1.4,
            }}
          >
            {caption}
          </div>
        </div>
      )}

      {mediaType === "video" && showControls && (
        <div
          style={{
            position: "absolute",
            bottom: caption ? 100 : 40,
            left: 16,
            right: 16,
            height: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handlePlayPause}
            style={{
              background: "none",
              border: "none",
              padding: 4,
              cursor: "pointer",
            }}
          >
            {isPlaying ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={VIEWER_COLORS.iconColor}
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={VIEWER_COLORS.iconColor}
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div
            style={{
              flex: 1,
              height: 3,
              backgroundColor: "rgba(255,255,255,0.3)",
              borderRadius: 2,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: "30%",
                backgroundColor: VIEWER_COLORS.iconColor,
                borderRadius: 2,
              }}
            />
          </div>

          <span
            style={{
              fontSize: 13,
              color: VIEWER_COLORS.textSecondary,
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              minWidth: 80,
              textAlign: "right",
            }}
          >
            0:00 / 0:00
          </span>
        </div>
      )}
    </div>
  );
};

export default MediaViewer;
