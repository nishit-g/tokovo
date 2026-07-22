import { describe, expect, it } from "vitest";
import { OSDirectorPlugin } from "./os-director.plugin.js";
import type { CompilerContext } from "./types.js";

function createContext(fps: number): CompilerContext {
  return {
    fps,
    durationInFrames: 300,
    devices: [],
  };
}

describe("OSDirectorPlugin", () => {
  it("rejects invalid start times", () => {
    expect(() => new OSDirectorPlugin({ deviceId: "phone", startTime: "not-a-date" })).toThrow(
      /Invalid startTime/,
    );
  });

  it("rejects update intervals smaller than one frame", () => {
    const plugin = new OSDirectorPlugin({ deviceId: "phone", updateInterval: "0.01s" });

    expect(() => plugin.process([], createContext(30))).toThrow(/smaller than one frame/);
  });
});
