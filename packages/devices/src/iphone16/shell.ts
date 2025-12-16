import { DeviceRegistry } from "../registry";
import { iPhone16Frame } from "./Frame";
import { StatusBar } from "../StatusBar";
import { iPhone16Profile } from "./profile";

// Register the Shell
DeviceRegistry.register({
    id: "iphone16",
    FrameComponent: iPhone16Frame,
    StatusBarComponent: StatusBar,
    cornerRadius: iPhone16Profile.screen.cornerRadius,
    hasDynamicIsland: true
});

export const iPhone16Shell = DeviceRegistry.get("iphone16")!;
