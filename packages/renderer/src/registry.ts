import React from "react";
import { WorldState } from "@tokovo/core";
import { WhatsappChatView } from "@tokovo/apps-whatsapp";

export const AppRegistry = {
    views: {
        "app_whatsapp": WhatsappChatView
    } as Record<string, React.FC<{ world: WorldState; t?: number; layout?: any }>>,

    getView(appId: string) {
        return this.views[appId];
    }
};
