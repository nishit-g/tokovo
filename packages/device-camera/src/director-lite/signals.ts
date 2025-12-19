/**
 * DirectorLite Signal Extraction
 * 
 * Extract camera-relevant signals from runtime events.
 * 
 * @module device-camera/director-lite
 */

import type { DirectorSignal, DirectorSignalType } from "./types";

// =============================================================================
// SIGNAL EXTRACTION
// =============================================================================

interface RuntimeEvent {
    kind: string;
    type: string;
    at: number;
    deviceId?: string;
    appId?: string;
    payload?: Record<string, unknown>;
}

/**
 * Extract camera-relevant signals from a window of events.
 * 
 * @param events - Runtime events to scan
 * @param currentFrame - Current frame number
 * @param windowSize - Number of frames to look back (default: 90)
 * @returns Sorted array of director signals
 */
export function extractSignals(
    events: RuntimeEvent[],
    currentFrame: number,
    windowSize: number = 90
): DirectorSignal[] {
    const windowStart = Math.max(0, currentFrame - windowSize);
    const windowEnd = currentFrame;

    const signals: DirectorSignal[] = [];

    for (const event of events) {
        // Skip events outside window
        if (event.at < windowStart || event.at > windowEnd) continue;

        // Map event types to signal types
        const signalType = mapEventToSignal(event);
        if (!signalType) continue;

        signals.push({
            type: signalType,
            at: event.at,
            deviceId: event.deviceId ?? "default",
            appId: event.appId ?? "unknown",
            conversationId: event.payload?.conversationId as string | undefined,
            messageId: event.payload?.messageId as string | undefined,
        });
    }

    // Sort by frame (ascending)
    signals.sort((a, b) => a.at - b.at);

    return signals;
}

/**
 * Map runtime event type to director signal type.
 */
function mapEventToSignal(event: RuntimeEvent): DirectorSignalType | null {
    const { kind, type } = event;

    // APP events
    if (kind === "APP") {
        switch (type) {
            case "MESSAGE_SEND":
            case "MESSAGE_RECEIVE":
            case "MESSAGE_DELIVERED":
                return "NewMessage";
            case "TYPING_START":
                return "TypingStarted";
            case "TYPING_STOP":
                return "TypingStopped";
            case "MESSAGE_READ":
                return "MessageRead";
        }
    }

    // DEVICE events
    if (kind === "DEVICE") {
        switch (type) {
            case "CALL_INCOMING":
                return "CallIncoming";
            case "CALL_CONNECT":
                return "CallConnected";
            case "CALL_END":
                return "CallEnded";
            case "NOTIFICATION_SHOW":
                return "NotificationShown";
        }
    }

    return null;
}
