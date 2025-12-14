/**
 * Canonical Content Types
 *
 * DISCRIMINATED UNIONS - each content type has required fields.
 * TypeScript enforces: ImageContent must have url, VideoContent must have duration, etc.
 *
 * This eliminates the "optional soup" problem where `kind: "image"` could have no `url`.
 *
 * @module @tokovo/core/canonical/content
 */

// =============================================================================
// TEXT CONTENT
// =============================================================================

/**
 * Text message content.
 */
export interface TextContent {
    readonly kind: "text";
    /** Message text (required) */
    readonly text: string;
}

// =============================================================================
// IMAGE CONTENT
// =============================================================================

/**
 * Image message content.
 */
export interface ImageContent {
    readonly kind: "image";
    /** Image URL (required) */
    readonly url: string;
    /** Optional caption */
    readonly caption?: string;
    /** Image dimensions for layout */
    readonly width?: number;
    readonly height?: number;
}

// =============================================================================
// VIDEO CONTENT
// =============================================================================

/**
 * Video message content.
 */
export interface VideoContent {
    readonly kind: "video";
    /** Video URL (required) */
    readonly url: string;
    /** Thumbnail URL (required for preview) */
    readonly thumbnailUrl: string;
    /** Duration in seconds (required for timing) */
    readonly duration: number;
    /** Optional caption */
    readonly caption?: string;
    /** Video dimensions for layout */
    readonly width?: number;
    readonly height?: number;
}

// =============================================================================
// GIF CONTENT
// =============================================================================

/**
 * GIF message content.
 */
export interface GifContent {
    readonly kind: "gif";
    /** GIF URL (required) */
    readonly url: string;
    /** GIF dimensions for layout */
    readonly width?: number;
    readonly height?: number;
}

// =============================================================================
// VOICE CONTENT
// =============================================================================

/**
 * Voice note content.
 *
 * RENDERING CONTRACT:
 * - If `url` is provided: play actual audio, show waveform
 * - If `url` is missing: render placeholder waveform animation
 *   (used for simulation/prototyping without real assets)
 *
 * Duration is ALWAYS required for timing and progress bar.
 */
export interface VoiceContent {
    readonly kind: "voice";
    /** Audio URL (optional for simulation mode) */
    readonly url?: string;
    /** Duration in seconds (required for timing) */
    readonly duration: number;
    /** Waveform data for visualization (optional) */
    readonly waveform?: ReadonlyArray<number>; // 0-1 amplitude values
}

// =============================================================================
// STICKER CONTENT
// =============================================================================

/**
 * Sticker message content.
 */
export interface StickerContent {
    readonly kind: "sticker";
    /** Sticker image URL (required) */
    readonly url: string;
    /** Sticker pack name */
    readonly pack?: string;
    /** Sticker dimensions */
    readonly width?: number;
    readonly height?: number;
}

// =============================================================================
// LINK CONTENT
// =============================================================================

/**
 * Link preview content.
 */
export interface LinkContent {
    readonly kind: "link";
    /** Link URL (required) */
    readonly url: string;
    /** Preview title */
    readonly title?: string;
    /** Preview description */
    readonly description?: string;
    /** Preview image URL */
    readonly image?: string;
    /** Site name (e.g., "YouTube", "Twitter") */
    readonly siteName?: string;
}

// =============================================================================
// LOCATION CONTENT
// =============================================================================

/**
 * Location share content.
 */
export interface LocationContent {
    readonly kind: "location";
    /** Latitude (required) */
    readonly latitude: number;
    /** Longitude (required) */
    readonly longitude: number;
    /** Location name (e.g., "Home", "Starbucks") */
    readonly name?: string;
    /** Full address */
    readonly address?: string;
}

// =============================================================================
// CONTACT CONTENT
// =============================================================================

/**
 * Contact card content.
 */
export interface ContactContent {
    readonly kind: "contact";
    /** Contact display name (required) */
    readonly name: string;
    /** Phone number */
    readonly phone?: string;
    /** Email address */
    readonly email?: string;
    /** Avatar URL */
    readonly avatarUrl?: string;
}

// =============================================================================
// FILE CONTENT
// =============================================================================

/**
 * File attachment content.
 */
export interface FileContent {
    readonly kind: "file";
    /** File URL (required) */
    readonly url: string;
    /** File name (required) */
    readonly fileName: string;
    /** File size in bytes */
    readonly fileSize?: number;
    /** MIME type */
    readonly mimeType?: string;
}

// =============================================================================
// SYSTEM CONTENT
// =============================================================================

/**
 * System message types.
 */
