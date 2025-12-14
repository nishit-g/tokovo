/**
 * Content Validation
 *
 * Validates content and maps to canonical format.
 *
 * @module @tokovo/compiler/validation/content-validator
 */

import type { ValidationMode, Diagnostic, ValidationResult } from "./scene-validator";

// Local helpers
function error(code: string, message: string, opts?: Partial<Diagnostic>): Diagnostic {
    return { code, message, severity: "error", ...opts };
}

function categorize(diagnostics: Diagnostic[]): ValidationResult {
    const errors = diagnostics.filter((d) => d.severity === "error");
    const warnings = diagnostics.filter((d) => d.severity === "warning");
    const infos = diagnostics.filter((d) => d.severity === "info");
    return { valid: errors.length === 0, errors, warnings, infos };
}

// =============================================================================
// CONTENT TYPES
// =============================================================================

export type ContentKind =
    | "text"
    | "image"
    | "video"
    | "gif"
    | "voice"
    | "sticker"
    | "link"
    | "location"
    | "contact"
    | "file"
    | "system"
    | "deleted";

export interface CanonicalContent {
    readonly kind: ContentKind;
    readonly text?: string;
    readonly url?: string;
    readonly caption?: string;
    readonly duration?: number;
    readonly thumbnailUrl?: string;
    readonly latitude?: number;
    readonly longitude?: number;
    readonly name?: string;
    readonly phone?: string;
    readonly fileName?: string;
    readonly fileSize?: number;
    readonly systemType?: string;
}

export interface MessageInput {
    type?: string;
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    gifUrl?: string;
    voiceUrl?: string;
    stickerUrl?: string;
    url?: string;
    duration?: number;
    caption?: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    contactName?: string;
    contactPhone?: string;
    fileName?: string;
    fileUrl?: string;
    fileSize?: number;
    systemType?: string;
}

// Validation error class
export class ValidationError extends Error {
    readonly diagnostics: ReadonlyArray<Diagnostic>;

    constructor(message: string, diagnostics: Diagnostic[] = []) {
        super(message);
        this.name = "ValidationError";
        this.diagnostics = diagnostics;
    }
}

// =============================================================================
// CONTENT MAPPING
// =============================================================================

export function mapToCanonicalContent(
    msg: MessageInput,
    mode: ValidationMode
): CanonicalContent {
    const type = msg.type || inferContentType(msg);

    switch (type) {
        case "text":
            return mapTextContent(msg, mode);
        case "image":
            return mapImageContent(msg, mode);
        case "video":
            return mapVideoContent(msg, mode);
        case "gif":
            return mapGifContent(msg, mode);
        case "voice":
            return mapVoiceContent(msg, mode);
        case "sticker":
            return mapStickerContent(msg, mode);
        case "link":
            return mapLinkContent(msg, mode);
        case "location":
            return mapLocationContent(msg, mode);
        case "contact":
            return mapContactContent(msg, mode);
        case "file":
            return mapFileContent(msg, mode);
        case "system":
            return mapSystemContent(msg, mode);
        default:
            return { kind: "text", text: msg.text ?? "" };
    }
}

function inferContentType(msg: MessageInput): string {
    if (msg.imageUrl) return "image";
    if (msg.videoUrl) return "video";
    if (msg.gifUrl) return "gif";
    if (msg.voiceUrl || (msg.duration && !msg.videoUrl)) return "voice";
    if (msg.stickerUrl) return "sticker";
    if (msg.url && !msg.imageUrl) return "link";
    if (msg.latitude !== undefined && msg.longitude !== undefined) return "location";
    if (msg.contactName) return "contact";
    if (msg.fileUrl || msg.fileName) return "file";
    if (msg.systemType) return "system";
    return "text";
}

function mapTextContent(msg: MessageInput, mode: ValidationMode): CanonicalContent {
    if (!msg.text && mode === "strict") {
        throw new ValidationError("TextContent requires 'text' field", [
            error("MISSING_REQUIRED_FIELD", "TextContent requires 'text' field"),
        ]);
    }
    return { kind: "text", text: msg.text ?? "" };
}

function mapImageContent(msg: MessageInput, mode: ValidationMode): CanonicalContent {
    if (!msg.imageUrl) {
        if (mode === "strict") {
            throw new ValidationError("ImageContent requires 'url' field", [
                error("MISSING_REQUIRED_FIELD", "ImageContent requires 'url' field"),
            ]);
        }
        return { kind: "image", url: "https://placehold.co/400x300?text=Missing+Image" };
    }
    return { kind: "image", url: msg.imageUrl, caption: msg.caption };
}

function mapVideoContent(msg: MessageInput, mode: ValidationMode): CanonicalContent {
    if (!msg.videoUrl || msg.duration === undefined) {
        if (mode === "strict") {
            throw new ValidationError("VideoContent requires 'url' and 'duration'", [
                error("MISSING_REQUIRED_FIELD", "VideoContent requires 'url' and 'duration'"),
            ]);
        }
        return { kind: "text", text: "[Video]" };
    }
    return {
        kind: "video",
        url: msg.videoUrl,
        thumbnailUrl: msg.thumbnailUrl ?? msg.videoUrl,
        duration: msg.duration,
        caption: msg.caption,
    };
}

