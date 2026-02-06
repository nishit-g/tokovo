
import { Platform } from "./types.js";

/**
 * Configuration for built-in system apps/views
 */
export function getAppConfig(appId: string, platform: Platform = "ios") {
    if (appId === "homescreen") {
        if (platform === "ios") {
            return {
                // Layout
                gridColumns: 4,
                gridRows: 6,
                gridGapRow: 22,
                gridGapCol: 20,
                gridPaddingHorizontal: 24,
                gridPaddingTop: 66,

                // Icon
                iconSize: 60,
                iconRadius: 13,
                iconLabelSize: 12,
                iconLabelColor: "white",
                iconLabelGap: 5,

                // Dock
                dockHeight: 95,
                dockWidth: 390, // Nearly full width
                dockRadius: 36,
                dockBottom: 40,
                dockIconSize: 60,
                dockBackdrop: "rgba(255, 255, 255, 0.2)",
                dockBlur: "30px",

                // Folder
                folderBackdrop: "rgba(255, 255, 255, 0.2)",
                folderBlur: "20px",
                folderPreviewGap: 2,
                folderMiniIconRadius: 0.2,

                // Dots
                dotSize: 8,
                dotGap: 8,
                dotActiveColor: "white",
                dotInactiveColor: "rgba(255, 255, 255, 0.3)",
                dotMarginBottom: 30
            };
        } else {
            // Android style
            return {
                gridColumns: 5,
                gridRows: 6,
                gridGapRow: 15,
                gridGapCol: 10,
                gridPaddingHorizontal: 15,
                gridPaddingTop: 50,

                iconSize: 56,
                iconRadius: 28, // Round circle
                iconLabelSize: 12,
                iconLabelColor: "white",
                iconLabelGap: 4,

                dockHeight: 80,
                dockWidth: 380,
                dockRadius: 0,
                dockBottom: 20,
                dockIconSize: 56,
                dockBackdrop: "transparent",
                dockBlur: "0px",

                folderBackdrop: "rgba(255, 255, 255, 0.1)",
                folderBlur: "10px",
                folderPreviewGap: 1,
                folderMiniIconRadius: 0.5,

                dotSize: 6,
                dotGap: 6,
                dotActiveColor: "white",
                dotInactiveColor: "rgba(255, 255, 255, 0.3)",
                dotMarginBottom: 20
            };
        }
    }
    return {};
}
