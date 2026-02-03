import { iPhone16Frame } from "./Frame";
import { StatusBar } from "../StatusBar";
import { iPhone16Profile } from "./profile";
import type { DeviceShell } from "../types";
import type { FrameComponent } from "../registries/frame-registry";
import type { StatusBarStrategyComponent } from "../registries/statusbar-registry";

export const iPhone16Shell: DeviceShell = {
  id: "iphone16",
  FrameComponent: iPhone16Frame as FrameComponent,
  StatusBarComponent: StatusBar as StatusBarStrategyComponent,
  cornerRadius: iPhone16Profile.screen.cornerRadius,
  hasDynamicIsland: true,
};
