import React from "react";
import { WorldState, LayoutState, APP_IDS } from "@tokovo/core";
import { WhatsappChatView } from "../ui";
import { WhatsappListView } from "./WhatsappListView";

export const WhatsappApp: React.FC<{
    world: WorldState;
    t: number;
    layout?: LayoutState;
    deviceId?: string;
    platform?: any;
}> = (props) => {
    const { world } = props;

    // Determine which view to show
    // 1. Check world.appState.whatsapp.currentChatId
    // 2. Fallback: If only 1 conversation, show it (classic simulation mode)
    // 3. Fallback: Show List View

    const appState = world.appState?.[APP_IDS.WHATSAPP] as any;
    const currentChatId = appState?.currentChatId;

    const convIds = Object.keys(world.conversations);

    // If currentChatId is set, show chat.
    // If not, and there is exactly one conversation (and we are in a targeted simulation like 'whatsappPsychoticDemo'),
    // we default to chat view because existing tests/demos expect that.

    const shouldShowChat = currentChatId || (convIds.length === 1 && !appState?.showList);

    if (shouldShowChat) {
        return <WhatsappChatView {...props} />;
    }

    return <WhatsappListView {...props} />;
};
