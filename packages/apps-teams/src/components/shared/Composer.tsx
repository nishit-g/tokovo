import React from "react";
import { useFps, useTime } from "@tokovo/react";
import {
  composerActionsRowStyle,
  composerCursorStyle,
  composerInnerStyle,
  composerInputStyle,
  composerSendButtonStyle,
  composerToolStyle,
  composerToolbarStyle,
  composerWrapStyle,
  typingDotsStyle,
  typingDotStyle,
  typingStripStyle,
} from "../../styles.js";
import {
  AttachIcon,
  BoldIcon,
  CameraIcon,
  FileIcon,
  ImageIcon,
  ItalicIcon,
  ListIcon,
  LocationIcon,
  MicIcon,
  SendIcon,
  SmileIcon,
} from "./Icons.js";

export const Composer: React.FC<{
  text: string;
  typingLabel?: string;
  liveTyping?: boolean;
  direction?: "ltr" | "rtl";
  language?: string;
}> = ({ text, typingLabel, liveTyping = false, direction, language }) => {
  const frame = useTime();
  const fps = useFps();
  return (
    <div style={composerWrapStyle}>
      {typingLabel ? (
        <div style={{ marginBottom: 10 }}>
          <div style={typingStripStyle}>
            <div style={typingDotsStyle}>
              <span style={typingDotStyle(0, frame, fps)} />
              <span style={typingDotStyle(120, frame, fps)} />
              <span style={typingDotStyle(240, frame, fps)} />
            </div>
            {typingLabel}
          </div>
        </div>
      ) : null}
      <div className="tokovo-teams-scrollbar" style={composerToolbarStyle}>
        <div style={composerToolStyle(true)}>
          <BoldIcon size={14} color="currentColor" />
        </div>
        <div style={composerToolStyle()}>
          <ItalicIcon size={14} color="currentColor" />
        </div>
        <div style={composerToolStyle()}>
          <ListIcon size={14} color="currentColor" />
        </div>
      </div>
      <div style={composerInnerStyle}>
        <AttachIcon size={18} color="var(--teams-text-secondary)" />
        <div
          dir={direction}
          lang={language}
          style={composerInputStyle(text.length > 0)}
        >
          {text.length > 0 ? text : "Draft a response"}
          {liveTyping ? <span style={composerCursorStyle(frame, fps)} /> : null}
        </div>
        <SmileIcon size={18} color="var(--teams-text-secondary)" />
        {text.length > 0 ? (
          <div style={composerSendButtonStyle}>
            <SendIcon size={15} color="currentColor" />
          </div>
        ) : (
          <MicIcon size={18} color="var(--teams-text-secondary)" />
        )}
      </div>
      <div className="tokovo-teams-scrollbar" style={composerActionsRowStyle}>
        <CameraIcon size={18} color="currentColor" />
        <ImageIcon size={18} color="currentColor" />
        <LocationIcon size={18} color="currentColor" />
        <FileIcon size={18} color="currentColor" />
        <span style={{ fontSize: 12, fontWeight: 700 }}>Loop</span>
      </div>
    </div>
  );
};
