import { ReducerRegistry } from "@tokovo/core";
import { instagramRuntime } from "./runtime";

ReducerRegistry.registerAppReducer("app_instagram", instagramRuntime);

export * from "./runtime";
export * from "./ui";
export * from "./types";
