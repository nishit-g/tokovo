import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export interface InputAreaProps {
  text: string;
  showCursor: boolean;
  safeAreaBottom: number;
}

export const InputArea: React.FC<InputAreaProps> = ({
  text,
  showCursor,
  safeAreaBottom,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cursorVisible = Math.floor(frame / (fps * 0.5)) % 2 === 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        padding: `6px 6px ${6 + safeAreaBottom}px 6px`,
        backgroundColor: "#0B141A",
      }}
    >
      {/* Input Container */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#1F2C34",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          padding: "8px 8px 8px 16px",
          minHeight: 44,
        }}
      >
        {/* Emoji Button */}
        <div
          style={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#8696A0" strokeWidth="1.5" />
            <circle cx="8" cy="10" r="1.5" fill="#8696A0" />
            <circle cx="16" cy="10" r="1.5" fill="#8696A0" />
            <path
              d="M8 14s1.5 2 4 2 4-2 4-2"
              stroke="#8696A0"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Text Input */}
        <div
          style={{
            flex: 1,
            fontSize: 16,
            color: text ? "#E9EDEF" : "#8696A0",
            fontFamily: "Roboto, sans-serif",
            wordBreak: "break-word",
          }}
        >
          {text || "Message"}
          {showCursor && cursorVisible && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 20,
                backgroundColor: "#00A884",
                marginLeft: 1,
              }}
            />
          )}
        </div>

        {/* Attachment */}
        <div
          style={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 8,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
              stroke="#8696A0"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Camera (when no text) */}
        {!text && (
          <div
            style={{
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 8,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                stroke="#8696A0"
                strokeWidth="1.5"
              />
              <circle
                cx="12"
                cy="13"
                r="4"
                stroke="#8696A0"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Send/Voice Button */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: "#00A884",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {text ? (
          // Send Icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="white" />
          </svg>
        ) : (
          // Mic Icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
              fill="white"
            />
            <path
              d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
              fill="white"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default InputArea;
