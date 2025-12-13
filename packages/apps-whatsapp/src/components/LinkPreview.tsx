/**
 * Link Preview Component
 * 
 * Renders URL previews with image, title, and description.
 * Matches WhatsApp iOS styling.
 */

import React from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface LinkPreviewData {
    url: string;
    title: string;
    description?: string;
    image?: string;
    siteName?: string;
    favicon?: string;
}

interface LinkPreviewProps {
    preview: LinkPreviewData;
    isMyMessage?: boolean;
    compact?: boolean;
}

// =============================================================================
// LINK PREVIEW
// =============================================================================

/**
 * Renders a link preview card inside a message bubble.
 */
export const LinkPreview: React.FC<LinkPreviewProps> = ({
    preview,
    isMyMessage = false,
    compact = false,
}) => {
    const bgColor = isMyMessage ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.03)";

    return (
        <div style={{
            borderRadius: 24,
            overflow: "hidden",
            marginBottom: 12,
            backgroundColor: bgColor,
        }}>
            {/* Preview Image */}
            {preview.image && (
                <div style={{
                    width: "100%",
                    height: compact ? 240 : 360,
                    backgroundImage: `url(${preview.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }} />
            )}

            {/* Text Content */}
            <div style={{
                padding: compact ? "18px 24px" : "24px 30px",
            }}>
                {/* Site Name */}
                {preview.siteName && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 9,
                    }}>
                        {preview.favicon && (
                            <img
                                src={preview.favicon}
                                alt=""
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 6,
                                }}
                            />
                        )}
                        <span style={{
                            fontSize: 30,
                            color: "#8E8E93",
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                        }}>
                            {preview.siteName}
                        </span>
                    </div>
                )}

                {/* Title */}
                <div style={{
                    fontSize: compact ? 42 : 48,
                    fontWeight: 600,
                    color: "#111B21",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    lineHeight: 1.3,
                    marginBottom: 6,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                }}>
                    {preview.title}
                </div>

                {/* Description */}
                {preview.description && (
                    <div style={{
                        fontSize: compact ? 36 : 42,
                        color: "#667781",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical" as const,
                        overflow: "hidden",
                    }}>
                        {preview.description}
                    </div>
                )}

                {/* URL */}
                <div style={{
                    fontSize: 30,
                    color: "#25D366",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    marginTop: 12,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}>
                    {new URL(preview.url).hostname.replace("www.", "")}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// MINI LINK PREVIEW (for compact display)
// =============================================================================

export const MiniLinkPreview: React.FC<{ url: string }> = ({ url }) => {
    let hostname = "";
    try {
        hostname = new URL(url).hostname.replace("www.", "");
    } catch {
        hostname = url;
    }

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 18px",
            backgroundColor: "rgba(0,0,0,0.03)",
            borderRadius: 18,
            marginBottom: 9,
        }}>
            {/* Link icon */}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#25D366">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
            </svg>
            <span style={{
                fontSize: 36,
                color: "#25D366",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            }}>
                {hostname}
            </span>
        </div>
    );
};

export default LinkPreview;
