import type { TokovoPluginContract, PluginViews } from "@tokovo/core";
import { PluginManager } from "@tokovo/core";
import { DemoView } from "./ui";
import { demoReducer } from "./runtime/reducer";
import { demoLowering } from "./lowering";
import { demoDsl } from "./dsl";
import { demoLayoutStrategies } from "./layout";
import { demoAnchors } from "./runtime/adapters/anchors";

// Assemble views object
const demoViews: PluginViews = {
  AppRoot: DemoView,
};

// Plugin contract definition
export const DemoPlugin: TokovoPluginContract<"app_demo"> = {
  id: "app_demo",
  displayName: "Demo Notes",
  views: demoViews,
  reducer: demoReducer,
  lowering: demoLowering,
  dsl: demoDsl,
  layout: demoLayoutStrategies,
  anchors: demoAnchors,
};

// Registration function with guard
let _registered = false;

export function registerDemoPlugin(): void {
  if (_registered) return;
  _registered = true;
  PluginManager.register(DemoPlugin);
}
