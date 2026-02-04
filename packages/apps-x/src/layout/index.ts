import type { PluginLayoutStrategy } from "@tokovo/core";

export const xLayoutStrategies: PluginLayoutStrategy[] = [
  { viewKind: "x-timeline", computeLayout: () => ({}) },
  { viewKind: "x-tweet", computeLayout: () => ({}) },
  { viewKind: "x-compose", computeLayout: () => ({}) },
  { viewKind: "x-profile", computeLayout: () => ({}) },
  { viewKind: "x-notifications", computeLayout: () => ({}) },
  { viewKind: "x-messages", computeLayout: () => ({}) },
  { viewKind: "x-thread", computeLayout: () => ({}) },
];
