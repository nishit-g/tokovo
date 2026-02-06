import { describe, expect, it } from "vitest";
import { createDeviceRegistries, createFrameRegistry } from "../registries/index.js";
import type { FrameComponent } from "../registries/index.js";

const DummyFrame: FrameComponent = () => null;

describe("device registries", () => {
  it("isolates registrations across registry bundles", () => {
    const registriesA = createDeviceRegistries();
    const registriesB = createDeviceRegistries();

    registriesA.frames.register("iphone16", DummyFrame);
    expect(registriesA.frames.get("iphone16")).toBe(DummyFrame);
    expect(registriesB.frames.get("iphone16")).toBeUndefined();
  });

  it("allows custom registry injection", () => {
    const customFrames = createFrameRegistry();
    const registries = createDeviceRegistries({ frames: customFrames });
    expect(registries.frames).toBe(customFrames);
  });
});
