import { describe, expect, it, vi } from "vitest";
import type { TrackEvent } from "@tokovo/ir";
import { CameraDirectorPlugin } from "./camera-director.plugin.js";

describe("CameraDirectorPlugin", () => {
  it("converts animate camera effects into runtime camera events", () => {
    const plugin = new CameraDirectorPlugin();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const output = plugin.process(
      [
        {
          at: 10,
          kind: "APP",
          appId: "app_whatsapp",
          type: "MESSAGE_RECEIVED",
          payload: { from: "them", text: "hello" },
        } as TrackEvent,
        {
          at: 18,
          kind: "APP",
          appId: "app_whatsapp",
          type: "MESSAGE_RECEIVED",
          payload: { from: "them", text: "again" },
        } as TrackEvent,
      ],
      { fps: 30 } as never,
    );

    expect(output.some((event) => event.kind === "CAMERA")).toBe(true);
    expect(
      output.some(
        (event) =>
          event.kind === "CAMERA" &&
          event.type === "ZOOM" &&
          typeof (event.payload as { translateY?: unknown })?.translateY ===
            "number",
      ),
    ).toBe(true);
    expect(warnSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Unsupported effect type: animate"),
    );

    warnSpy.mockRestore();
  });
});
