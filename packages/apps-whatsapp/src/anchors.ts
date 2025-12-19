/**
 * WhatsApp Anchor Provider
 * 
 * Provides semantic anchors for camera focus operations.
 * Anchors are computed at runtime based on message layout.
 * 
 * Usage in DSL:
 *   camera.focus("app_whatsapp:last-message");
 *   camera.focus("app_whatsapp:message-{id}");
 *   camera.focus("app_whatsapp:profile");
 *   camera.focus("app_whatsapp:header");
 */

import type { AnchorProvider, AnchorMap, DOMRect } from "@tokovo/core";

// =============================================================================
// ANCHOR IDS
// =============================================================================

export const WHATSAPP_ANCHORS = {
    HEADER: "header",
    PROFILE: "profile",
    INPUT: "input",
    TYPING: "typing",
    LAST_MESSAGE: "last-message",
    MESSAGE: "message", // message-{id}
} as const;

// =============================================================================
// ANCHOR PROVIDER
// =============================================================================

/**
 * WhatsApp anchor provider implementation.
 * Returns anchor points for camera focus.
 */
export const whatsappAnchorProvider: AnchorProvider = {
    appId: "app_whatsapp",

    /**
     * Compute anchors from current DOM layout.
     * Called by the anchor system when camera.focus is triggered.
     */
    getAnchors(containerRef: HTMLElement | null): AnchorMap {
        if (!containerRef) return {};

        const anchors: AnchorMap = {};

        // Header anchor
        const header = containerRef.querySelector('[data-anchor="header"]');
        if (header) {
            anchors["header"] = getElementRect(header as HTMLElement, containerRef);
        }

        // Profile anchor (avatar in header)
        const profile = containerRef.querySelector('[data-anchor="profile"]');
        if (profile) {
            anchors["profile"] = getElementRect(profile as HTMLElement, containerRef);
        }

        // Input bar anchor
        const input = containerRef.querySelector('[data-anchor="input"]');
        if (input) {
            anchors["input"] = getElementRect(input as HTMLElement, containerRef);
        }

        // Typing indicator anchor
        const typing = containerRef.querySelector('[data-anchor="typing"]');
        if (typing) {
            anchors["typing"] = getElementRect(typing as HTMLElement, containerRef);
        }

        // Message anchors (all messages with data-message-id)
        const messages = containerRef.querySelectorAll('[data-message-id]');
        let lastMessageId: string | null = null;

        messages.forEach((msg) => {
            const msgElement = msg as HTMLElement;
            const messageId = msgElement.dataset.messageId;
            if (messageId) {
                anchors[`message-${messageId}`] = getElementRect(msgElement, containerRef);
                lastMessageId = messageId;
            }
        });

        // Last message shorthand
        if (lastMessageId) {
            anchors["last-message"] = anchors[`message-${lastMessageId}`];
        }

        return anchors;
    },
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get element rect relative to container.
 */
function getElementRect(element: HTMLElement, container: HTMLElement): DOMRect {
    const elemRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return {
        x: elemRect.left - containerRect.left,
        y: elemRect.top - containerRect.top,
        width: elemRect.width,
        height: elemRect.height,
        top: elemRect.top - containerRect.top,
        left: elemRect.left - containerRect.left,
        right: elemRect.right - containerRect.left,
        bottom: elemRect.bottom - containerRect.top,
    } as DOMRect;
}

/**
 * Register WhatsApp anchors with the anchor system.
 */
export function registerWhatsAppAnchors(): void {
    // Registration happens via plugin system
    console.log("[WhatsApp] Anchor provider registered");
}
