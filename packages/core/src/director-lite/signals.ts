/**
 * DirectorLite Signal Extraction
 *
 * Extract DirectorSignals from timeline events.
 * Uses REAL message IDs from event payloads.
 */

import { TimelineEvent } from "../types";
import { DirectorSignal, SignalType } from "./types";

/**
 * Extract director signals from timeline events.
 *
 * @param events - Events in the signal window (caller filters by frame range)
 * @param deviceId - Scope signals to this device
 * @param appId - Scope signals to this app
 * @returns Signals sorted by `at` (ascending)
 */
export function extractSignals(
    events: TimelineEvent[],
    deviceId: string,
    appId: string
): DirectorSignal[] {
    const signals: DirectorSignal[] = [];

    for (const event of events) {
        const base = {
            deviceId,
            appId,
            at: event.at,
        };

        if (event.kind === "APP" && (event as any).appId === appId) {
            const appEvent = event as any;

            switch (event.type) {
                case "TYPING_START":
                    signals.push({
                        ...base,
                        type: "TypingStarted",
                        conversationId: appEvent.conversationId,
                        from: appEvent.from,
                    });
                    break;

                case "TYPING_END":
                    signals.push({
                        ...base,
                        type: "TypingEnded",
                        conversationId: appEvent.conversationId,
                        from: appEvent.from,
                    });
                    break;

                case "MESSAGE_RECEIVED": {
                    // REAL ID: Use message.id from payload, fallback to runtime pattern
                    const messageId =
                        appEvent.message?.id || `msg_${event.at}_${appEvent.from}`;
                    signals.push({
                        ...base,
                        type: "NewMessage",
                        conversationId: appEvent.conversationId,
                        messageId,
                        from: appEvent.from,
                    });
                    break;
                }

                case "MESSAGE_READ":
                    if (appEvent.messageId) {
                        signals.push({
                            ...base,
                            type: "MessageRead",
                            conversationId: appEvent.conversationId,
                            messageId: appEvent.messageId,
                        });
                    }
                    break;
            }
        }

        if (event.kind === "DEVICE") {
            const deviceEvent = event as any;
            if (deviceEvent.deviceId === deviceId) {
                switch (event.type) {
                    case "INCOMING_CALL":
                        signals.push({
                            ...base,
                            type: "CallIncoming",
                        });
                        break;
                }
            }
        }
    }

    // Return sorted by `at` (ascending) - required by derive function
    return signals.sort((a, b) => a.at - b.at);
}
