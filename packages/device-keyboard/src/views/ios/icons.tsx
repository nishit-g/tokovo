/**
 * iOS Keyboard Icons
 */

import React from "react";

export const ShiftIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4L4 16H8V20H16V16H20L12 4Z" />
    </svg>
);

export const BackspaceIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 2H10L2 12L10 22H22V2Z" vectorEffect="non-scaling-stroke" />
        <line x1="12" y1="8" x2="18" y2="16" vectorEffect="non-scaling-stroke" />
        <line x1="12" y1="16" x2="18" y2="8" vectorEffect="non-scaling-stroke" />
    </svg>
);

export const GlobeIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" vectorEffect="non-scaling-stroke" />
        <line x1="2" y1="12" x2="22" y2="12" vectorEffect="non-scaling-stroke" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" vectorEffect="non-scaling-stroke" />
    </svg>
);

export const EmojiIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" vectorEffect="non-scaling-stroke" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" vectorEffect="non-scaling-stroke" />
        <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
);

export const MicIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" vectorEffect="non-scaling-stroke" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" vectorEffect="non-scaling-stroke" />
        <line x1="12" y1="19" x2="12" y2="23" vectorEffect="non-scaling-stroke" />
        <line x1="8" y1="23" x2="16" y2="23" vectorEffect="non-scaling-stroke" />
    </svg>
);

export const ReturnIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="9 10 4 15 9 20" vectorEffect="non-scaling-stroke" />
        <path d="M20 4v7a4 4 0 0 1-4 4H4" vectorEffect="non-scaling-stroke" />
    </svg>
);

export const SearchIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" vectorEffect="non-scaling-stroke" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" vectorEffect="non-scaling-stroke" />
    </svg>
);

export function renderKeyIcon(key: string, style?: React.CSSProperties): React.ReactNode {
    switch (key) {
        case "⇧":
            return <ShiftIcon style={style} />;
        case "⌫":
        case "Backspace":
            return <BackspaceIcon style={style} />;
        case "🌐":
            return <GlobeIcon style={style} />;
        case "return":
            return null; // Text label
        default:
            return null;
    }
}
