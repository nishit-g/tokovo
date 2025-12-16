export * from "./types";
export * from "./runtime";
export * from "./components";
export * from "./types";
export * from "./ui";
export * from "./provider";

import { AnchorRegistry } from "@tokovo/core";
import { WhatsAppAnchorProvider } from "./provider";

// Self-register on import
AnchorRegistry.register(WhatsAppAnchorProvider);
export * from "./plugin";
export * from "./components";
export * from "./config";
export * from "./camera";
export * from "./notification-adapter";
export * from "./behaviors";


import { AppRegistry, APP_IDS, SoundRegistry } from "@tokovo/core";
import { WhatsappChatView } from "./ui";

AppRegistry.register(APP_IDS.WHATSAPP, WhatsappChatView as any);

// Register Sounds
SoundRegistry.registerMany({
    "whatsapp_sent": "whatsapp-sent.mp3",
    "whatsapp_received": "whatsapp-received.mp3",
    "whatsapp_typing": "typing.mp3",
});

// Register Metadata
import "./metadata";

export * from "./layout";

// Type Augmentation
declare module "@tokovo/core" {
    interface AppScreens {
        "app_whatsapp": "chat" | "list" | "status" | "settings";
        // Support short alias if used
        "whatsapp": "chat" | "list" | "status" | "settings";
    }
}
