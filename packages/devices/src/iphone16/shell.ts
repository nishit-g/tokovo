import { iPhone16Frame } from "./Frame.js";
import { StatusBar } from "../StatusBar.js";
import { iPhone16Profile } from "./profile.js";
import type { DeviceShell } from "../types.js";
import type { FrameComponent } from "../registries/frame-registry.js";
import type { StatusBarStrategyComponent } from "../registries/statusbar-registry.js";

export const iPhone16Shell: DeviceShell = {
  id: "iphone16",
  FrameComponent: iPhone16Frame as FrameComponent,
  StatusBarComponent: StatusBar as StatusBarStrategyComponent,
  cornerRadius: iPhone16Profile.screen.cornerRadius,
  hasDynamicIsland: true,
};
