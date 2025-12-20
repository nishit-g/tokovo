/**
 * Instagram Header (iOS)
 * 
 * Top bar with Instagram logo and action icons.
 */

import React from "react";
import { instagramTheme } from "../../config/theme";

interface HeaderProps {
    onMessengerPress?: () => void;
}

// Instagram logo as SVG path
const InstagramLogo = () => (
    <svg height="29" viewBox="0 0 103 29" fill="currentColor">
        <path d="M52.8 12.8c-3.5 0-5.7 2.6-5.7 6.4 0 3.8 2.1 6.4 5.7 6.4 3.5 0 5.7-2.6 5.7-6.4 0-3.8-2.2-6.4-5.7-6.4zm0 10.3c-2 0-3.1-1.6-3.1-3.9 0-2.3 1.1-3.9 3.1-3.9 2 0 3.1 1.6 3.1 3.9 0 2.3-1.1 3.9-3.1 3.9zM31.4 12.8c-3.5 0-5.7 2.6-5.7 6.4 0 3.8 2.2 6.4 5.7 6.4s5.7-2.6 5.7-6.4c0-3.8-2.2-6.4-5.7-6.4zm0 10.3c-2 0-3.1-1.6-3.1-3.9 0-2.3 1.1-3.9 3.1-3.9 2 0 3.1 1.6 3.1 3.9 0 2.3-1.1 3.9-3.1 3.9zM1.3 6.5H4v18.2H1.3zM6.3 13.2h2.5v1.7h.1c.7-1.2 2-2.1 3.9-2.1 2.8 0 4.6 1.5 4.6 4.8v7.1h-2.7v-6.6c0-1.9-.9-2.8-2.5-2.8-1.7 0-3.2 1.1-3.2 3.2v6.2H6.3V13.2zM19.6 21.3h2.7c.2 1.3 1.2 2.1 2.8 2.1s2.5-.7 2.5-1.7c0-1.1-.9-1.5-2.2-1.8l-1.8-.4c-2.4-.5-3.9-1.5-3.9-3.7 0-2.4 2-4 4.9-4 3.5 0 5.1 1.8 5.3 3.9h-2.6c-.2-1-1-1.7-2.6-1.7-1.4 0-2.3.6-2.3 1.5 0 .9.7 1.3 1.9 1.6l1.8.4c2.6.6 4.2 1.6 4.2 3.9 0 2.6-2.2 4.2-5.3 4.2-3.4 0-5.4-1.8-5.4-4.3zM41.6 13.2v1.6h.1c.8-1.3 2.1-2 3.7-2 1.6 0 3 .8 3.6 2.2.8-1.3 2.4-2.2 4.1-2.2 2.7 0 4.4 1.6 4.4 4.4v7.5h-2.7v-6.8c0-1.6-.8-2.6-2.4-2.6-1.6 0-2.9 1.1-2.9 3v6.4h-2.7v-6.8c0-1.6-.8-2.6-2.3-2.6-1.6 0-2.9 1.1-2.9 3v6.4h-2.7V13.2h2.7zM59.4 19.2c0-3.8 2.3-6.4 5.8-6.4 3.6 0 5.5 2.5 5.5 5.8v1h-8.6c.2 2.2 1.3 3.5 3.4 3.5 1.5 0 2.5-.7 2.9-1.8h2.6c-.6 2.4-2.6 4-5.5 4-3.7 0-6.1-2.6-6.1-6.1zm2.8-1.1h5.8c-.1-1.9-1.2-3-2.9-3-1.7 0-2.7 1.1-2.9 3zM74.2 6.5h2.7v18.2h-2.7zM94.4 19.2c0-3.8 2.3-6.4 5.8-6.4 3.6 0 5.5 2.5 5.5 5.8v1h-8.6c.2 2.2 1.3 3.5 3.4 3.5 1.5 0 2.5-.7 2.9-1.8h2.6c-.6 2.4-2.6 4-5.5 4-3.7 0-6.1-2.6-6.1-6.1zm2.8-1.1h5.8c-.1-1.9-1.2-3-2.9-3-1.7 0-2.7 1.1-2.9 3zM78.8 13.2h2.5v1.7h.1c.7-1.2 2-2.1 3.9-2.1 2.8 0 4.6 1.5 4.6 4.8v7.1H87v-6.6c0-1.9-.9-2.8-2.5-2.8-1.7 0-3.2 1.1-3.2 3.2v6.2h-2.7l.2-11.5z" />
    </svg>
);

// Heart icon (notifications)
const HeartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

// Messenger icon
const MessengerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

export const Header: React.FC<HeaderProps> = ({ onMessengerPress }) => {
    const theme = instagramTheme;

    return (
        <div
            data-anchor="header"
            style={{
                height: theme.spacing.headerHeight,
                backgroundColor: theme.colors.background,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: theme.spacing.screenPadding,
                paddingRight: theme.spacing.screenPadding,
                borderBottom: `1px solid ${theme.colors.divider}`,
            }}
        >
            {/* Logo */}
            <div style={{ color: theme.colors.textPrimary }}>
                <InstagramLogo />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 20 }}>
                <div style={{ color: theme.colors.icon, cursor: "pointer" }}>
                    <HeartIcon />
                </div>
                <div
                    style={{ color: theme.colors.icon, cursor: "pointer" }}
                    onClick={onMessengerPress}
                >
                    <MessengerIcon />
                </div>
            </div>
        </div>
    );
};
