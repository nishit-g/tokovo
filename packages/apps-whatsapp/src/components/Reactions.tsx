import React from "react";
import { useTheme } from "../theme/ThemeContext.js";

export interface Reaction {
  emoji: string;
  count: number;
  fromMe?: boolean;
}

interface ReactionsBarProps {
  reactions: Reaction[];
  isMyMessage?: boolean;
  compact?: boolean;
}

export const ReactionsBar: React.FC<ReactionsBarProps> = ({
  reactions,
  isMyMessage = false,
  compact = false,
}) => {
  const theme = useTheme();
  if (!reactions || reactions.length === 0) return null;

  const sorted = [...reactions].sort((a, b) => b.count - a.count);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMyMessage ? "flex-end" : "flex-start",
        marginTop: -4,
        marginLeft: isMyMessage ? "auto" : 12,
        marginRight: isMyMessage ? 12 : "auto",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 2,
          backgroundColor: theme.colors.background,
          padding: compact ? "2px 4px" : "3px 6px",
          borderRadius: 20,
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          border: `0.5px solid ${theme.colors.divider}`,
        }}
      >
        {sorted.map((reaction, i) => (
          <ReactionPill
            key={`${reaction.emoji}-${i}`}
            emoji={reaction.emoji}
            count={reaction.count}
            highlighted={reaction.fromMe}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
};

interface ReactionPillProps {
  emoji: string;
  count: number;
  highlighted?: boolean;
  compact?: boolean;
}

const ReactionPill: React.FC<ReactionPillProps> = ({
  emoji,
  count,
  highlighted = false,
  compact = false,
}) => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 1 : 2,
        backgroundColor: highlighted ? `${theme.colors.accent}22` : "transparent",
        padding: compact ? "1px 2px" : "1px 3px",
        borderRadius: 10,
      }}
    >
      <span
        style={{
          fontSize: compact ? 12 : 14,
          lineHeight: 1,
        }}
      >
        {emoji}
      </span>
      {count > 1 && (
        <span
          style={{
            fontSize: compact ? 9 : 11,
            color: theme.colors.timestamp,
            fontWeight: 500,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
};

export const COMMON_REACTIONS = ["❤️", "😂", "😮", "😢", "🙏", "👍"];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  visible?: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onSelect,
  visible = true,
}) => {
  const theme = useTheme();
  if (!visible) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        backgroundColor: theme.colors.background,
        padding: "6px 8px",
        borderRadius: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        border: `0.5px solid ${theme.colors.divider}`,
      }}
    >
      {COMMON_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          style={{
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            padding: 4,
            borderRadius: "50%",
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionsBar;