export type SystemMessageType =
    | "member_added"
    | "member_removed"
    | "admin_change"
    | "group_created"
    | "name_changed"
    | "screenshot"
    | "missed_call"
    | "call_ended"
    | "encryption_notice"
    | "disappearing_on"
    | "disappearing_off";

/**
 * System message content.
 */
export interface SystemContent {
    readonly kind: "system";
    /** System message type (required) */
    readonly systemType: SystemMessageType;
    /** Actor who triggered the system message */
    readonly actor?: string;
    /** Target of the action (e.g., added member) */
    readonly target?: string;
    /** Rendered text (computed if not provided) */
    readonly text?: string;
}

// =============================================================================
// DELETED CONTENT
// =============================================================================

/**
 * Deleted message placeholder.
 */
export interface DeletedContent {
    readonly kind: "deleted";
    /** When the message was deleted (frame number) */
    readonly deletedAt?: number;
    /** Whether it was deleted by me */
    readonly deletedByMe?: boolean;
}

// =============================================================================
// CANONICAL CONTENT UNION
// =============================================================================

/**
 * Union of all content types.
 *
 * TypeScript enforces required fields per kind:
 * - kind: "text" → must have text
 * - kind: "image" → must have url
 * - kind: "video" → must have url, thumbnailUrl, duration
 * - kind: "voice" → must have duration
 * - etc.
 */
export type CanonicalContent =
    | TextContent
    | ImageContent
    | VideoContent
    | GifContent
    | VoiceContent
    | StickerContent
    | LinkContent
    | LocationContent
    | ContactContent
    | FileContent
    | SystemContent
    | DeletedContent;

/**
 * All possible content kinds.
 */
export type ContentKind = CanonicalContent["kind"];

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if content is text.
 */
export function isTextContent(c: CanonicalContent): c is TextContent {
    return c.kind === "text";
}

/**
 * Check if content is image.
 */
export function isImageContent(c: CanonicalContent): c is ImageContent {
    return c.kind === "image";
}

/**
 * Check if content is video.
 */
export function isVideoContent(c: CanonicalContent): c is VideoContent {
    return c.kind === "video";
}

/**
 * Check if content is GIF.
 */
export function isGifContent(c: CanonicalContent): c is GifContent {
    return c.kind === "gif";
}

/**
 * Check if content is voice.
 */
export function isVoiceContent(c: CanonicalContent): c is VoiceContent {
    return c.kind === "voice";
}

/**
 * Check if content is sticker.
 */
export function isStickerContent(c: CanonicalContent): c is StickerContent {
    return c.kind === "sticker";
}

/**
 * Check if content is link.
 */
export function isLinkContent(c: CanonicalContent): c is LinkContent {
    return c.kind === "link";
}

/**
 * Check if content is location.
 */
export function isLocationContent(c: CanonicalContent): c is LocationContent {
    return c.kind === "location";
}

/**
 * Check if content is contact.
 */
export function isContactContent(c: CanonicalContent): c is ContactContent {
    return c.kind === "contact";
}

/**
 * Check if content is file.
 */
export function isFileContent(c: CanonicalContent): c is FileContent {
    return c.kind === "file";
}

/**
 * Check if content is system message.
 */
export function isSystemContent(c: CanonicalContent): c is SystemContent {
    return c.kind === "system";
}

/**
 * Check if content is deleted.
 */
export function isDeletedContent(c: CanonicalContent): c is DeletedContent {
    return c.kind === "deleted";
}

/**
 * Check if content has media (image, video, gif, voice, sticker, file).
 */
export function isMediaContent(
    c: CanonicalContent
): c is ImageContent | VideoContent | GifContent | VoiceContent | StickerContent | FileContent {
    return ["image", "video", "gif", "voice", "sticker", "file"].includes(c.kind);
}

/**
 * Get text representation of content for search/preview.
 */
export function getContentText(c: CanonicalContent): string {
    switch (c.kind) {
        case "text":
            return c.text;
        case "image":
            return c.caption ?? "📷 Photo";
        case "video":
            return c.caption ?? "🎬 Video";
        case "gif":
            return "GIF";
        case "voice":
            return "🎤 Voice message";
        case "sticker":
            return "Sticker";
        case "link":
            return c.title ?? c.url;
        case "location":
            return c.name ?? "📍 Location";
        case "contact":
            return `📇 ${c.name}`;
        case "file":
            return `📎 ${c.fileName}`;
        case "system":
            return c.text ?? c.systemType;
        case "deleted":
            return "🚫 This message was deleted";
    }
}
