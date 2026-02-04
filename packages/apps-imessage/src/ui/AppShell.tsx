/**
 * iMessage App Shell
 * 
 * Root layout wrapper that provides:
 * - Safe area insets from device context
 * - Theme colors from context
 * - Consistent layout structure
 */
import React from "react";
import { useSafeAreaInsets } from "@tokovo/react";
import { useIMessageTheme } from "./ThemeContext";
import { injectIMessageStyles } from "../styles";

interface AppShellProps {
    children: React.ReactNode;
    /** Override safe area for manual control */
    overrideSafeArea?: {
        top?: number;
        bottom?: number;
    };
}

export const AppShell: React.FC<AppShellProps> = ({ children, overrideSafeArea }) => {
    const theme = useIMessageTheme();
    const safeArea = useSafeAreaInsets();

    React.useEffect(() => {
        injectIMessageStyles();
    }, []);

    const topInset = overrideSafeArea?.top ?? safeArea.top;
    const bottomInset = overrideSafeArea?.bottom ?? safeArea.bottom;

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: theme.colors.system.background,
                color: theme.colors.header.title,
                fontFamily: theme.typography.message.family,
                paddingTop: topInset,
                paddingBottom: bottomInset,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {children}
        </div>
    );
};
