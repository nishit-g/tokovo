import React from "react";
import { WorldState } from "@tokovo/core";
import { WhatsappChatView } from "@tokovo/apps-whatsapp";
import { InstagramChatView } from "@tokovo/apps-instagram";

export const AppRegistry = {
    views: {
        "app_whatsapp": WhatsappChatView,
        "app_instagram": InstagramChatView
    } as Record<string, React.FC<{ world: WorldState; t?: number; layout?: any }>>,

    getView(appId: string) {
        return this.views[appId];
    }
};
