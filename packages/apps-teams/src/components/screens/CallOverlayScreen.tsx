import React from "react";
import type { TeamsState } from "../../types/index.js";
import {
  callGridStyle,
  callHeroStyle,
  callSpeakerRingStyle,
  callSurfaceStyle,
  callTileStyle,
  callWaveBarStyle,
  callWaveformStyle,
  subtitleStyle,
  titleStyle,
} from "../../styles.js";
import { Avatar } from "../shared/Avatar.js";
import { CallControls } from "../shared/CallControls.js";

export const CallOverlayScreen: React.FC<{ state: TeamsState }> = ({ state }) => {
  const call = state.activeCallId ? state.calls[state.activeCallId] : undefined;
  const participants = (call?.participantIds ?? []).map((id) => ({
    id,
    name: state.users[id]?.displayName ?? id,
    presence: state.presence[id],
  }));

  return (
    <div style={callSurfaceStyle}>
      <div style={callHeroStyle}>
        <div style={titleStyle}>{call?.title ?? "Enterprise call"}</div>
        <div style={{ ...subtitleStyle, color: "rgba(255,255,255,0.78)", marginTop: 4 }}>
          {call?.status ?? "connecting"} • {participants.length} participants
        </div>
      </div>
      <div style={callGridStyle}>
        {participants.slice(0, 6).map((participant, index) => (
          <div key={participant.id} style={callTileStyle}>
            <div style={callSpeakerRingStyle(call?.dominantSpeakerId === participant.id)}>
              <Avatar name={participant.name} size={48} presence={participant.presence} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{participant.name}</div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.68,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span>
                {call?.dominantSpeakerId === participant.id
                  ? "Speaking"
                  : index === 2
                    ? "Raised hand"
                    : "Listening"}
              </span>
              <div style={callWaveformStyle(call?.dominantSpeakerId === participant.id)}>
                <span style={callWaveBarStyle(8, 0)} />
                <span style={callWaveBarStyle(12, 120)} />
                <span style={callWaveBarStyle(9, 240)} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <CallControls />
    </div>
  );
};
