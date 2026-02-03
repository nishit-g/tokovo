import { describe, expect, it, vi } from "vitest";
import { getSoundPath, SoundRegistry } from "../audio/sounds";
import { AudioLogger } from "../engine/logger";

describe("audio sounds", () => {
  it("resolves sound paths with fallbacks", () => {
    SoundRegistry.clear();

    expect(getSoundPath("/absolute.mp3")).toBe("absolute.mp3");
    expect(getSoundPath("folder/file.mp3")).toBe("folder/file.mp3");

    SoundRegistry.register("ding", "ding.mp3");
    expect(getSoundPath("ding")).toBe("sounds/ding.mp3");

    const spy = vi.spyOn(AudioLogger, "soundPathFallback");
    expect(getSoundPath("missing")).toBe("sounds/missing.mp3");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
