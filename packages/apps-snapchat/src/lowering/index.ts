import type { TrackEvent } from "@tokovo/ir";
import { getLoweringScratchpad, planTypedKeyboard, type RuntimeEvent } from "@tokovo/core";
import type { SnapchatTrackEvent, SnapchatEventType, SnapchatEventPayload } from "../types/index.js";

export interface SnapchatLoweringHandler {
    lower: (event: TrackEvent, ctx?: unknown) => RuntimeEvent[];
}

function isSnapchatEvent(event: TrackEvent): boolean {
    return (
        (event as { kind?: string }).kind === "APP" &&
        (event as { appId?: string }).appId === "app_snapchat"
    );
}

function createRuntimeEvent(
    event: TrackEvent,
    type: SnapchatEventType,
    payload: SnapchatEventPayload,
): RuntimeEvent {
    return {
        at: event.at,
        kind: "APP",
        appId: "app_snapchat",
        type,
        payload,
        deviceId: event.deviceId,
    } as RuntimeEvent;
}

type SnapchatLoweringScratchpad = { lastEventAtByConversation: Map<string, number> };

function expandTypedSend(event: TrackEvent, ctx?: unknown): RuntimeEvent[] {
    const payload = ((event as { payload?: unknown }).payload ?? {}) as {
        conversationId?: string;
        text?: string;
        typed?: boolean;
        charDelay?: number;
    };

    const text = payload.text ?? "";
    const deviceId = event.deviceId ?? "";
    const sendAt = event.at;
    const conversationId = payload.conversationId;

    if (!text) {
        return [createRuntimeEvent(event, (event as { type: string }).type as SnapchatEventType, payload as SnapchatEventPayload)];
    }

    const scratchpad = getLoweringScratchpad<SnapchatLoweringScratchpad>(
        ctx,
        "app_snapchat.lowering",
        () => ({ lastEventAtByConversation: new Map() }),
    );
    const key = `${deviceId}::${conversationId ?? "unknown"}`;
    const prevAt = scratchpad.lastEventAtByConversation.get(key) ?? 0;
    const notBeforeFrame = prevAt > 0 ? prevAt + 2 : 0;

    const plan = planTypedKeyboard({
        deviceId,
        submitAt: sendAt,
        text,
        requestedCharDelay: payload.charDelay ?? 3,
        notBeforeFrame,
        keyboardType: "default",
        returnKeyType: "send",
    });

    scratchpad.lastEventAtByConversation.set(key, Math.max(prevAt, sendAt));

    const appSendEvent = createRuntimeEvent(
        event,
        (event as { type: string }).type as SnapchatEventType,
        payload as SnapchatEventPayload,
    );

    if (!plan.ok) {
        return [appSendEvent];
    }

    const [showEv, typeEv, pressEv, hideEv] = plan.events;
    return [showEv, typeEv, pressEv, appSendEvent, hideEv];
}

export const snapchatV2Lowering: SnapchatLoweringHandler = {
    lower: (event: TrackEvent, ctx?: unknown): RuntimeEvent[] => {
        if (!isSnapchatEvent(event)) return [];

        const type = (event as { type?: string }).type as SnapchatEventType | undefined;
        if (!type) return [];
        const payload = ((event as { payload?: unknown }).payload ?? {}) as SnapchatEventPayload;

        if (type === "SNAPCHAT_MESSAGE_SEND" && (payload as { typed?: boolean }).typed) {
            return expandTypedSend(event, ctx);
        }

        // Update last-seen timestamp for conversation-scoped timing heuristics.
        const conversationId =
            (payload as { conversationId?: string }).conversationId ??
            (event as { conversationId?: string }).conversationId;
        if (conversationId) {
            const scratchpad = getLoweringScratchpad<SnapchatLoweringScratchpad>(
                ctx,
                "app_snapchat.lowering",
                () => ({ lastEventAtByConversation: new Map() }),
            );
            const key = `${event.deviceId}::${conversationId}`;
            const prevAt = scratchpad.lastEventAtByConversation.get(key) ?? 0;
            scratchpad.lastEventAtByConversation.set(key, Math.max(prevAt, event.at));
        }

        return [createRuntimeEvent(event, type, payload)];
    },
};
