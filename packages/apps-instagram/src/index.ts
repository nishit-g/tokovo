import { definePlugin, APP_IDS } from "@tokovo/core";
import { instagramRuntime } from "./runtime";
import { InstagramApp } from "./ui";
import { InstagramNotificationAdapter } from "./notification-adapter";

export * from "./runtime";
export * from "./ui";
export * from "./types";
export * from "./notification-adapter";

export const Instagram = definePlugin({
    id: "app_instagram",
    name: "Instagram",
    version: "1.0.0",

    // 1. Metadata
    metadata: {
        name: "Instagram",
        icon: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
        themeColor: "#E1306C",
        version: "1.0.0",
    },

    // 2. View
    appView: InstagramApp as any,

    // 3. Logic
    reducer: instagramRuntime as any,

    // 4. Notifications
    notificationAdapter: InstagramNotificationAdapter as any,
});

export default Instagram;
