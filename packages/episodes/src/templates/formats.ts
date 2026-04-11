/**
 * Video Format Templates
 * 
 * Predefined video formats for common use cases.
 * 
 * @see docs/architecture/episodes.md
 */

// =============================================================================
// FORMAT DEFINITIONS
// =============================================================================

export interface VideoFormat {
    width: number;
    height: number;
    fps: number;
    name: string;
}

/**
 * Predefined video formats.
 */
export const FORMATS = {
    // === PORTRAIT (TikTok, Reels, Shorts) ===
    "1080x1920": { width: 1080, height: 1920, fps: 30, name: "Portrait HD" },
    "1080x1920@60": { width: 1080, height: 1920, fps: 60, name: "Portrait 60fps" },

    // === SQUARE (Instagram Feed) ===
    "1080x1080": { width: 1080, height: 1080, fps: 30, name: "Square" },

    // === LANDSCAPE (YouTube) ===
    "1920x1080": { width: 1920, height: 1080, fps: 30, name: "Landscape HD" },
    "3840x2160": { width: 3840, height: 2160, fps: 30, name: "4K" },

    // === DEVICE-SPECIFIC ===
    "iphone-16-pro": { width: 1290, height: 2796, fps: 60, name: "iPhone 16 Pro" },
    "iphone-15": { width: 1179, height: 2556, fps: 60, name: "iPhone 15" },
    "pixel-8": { width: 1080, height: 2400, fps: 60, name: "Pixel 8" },
} as const;

export type FormatId = keyof typeof FORMATS;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get a format by ID.
 */
export function getFormat(id: FormatId): VideoFormat {
    const format = FORMATS[id];
    if (!format) {
        throw new Error(`Unknown format: ${id}. Available: ${Object.keys(FORMATS).join(", ")}`);
    }
    return format;
}

/**
 * List all available format IDs.
 */
export function listFormats(): FormatId[] {
    return Object.keys(FORMATS) as FormatId[];
}

/**
 * Get formats matching a specific aspect ratio.
 */
export function getFormatsByAspectRatio(aspectRatio: "portrait" | "landscape" | "square"): FormatId[] {
    return listFormats().filter(id => {
        const format = FORMATS[id];
        const ratio = format.width / format.height;

        if (aspectRatio === "portrait") return ratio < 1;
        if (aspectRatio === "landscape") return ratio > 1;
        if (aspectRatio === "square") return ratio === 1;
        return false;
    });
}
