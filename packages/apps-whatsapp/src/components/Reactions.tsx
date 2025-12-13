/**
 * Reactions Component
 * 
 * Renders message reactions (emoji responses) like WhatsApp/iMessage.
 * Supports multiple reactions with counts.
 */

import React from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface Reaction {
    emoji: string;
    count: number;
    fromMe?: boolean;  // Highlight if user reacted
}

interface ReactionsBarProps {
    reactions: Reaction[];
    isMyMessage?: boolean;
    compact?: boolean;  // For smaller bubbles
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
        <div style={{
            display: "flex",
            justifyContent: isMyMessage ? "flex-end" : "flex-start",
            marginTop: -12,
            marginLeft: isMyMessage ? "auto" : 36,
            marginRight: isMyMessage ? 36 : "auto",
            position: "relative",
            zIndex: 1,
        }}>
            <div style={{
                display: "flex",
                gap: 6,
                backgroundColor: "#FFFFFF",
                padding: compact ? "6px 12px" : "9px 18px",
                borderRadius: 60,
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                border: "1px solid rgba(0,0,0,0.05)",
            }}>
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
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 3 : 6,
        backgroundColor: highlighted ? "rgba(37, 211, 102, 0.15)" : "transparent",
        padding: compact ? "3px 6px" : "3px 9px",
        borderRadius: 30,
    }}>
        <span style={{
            fontSize: compact ? 36 : 42,
            lineHeight: 1,
        }}>
            {emoji}
        </span>
        {count > 1 && (
            <span style={{
                fontSize: compact ? 27 : 33,
                color: "#667781",
                fontWeight: 500,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            }}>
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
        <div style={{
            display: "flex",
            gap: 12,
            backgroundColor: "#FFFFFF",
            padding: "18px 24px",
            borderRadius: 60,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}>
            {COMMON_REACTIONS.map((emoji) => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: 60,
                        cursor: "pointer",
                        padding: 12,
                        borderRadius: "50%",
                        transition: "transform 0.15s, background-color 0.15s",
                    }}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

export default ReactionsBar;