function mapGifContent(msg: MessageInput, mode: ValidationMode): CanonicalContent {
    if (!msg.gifUrl) {
        if (mode === "strict") {
            throw new ValidationError("GifContent requires 'url'", [
                error("MISSING_REQUIRED_FIELD", "GifContent requires 'url'"),
            ]);
        }
        return { kind: "text", text: "[GIF]" };
    }
    return { kind: "gif", url: msg.gifUrl };
}

function mapVoiceContent(msg: MessageInput, mode: ValidationMode): CanonicalContent {
    if (msg.duration === undefined) {
        if (mode === "strict") {
            throw new ValidationError("VoiceContent requires 'duration'", [
                error("MISSING_REQUIRED_FIELD", "VoiceContent requires 'duration'"),
            ]);
        }
        return { kind: "voice", duration: 10 };
    }
    return { kind: "voice", url: msg.voiceUrl, duration: msg.duration };
}

function mapStickerContent(msg: MessageInput, mode: ValidationMode): CanonicalContent {
    if (!msg.stickerUrl) {
        if (mode === "strict") {
            throw new ValidationError("StickerContent requires 'url'", [
                error("MISSING_REQUIRED_FIELD", "StickerContent requires 'url'"),
            ]);
        }
        return { kind: "text", text: "[Sticker]" };
    }
    return { kind: "sticker", url: msg.stickerUrl };
}

function mapLinkContent(msg: MessageInput, mode: ValidationMode): CanonicalContent {
    if (!msg.url) {
        if (mode === "strict") {
            throw new ValidationError("LinkContent requires 'url'", [
                error("MISSING_REQUIRED_FIELD", "LinkContent requires 'url'"),
            ]);
        }
        return { kind: "text", text: msg.text ?? "[Link]" };
    }
    return { kind: "link", url: msg.url };
}

function mapLocationContent(msg: MessageInput, mode: ValidationMode): CanonicalContent {
    if (msg.latitude === undefined || msg.longitude === undefined) {
        if (mode === "strict") {
            throw new ValidationError("LocationContent requires 'latitude' and 'longitude'", [
                error("MISSING_REQUIRED_FIELD", "LocationContent requires 'latitude' and 'longitude'"),
            ]);
        }
        return { kind: "text", text: "📍 Location" };
    }
    return { kind: "location", latitude: msg.latitude, longitude: msg.longitude, name: msg.locationName };
}

function mapContactContent(msg: MessageInput, mode: ValidationMode): CanonicalContent {
    if (!msg.contactName) {
        if (mode === "strict") {
            throw new ValidationError("ContactContent requires 'name'", [
                error("MISSING_REQUIRED_FIELD", "ContactContent requires 'name'"),
            ]);
        }
        return { kind: "text", text: "📇 Contact" };
    }
    return { kind: "contact", name: msg.contactName, phone: msg.contactPhone };
}

function mapFileContent(msg: MessageInput, mode: ValidationMode): CanonicalContent {
    if (!msg.fileUrl || !msg.fileName) {
        if (mode === "strict") {
            throw new ValidationError("FileContent requires 'url' and 'fileName'", [
                error("MISSING_REQUIRED_FIELD", "FileContent requires 'url' and 'fileName'"),
            ]);
        }
        return { kind: "text", text: "📎 File" };
    }
    return { kind: "file", url: msg.fileUrl, fileName: msg.fileName, fileSize: msg.fileSize };
}

function mapSystemContent(msg: MessageInput, mode: ValidationMode): CanonicalContent {
    if (!msg.systemType) {
        if (mode === "strict") {
            throw new ValidationError("SystemContent requires 'systemType'", [
                error("MISSING_REQUIRED_FIELD", "SystemContent requires 'systemType'"),
            ]);
        }
        return { kind: "system", systemType: "encryption_notice" };
    }
    return { kind: "system", systemType: msg.systemType, text: msg.text };
}

// =============================================================================
// BATCH VALIDATION
// =============================================================================

export function validateMessages(
    messages: MessageInput[],
    mode: ValidationMode
): { content: CanonicalContent[]; result: ValidationResult } {
    const content: CanonicalContent[] = [];
    const diagnostics: Diagnostic[] = [];

    for (let i = 0; i < messages.length; i++) {
        try {
            content.push(mapToCanonicalContent(messages[i], mode));
        } catch (err) {
            if (err instanceof ValidationError) {
                diagnostics.push(...err.diagnostics);
                if (mode !== "strict") {
                    content.push({ kind: "text", text: "" });
                }
            } else {
                throw err;
            }
        }
    }

    return { content, result: categorize(diagnostics) };
}
