import React from "react";
import { WorldState } from "@tokovo/core";
import { WhatsappChatView } from "@tokovo/apps-whatsapp";
import { InstagramApp } from "@tokovo/apps-instagram";

import { LayoutState } from "./layout/types";

export const AppRegistry = {
    views: {
        "app_whatsapp": WhatsappChatView,
        "app_instagram": InstagramApp
    } as Record<string, React.FC<{ world: WorldState; t?: number; layout?: LayoutState; platform?: string; deviceId?: string }>>,

    getView(appId: string) {
        return this.views[appId];
    }
};
