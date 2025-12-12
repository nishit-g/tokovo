import React from "react";
import { HomeScreenConfig, AppIcon, AppFolder } from "@tokovo/core";

// ============================================================================
// APP ICON COMPONENT
// ============================================================================

interface AppIconItemProps {
    app: AppIcon;
    size?: number;
}

const AppIconItem: React.FC<AppIconItemProps> = ({ app, size = 180 }) => {
    const isEmoji = /^\p{Emoji}/u.test(app.icon);
    const iconSize = size * 0.75;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: size,
            gap: 12
        }}>
            {/* Icon */}
            <div style={{
                width: iconSize,
                height: iconSize,
                borderRadius: iconSize * 0.22,
                position: "relative",
                backgroundColor: isEmoji ? "rgba(255,255,255,0.15)" : "#333",
                backgroundImage: !isEmoji ? `url(${app.icon})` : undefined,
                backgroundSize: "cover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                {isEmoji && (
                    <span style={{ fontSize: iconSize * 0.5 }}>{app.icon}</span>
                )}

                {/* Badge */}
                {app.badge && app.badge > 0 && (
                    <div style={{
                        position: "absolute",
                        top: -12,
                        right: -12,
                        minWidth: 54,
                        height: 54,
                        borderRadius: 27,
                        backgroundColor: "#FF3B30",
                        color: "white",
                        fontSize: 33,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 15px",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                    }}>
                        {app.badge > 99 ? "99+" : app.badge}
                    </div>
                )}
            </div>

            {/* Label */}
            <span style={{
                fontSize: 33,
                color: "white",
                textAlign: "center",
                maxWidth: size,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
            }}>
                {app.label}
            </span>
        </div>
    );
};

// ============================================================================
// FOLDER COMPONENT
// ============================================================================

interface FolderItemProps {
    folder: AppFolder;
    size?: number;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, size = 180 }) => {
    const iconSize = size * 0.75;
    const miniSize = (iconSize - 30) / 3;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: size,
            gap: 12
        }}>
            {/* Folder icon with mini app previews */}
            <div style={{
                width: iconSize,
                height: iconSize,
                borderRadius: iconSize * 0.22,
                backgroundColor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(30px)",
                display: "grid",
                gridTemplateColumns: `repeat(3, ${miniSize}px)`,
                gridTemplateRows: `repeat(3, ${miniSize}px)`,
                gap: 9,
                padding: 15
            }}>
                {folder.apps.slice(0, 9).map((app, i) => (
                    <div key={i} style={{
                        width: miniSize,
                        height: miniSize,
                        borderRadius: miniSize * 0.2,
                        backgroundColor: "rgba(255,255,255,0.3)",
                        backgroundImage: !/^\p{Emoji}/u.test(app.icon) ? `url(${app.icon})` : undefined,
                        backgroundSize: "cover",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: miniSize * 0.6
                    }}>
                        {/^\p{Emoji}/u.test(app.icon) && app.icon}
                    </div>
                ))}
            </div>

            {/* Label */}
            <span style={{
                fontSize: 33,
                color: "white",
                textAlign: "center"
            }}>
                {folder.name}
            </span>
        </div>
    );
};

// ============================================================================
// DOCK COMPONENT
// ============================================================================

interface DockProps {
    apps: AppIcon[];
}

const Dock: React.FC<DockProps> = ({ apps }) => (
    <div style={{
        position: "absolute",
        bottom: 60,
        left: "50%",
        transform: "translateX(-50%)",
        width: "92%",
        height: 270,
        borderRadius: 90,
        backgroundColor: "rgba(255,255,255,0.2)",
        backdropFilter: "blur(60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 30px"
    }}>
        {apps.slice(0, 4).map((app, i) => (
            <AppIconItem key={i} app={app} size={150} />
        ))}
    </div>
);

// ============================================================================
// PAGE DOTS
// ============================================================================

interface PageDotsProps {
    count: number;
    activeIndex: number;
}

const PageDots: React.FC<PageDotsProps> = ({ count, activeIndex }) => (
    <div style={{
        display: "flex",
        gap: 18,
        marginBottom: 30
    }}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{
                width: 21,
                height: 21,
                borderRadius: "50%",
                backgroundColor: i === activeIndex ? "white" : "rgba(255,255,255,0.4)"
            }} />
        ))}
    </div>
);

// ============================================================================
// HOME SCREEN VIEW
// ============================================================================

interface HomeScreenViewProps {
    config: HomeScreenConfig;
    variant?: "ios" | "android";
    activePage?: number;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
    config,
    variant = "ios",
    activePage = 0
}) => {
    const currentPage = config.pages[activePage] || config.pages[0];
    const wallpaper = config.wallpaper || "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";

    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: wallpaper.startsWith("http") ? `url(${wallpaper}) center/cover` : wallpaper,
            display: "flex",
            flexDirection: "column",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
        }}>
            {/* App Grid */}
            <div style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gridTemplateRows: "repeat(6, auto)",
                gap: "36px 0",
                padding: "240px 30px 0",
                justifyItems: "center",
                overflow: "hidden"
            }}>
                {currentPage?.apps.map((item, i) => (
                    'type' in item && item.type === "folder"
                        ? <FolderItem key={i} folder={item} />
                        : <AppIconItem key={i} app={item as AppIcon} />
                ))}
            </div>

            {/* Page Dots */}
            <div style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 12
            }}>
                <PageDots count={config.pages.length} activeIndex={activePage} />
            </div>

            {/* Dock */}
            <Dock apps={config.dock} />

            {/* Home Indicator */}
            <div style={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                width: 405,
                height: 15,
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                borderRadius: 15
            }} />
        </div>
    );
};
