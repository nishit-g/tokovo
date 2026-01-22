/**
 * Reactions Component
 *
 * Renders message reactions (emoji responses) like WhatsApp/iMessage.
 * Supports multiple reactions with counts.
 *
 * NOTE: Uses 1x logical pixels (matches iOS components)
 */

import React from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface Reaction {
  emoji: string;
  count: number;
  fromMe?: boolean; // Highlight if user reacted
}

interface ReactionsBarProps {
  reactions: Reaction[];
  isMyMessage?: boolean;
  compact?: boolean; // For smaller bubbles
}

// =============================================================================
// REACTIONS BAR
// =============================================================================

/**
 * Displays reactions below a message bubble.
 * Appears as a small pill with emoji and counts.
 */
export const ReactionsBar: React.FC<ReactionsBarProps> = ({
  reactions,
  isMyMessage = false,
  compact = false,
}) => {
  if (!reactions || reactions.length === 0) return null;

  // Sort by count descending
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
          backgroundColor: "#FFFFFF",
          padding: compact ? "2px 4px" : "3px 6px",
          borderRadius: 20,
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          border: "0.5px solid rgba(0,0,0,0.08)",
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

// =============================================================================
// REACTION PILL
// =============================================================================

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
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: compact ? 1 : 2,
      backgroundColor: highlighted ? "rgba(37, 211, 102, 0.15)" : "transparent",
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
          color: "#667781",
          fontWeight: 500,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
        }}
      >
        {count}
      </span>
    )}
  </div>
);

// =============================================================================
// REACTION PICKER (FOR FUTURE USE)
// =============================================================================

export const COMMON_REACTIONS = ["❤️", "😂", "😮", "😢", "🙏", "👍"];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  visible?: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onSelect,
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        backgroundColor: "#FFFFFF",
        padding: "6px 8px",
        borderRadius: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
