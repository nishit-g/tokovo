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


export * from "./layout";
