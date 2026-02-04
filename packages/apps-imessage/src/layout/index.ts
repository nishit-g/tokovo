import type { PluginLayoutStrategy } from "@tokovo/core";

export const iMessageLayoutStrategies: PluginLayoutStrategy[] = [
  { viewKind: "imessage-list", computeLayout: () => ({}) },
  { viewKind: "imessage-chat", computeLayout: () => ({}) },
  { viewKind: "imessage-info", computeLayout: () => ({}) },
  { viewKind: "imessage-media", computeLayout: () => ({}) },
];
