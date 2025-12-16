
import React from "react";

interface AppSurfaceProps {
    children: React.ReactNode;
    /** Scale factor (e.g. 3 for iPhone 16 Retina) */
    scale?: number;
    /** Logical width of the surface (e.g. 393 for iPhone 16) */
    width?: number | string;
    style?: React.CSSProperties;
    className?: string; // Add className prop
}

/**
 * AppSurface
 * 
 * A centralized wrapper that scales its content to match physical device pixels
 * while allowing development in standard logical pixels (CSS points).
 * 
 * Example:
 * <AppSurface scale={3}>
 *    <div style={{ fontSize: 16 }}>Hello</div> // Renders at 48px physical
 * </AppSurface>
 */
export const AppSurface: React.FC<AppSurfaceProps> = ({
    children,
    scale = 3,
    width = "100%",
    style,
    className
}) => {
    return (
        <div
            className={className}
            style={{
                width: width,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                // Ensure the container doesn't collapse or behave weirdly
                // We might need to override width/height on the parent to match the scaled dimensions
                ...style
            }}
        >
            {children}
        </div>
    );
};
