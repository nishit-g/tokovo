/**
 * WhatsApp DSL Layer - Barrel Export
 * 
 * DSL extensions for WhatsApp authoring:
 * - extension.ts: b.use("app_whatsapp") API for beat DSL
 * - track-builder.ts: V2 track-based DSL
 * - group-builder.ts: Group operations DSL
 */

// b.use() Extension (Legacy beat DSL)
export { whatsappDsl, type WhatsAppDslApi } from "./extension";

// V2 Track Builder
export {
    WhatsAppTrackBuilder,
    WhatsAppPointBuilder,
    WhatsAppSpanBuilder,
    createWhatsAppTrackBuilder,
    type ReceiveOptions,
    type SendOptions,
    type ImageOptions,
    type TypingOptions,
} from "./track-builder";

// Group Builder
export * from "./group-builder";
