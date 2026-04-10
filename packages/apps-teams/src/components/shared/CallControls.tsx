import React from "react";
import { callControlStyle, callControlsWrapStyle } from "../../styles.js";
import { MicIcon, PhoneIcon, VideoIcon } from "./Icons.js";

export const CallControls: React.FC = () => (
  <div style={callControlsWrapStyle}>
    <div style={callControlStyle()}>
      <MicIcon size={18} color="var(--teams-text-inverse)" />
      <span>Mute</span>
    </div>
    <div style={callControlStyle()}>
      <VideoIcon size={18} color="var(--teams-text-inverse)" />
      <span>Camera</span>
    </div>
    <div style={callControlStyle()}>
      <PhoneIcon size={18} color="var(--teams-text-inverse)" />
      <span>Transfer</span>
    </div>
    <div style={callControlStyle(true)}>
      <PhoneIcon size={18} color="var(--teams-text-inverse)" />
      <span>End</span>
    </div>
  </div>
);
