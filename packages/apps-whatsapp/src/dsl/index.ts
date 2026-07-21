/**
 * WhatsApp DSL Layer - Barrel Export
 * 
 * Track-based WhatsApp authoring surfaces:
 * - track-builder.ts: deterministic point/span DSL
 */

// V2 Track Builder
export {
    WhatsAppTrackBuilder,
    WhatsAppPointBuilder,
    WhatsAppSpanBuilder,
    createWhatsAppTrackBuilder,
    type ReceiveOptions,
    type SendOptions,
    type WhatsAppSendInputOptions,
    type WhatsAppSendInputIntent,
    type AddWhatsAppSendInputIntent,
    type ImageOptions,
} from "./track-builder.js";
