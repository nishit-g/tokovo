import { ReducerRegistry } from "@tokovo/core";
import { instagramRuntime } from "./runtime";

ReducerRegistry.registerAppReducer("app_instagram", instagramRuntime);

export * from "./runtime";
export * from "./ui";
export * from "./types";
import { AppRegistry, APP_IDS } from "@tokovo/core";
import { InstagramApp } from "./ui";

AppRegistry.register(APP_IDS.INSTAGRAM, InstagramApp as any);

export * from "./notification-adapter";
